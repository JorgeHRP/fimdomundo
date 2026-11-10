"""Servidor do "Monte seu fim do mundo" (Hostinger + EasyPanel).

O site é estático. Este servidor existe pela segurança:
- serve SÓ os arquivos da lista branca, carregados na memória na partida
  (nenhum caminho pedido pelo visitante chega ao disco);
- só GET/HEAD; cabeçalhos de segurança; gzip e cache;
- limite por IP e BANIMENTO AUTOMÁTICO:
    armadilha (wp-admin, .env, .git, .php, ../ ...) -> ban na hora, 24 h, dobrando a cada volta até 30 dias
    método proibido (POST, PUT...)                  -> ban 1 h
    flood (BAN_10S pedidos em 10 s)                 -> ban 1 h
- IPv6 é banido pelo bloco /64 (senão o atacante troca de endereço à vontade).

Variáveis de ambiente (todas opcionais):
  PORT           porta (padrão 8000)
  BANS_ARQUIVO   onde salvar os bans (padrão ./bans.json; no EasyPanel use um volume, ex.: /data/bans.json)
  IPS_LIVRES     IPs que nunca são limitados nem banidos, separados por vírgula (o seu)
  LIMITE_10S     acima disso em 10 s responde 429 (padrão 400)
  BAN_10S        acima disso em 10 s bane 1 h (padrão 1200)
"""
import asyncio
import gzip
import hashlib
import ipaddress
import json
import os
import re
import time
from pathlib import Path

import uvicorn

RAIZ = Path(__file__).resolve().parent
PORTA = int(os.environ.get("PORT", "8000"))
ARQ_BANS = Path(os.environ.get("BANS_ARQUIVO", str(RAIZ / "bans.json")))
IPS_LIVRES = {x.strip() for x in os.environ.get("IPS_LIVRES", "").split(",") if x.strip()}
LIMITE_10S = int(os.environ.get("LIMITE_10S", "400"))
BAN_10S = int(os.environ.get("BAN_10S", "1200"))

LISTA_BRANCA = re.compile(
    r"^(index\.html|fundo\.html|app\.js|fundo-ponte\.js|estilo\.css"
    r"|(cenas|acessorios|corpos|fontes|vendor)/[A-Za-z0-9_-]+\.(jpg|webp|woff2|css|js))$"
)
ARMADILHA = re.compile(
    r"(wp-|xmlrpc|phpmyadmin|/pma|\.git|\.env|\.svn|\.aws|\.ds_store|cgi-bin|/admin|/login|/config"
    r"|\.php|\.asp|\.jsp|\.cgi|/etc/passwd|\.\.|%2e%2e|%00|<|>|%3c|%3e"
    r"|union.+select|select.+from|insert.+into|base64_|javascript:|eval\(|sleep\()",
    re.I,
)
TIPOS = {
    ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8", ".jpg": "image/jpeg", ".webp": "image/webp", ".woff2": "font/woff2",
}
SEGURANCA = [
    (b"content-security-policy", b"frame-ancestors 'self'; upgrade-insecure-requests"),
    (b"x-frame-options", b"SAMEORIGIN"),
    (b"x-content-type-options", b"nosniff"),
    (b"referrer-policy", b"no-referrer"),
    (b"permissions-policy", b"camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), bluetooth=(), browsing-topics=()"),
    (b"cross-origin-opener-policy", b"same-origin"),
    (b"strict-transport-security", b"max-age=31536000"),
]
# Faixas do Cloudflare (pra pegar o IP real se o site estiver atrás dele)
CLOUDFLARE = [ipaddress.ip_network(r) for r in (
    "173.245.48.0/20", "103.21.244.0/22", "103.22.200.0/22", "103.31.4.0/22", "141.101.64.0/18",
    "108.162.192.0/18", "190.93.240.0/20", "188.114.96.0/20", "197.234.240.0/22", "198.41.128.0/17",
    "162.158.0.0/15", "104.16.0.0/13", "104.24.0.0/14", "172.64.0.0/13", "131.0.72.0/22",
    "2400:cb00::/32", "2606:4700::/32", "2803:f800::/32", "2405:b500::/32", "2405:8100::/32",
    "2a06:98c0::/29", "2c0f:f248::/32",
)]


# ---------- arquivos na memória ----------
def carregar_arquivos():
    arqs = {}
    for p in sorted(RAIZ.rglob("*")):
        if not p.is_file():
            continue
        rel = p.relative_to(RAIZ).as_posix()
        if not LISTA_BRANCA.match(rel):
            continue
        dados = p.read_bytes()
        tipo = TIPOS[p.suffix.lower()]
        texto = tipo.startswith("text/")
        arqs["/" + rel] = {
            "dados": dados,
            "gz": gzip.compress(dados, 9) if texto and len(dados) > 1024 else None,
            "tipo": tipo.encode(),
            "etag": ('"' + hashlib.sha256(dados).hexdigest()[:20] + '"').encode(),
            "cache": b"no-cache" if p.suffix == ".html" else b"public, max-age=604800",
        }
    arqs["/"] = arqs["/index.html"]
    return arqs


ARQUIVOS = carregar_arquivos()


# ---------- IP do visitante ----------
def _ip(txt):
    try:
        return ipaddress.ip_address(txt.strip())
    except ValueError:
        return None


def ip_cliente(scope):
    """IP real. Só confia no X-Forwarded-For se a conexão vier de rede privada (o proxy do EasyPanel)."""
    par = _ip((scope.get("client") or ("0.0.0.0", 0))[0]) or ipaddress.ip_address("0.0.0.0")
    if not par.is_private and not par.is_loopback:
        return par  # exposto direto na internet: não confia em cabeçalho nenhum
    cab = {k.lower(): v.decode("latin-1") for k, v in scope.get("headers", [])}
    xff = [x for x in cab.get(b"x-forwarded-for", "").split(",") if x.strip()]
    ip = _ip(xff[-1]) if xff else None  # o último é o que o proxy viu
    if ip and any(ip in r for r in CLOUDFLARE):
        real = _ip(cab.get(b"cf-connecting-ip", ""))  # só vale se quem entregou é mesmo o Cloudflare
        if real:
            ip = real
    return ip or par


def chave(ip):
    if ip.version == 6:
        return str(ipaddress.ip_network(f"{ip}/64", strict=False))
    return str(ip)


# ---------- bans ----------
BANS = {}       # chave -> {"ate": epoch, "nivel": n, "motivo": str}
CONTAGEM = {}   # chave -> [inicio_janela, n]
_salvar_pendente = False


def carregar_bans():
    try:
        dados = json.loads(ARQ_BANS.read_text(encoding="utf-8"))
        agora = time.time()
        for k, v in dados.items():
            if isinstance(v, dict) and v.get("ate", 0) > agora - 40 * 86400:
                BANS[k] = {"ate": float(v["ate"]), "nivel": int(v.get("nivel", 0)), "motivo": str(v.get("motivo", ""))[:40]}
    except (OSError, ValueError):
        pass


def salvar_bans():
    global _salvar_pendente
    _salvar_pendente = False
    try:
        ARQ_BANS.parent.mkdir(parents=True, exist_ok=True)
        tmp = ARQ_BANS.with_suffix(".tmp")
        tmp.write_text(json.dumps(BANS), encoding="utf-8")
        tmp.replace(ARQ_BANS)
    except OSError as e:
        print("aviso: não salvei os bans:", e, flush=True)


def banir(k, motivo, base_s):
    global _salvar_pendente
    ant = BANS.get(k)
    nivel = (ant["nivel"] + 1) if ant else 0
    dur = min(base_s * (2 ** nivel), 30 * 86400)
    BANS[k] = {"ate": time.time() + dur, "nivel": nivel, "motivo": motivo}
    print(f"BAN {k} {motivo} {int(dur // 3600)}h (nível {nivel})", flush=True)
    _salvar_pendente = True


def banido(k):
    b = BANS.get(k)
    return bool(b and b["ate"] > time.time())


async def faxina():
    while True:
        await asyncio.sleep(30)
        agora = time.time()
        for k in [k for k, v in CONTAGEM.items() if agora - v[0] > 20]:
            CONTAGEM.pop(k, None)
        if len(CONTAGEM) > 200_000:  # proteção de memória contra enxurrada de IPs
            CONTAGEM.clear()
        if _salvar_pendente:
            salvar_bans()


# ---------- respostas ----------
async def responder(send, status, corpo=b"", extras=(), head=False):
    cab = list(SEGURANCA) + list(extras)
    if not any(k == b"content-type" for k, _ in cab):
        cab.append((b"content-type", b"text/plain; charset=utf-8"))
    cab.append((b"content-length", str(len(corpo)).encode()))
    await send({"type": "http.response.start", "status": status, "headers": cab})
    await send({"type": "http.response.body", "body": b"" if head else corpo})


async def app(scope, receive, send):
    if scope["type"] == "lifespan":
        while True:
            msg = await receive()
            if msg["type"] == "lifespan.startup":
                carregar_bans()
                asyncio.get_running_loop().create_task(faxina())
                print(f"servindo {len(ARQUIVOS) - 1} arquivos na porta {PORTA}; {len(BANS)} bans carregados", flush=True)
                await send({"type": "lifespan.startup.complete"})
            elif msg["type"] == "lifespan.shutdown":
                salvar_bans()
                await send({"type": "lifespan.shutdown.complete"})
                return
    if scope["type"] != "http":
        return

    ip = ip_cliente(scope)
    k = chave(ip)
    livre = str(ip) in IPS_LIVRES
    metodo = scope["method"]
    head = metodo == "HEAD"

    if not livre and banido(k):
        return await responder(send, 403, b"Proibido.", head=head)

    bruto = scope.get("raw_path", b"").decode("latin-1") + "?" + scope.get("query_string", b"").decode("latin-1")
    caminho = scope.get("path", "/")

    # armadilha: ninguém normal pede isso
    if ARMADILHA.search(bruto) or ARMADILHA.search(caminho):
        if not livre:
            banir(k, "armadilha", 86400)
        return await responder(send, 403, b"Proibido.", head=head)

    if metodo not in ("GET", "HEAD"):
        if not livre:
            banir(k, "metodo", 3600)
        return await responder(send, 405, b"", [(b"allow", b"GET, HEAD")])

    # limite por IP (janela de 10 s)
    if not livre:
        agora = time.time()
        c = CONTAGEM.get(k)
        if not c or agora - c[0] > 10:
            c = CONTAGEM[k] = [agora, 0]
        c[1] += 1
        if c[1] > BAN_10S:
            banir(k, "flood", 3600)
            return await responder(send, 403, b"Proibido.", head=head)
        if c[1] > LIMITE_10S:
            return await responder(send, 429, b"Calma.", [(b"retry-after", b"10")], head=head)

    arq = ARQUIVOS.get(caminho)
    if not arq:
        return await responder(send, 404, b"Nada aqui.", head=head)

    cab = {k.lower(): v for k, v in scope.get("headers", [])}
    extras = [(b"content-type", arq["tipo"]), (b"cache-control", arq["cache"]), (b"etag", arq["etag"])]
    if arq["gz"]:
        extras.append((b"vary", b"accept-encoding"))
    if cab.get(b"if-none-match") == arq["etag"]:
        return await responder(send, 304, b"", extras, head=True)
    corpo = arq["dados"]
    if arq["gz"] and b"gzip" in cab.get(b"accept-encoding", b""):
        corpo = arq["gz"]
        extras.append((b"content-encoding", b"gzip"))
    return await responder(send, 200, corpo, extras, head=head)


if __name__ == "__main__":
    uvicorn.run(
        app, host="0.0.0.0", port=PORTA, http="h11", loop="asyncio", lifespan="on",
        server_header=False, proxy_headers=False, access_log=False,
        limit_concurrency=1000, timeout_keep_alive=5,
        h11_max_incomplete_event_size=16 * 1024,
    )
