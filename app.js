const CENAS = [
  {id:"charles", nome:"Tempestade no Porto"}, {id:"eren", nome:"Rumbling"}, {id:"meteoro", nome:"Meteoro"},
  {id:"tsunami", nome:"Tsunami"}, {id:"monstro", nome:"Monstro gigante"}, {id:"tornado", nome:"Tornado"},
  {id:"vulcao", nome:"Vulcão"}, {id:"nazare", nome:"Onda de Nazaré"}, {id:"zumbi", nome:"Apocalipse zumbi"},
];
const ABAS = [
  {id:"top", nome:"⭐ Tudo"}, {id:"emerg", nome:"🎒 Emergência"}, {id:"br", nome:"🇧🇷 Brasil"},
  {id:"bichos", nome:"🐾 Bichos"}, {id:"memes", nome:"😂 Memes"},
];
// top = aparece na aba "Tudo" (seleção curta das melhores)
const ACESS = [
  {id:"mochila", nome:"Mochila", aba:"emerg", top:1}, {id:"copao", nome:"Copão", aba:"emerg", top:1},
  {id:"guardachuva", nome:"Guarda-chuva", aba:"emerg", top:1}, {id:"boia", nome:"Boia", aba:"emerg", top:1},
  {id:"papel", nome:"Papel higiênico", aba:"emerg", top:1}, {id:"galocha", nome:"Galocha", aba:"emerg"},
  {id:"capacete", nome:"Capacete", aba:"emerg"}, {id:"colete", nome:"Colete", aba:"emerg"},
  {id:"radio", nome:"Rádio", aba:"emerg"}, {id:"lanterna", nome:"Lanterna", aba:"emerg"},
  {id:"pao", nome:"Pão", aba:"emerg"},
  {id:"botijao", nome:"Botijão", aba:"br", top:1}, {id:"galao", nome:"Galão d'água", aba:"br", top:1},
  {id:"coxinha", nome:"Coxinha", aba:"br", top:1}, {id:"garrafa-cafe", nome:"Cafezinho", aba:"br"},
  {id:"paodequeijo", nome:"Pão de queijo", aba:"br"}, {id:"chinelo", nome:"Chinelo", aba:"br"},
  {id:"marmita", nome:"Marmita", aba:"br"}, {id:"isopor", nome:"Isopor", aba:"br"},
  {id:"guarana", nome:"Guaraná", aba:"br"}, {id:"nata", nome:"Pastel de nata", aba:"br"},
  {id:"gato-mochila", nome:"Gato na mochila", aba:"bichos", top:1}, {id:"salsicha", nome:"Salsichinha", aba:"bichos", top:1},
  {id:"caramelo", nome:"Caramelo", aba:"bichos", top:1}, {id:"saco-gatos", nome:"Saco de gatinhos", aba:"bichos", top:1},
  {id:"capivara", nome:"Capivara", aba:"bichos", top:1}, {id:"pombo", nome:"Pombo", aba:"bichos"},
  {id:"refri-zero", nome:"Refri zero", aba:"memes", top:1}, {id:"tijolao", nome:"Tijolão", aba:"memes", top:1},
  {id:"galinha", nome:"Galinha de borracha", aba:"memes"}, {id:"banana", nome:"Banana", aba:"memes"},
  {id:"crocs", nome:"Crocs", aba:"memes"}, {id:"ventilador", nome:"Ventilador", aba:"memes"},
];
// música não vai no vídeo: a pessoa coloca no app na hora de postar
const RECOMENDA = {
  charles:"Interstellar (Cornfield Chase) · Hans Zimmer", eren:"The Rumbling · SiM", meteoro:"I Don't Want to Miss a Thing · Aerosmith",
  tsunami:"My Heart Will Go On · Céline Dion", monstro:"Godzilla · Eminem", tornado:"Over the Rainbow · Judy Garland",
  vulcao:"Ring of Fire · Johnny Cash", nazare:"Tubarão (tema) · John Williams", zumbi:"Thriller · Michael Jackson",
};
const RECOMENDA_GERAL = ["Funkytown · Lipps Inc.", "Requiem for a Dream · Clint Mansell", "O Fortuna · Carl Orff"];
const FRASES = [
  "Ainda bem que preparei minha mochila de emergência", "Portugal: alerta vermelho. Eu:",
  "O Charles chegou e eu:", "Fui só comprar pão", "Home office hoje? Claro", "Modo sobrevivência: ativado",
];
let estiloVideo = "agitado";
const W = 1080, H = 1920, DUR = 10, IMPACTO = 3, PUNCH = 6.5;
const $ = s => document.querySelector(s);
const tela = $("#tela"), ctx = tela.getContext("2d");

const estado = {
  cena:null, fundo:null, camadas:[], sel:null,
  texto:{id:"texto", nome:"Texto", x:W*0.5, y:H*0.12, s:1, r:0, flip:false, w:W*0.9, h:300},
};
let seq = 0;

function toast(msg, ms=2600){ const t=$("#toast"); t.textContent=msg; t.classList.remove("oculto"); clearTimeout(toast.t); if(ms) toast.t=setTimeout(()=>t.classList.add("oculto"), ms); }
function carregarImg(src){ return new Promise((ok,erro)=>{ const i=new Image(); i.crossOrigin="anonymous"; i.onload=()=>ok(i); i.onerror=erro; i.src=src; }); }
function paraCanvas(img, max=1400){
  const w0 = img.naturalWidth||img.width, h0 = img.naturalHeight||img.height, e = Math.min(1, max/Math.max(w0,h0));
  const c = document.createElement("canvas"); c.width=Math.round(w0*e); c.height=Math.round(h0*e);
  c.getContext("2d").drawImage(img,0,0,c.width,c.height); return c;
}

/* ---------- cenas ---------- */
for (const c of CENAS){
  const b=document.createElement("button"); b.className="cena"; b.dataset.id=c.id;
  b.innerHTML=`<img src="cenas/${c.id}-mini.jpg" alt="" loading="lazy"><span>${c.nome}</span>`;
  b.onclick=()=>escolherCena(c.id); $("#cenas").appendChild(b);
}
async function escolherCena(id){
  estado.cena=id;
  document.querySelectorAll(".cena").forEach(b=>b.classList.toggle("on", b.dataset.id===id));
  estado.fundo = await carregarImg(`cenas/${id}.jpg`);
  if (typeof atualizarDica==="function") atualizarDica();
  desenhar();
}
escolherCena("charles");

/* ---------- frases ---------- */
for (const f of FRASES){ const b=document.createElement("button"); b.textContent=f; b.onclick=()=>{ $("#frase").value=f; desenhar(); }; $("#chips").appendChild(b); }
$("#frase").addEventListener("input", desenhar);

/* ---------- camadas ---------- */
function camadaSel(){ return estado.sel==="texto" ? estado.texto : estado.camadas.find(c=>c.id===estado.sel); }
function fonteBase(l){ return (l.usarRecorte && l.recorte) ? l.recorte : l.foto; }
function atualizarImg(l){
  const b = fonteBase(l), alturaAntes = l.h ? l.h*l.s : null;
  if (l.crop){
    const c=document.createElement("canvas"); c.width=Math.max(1,Math.round(l.crop.w)); c.height=Math.max(1,Math.round(l.crop.h));
    c.getContext("2d").drawImage(b, l.crop.x, l.crop.y, l.crop.w, l.crop.h, 0, 0, c.width, c.height); l.img=c;
  } else l.img=b;
  l.w=l.img.width; l.h=l.img.height;
  if (alturaAntes) l.s = alturaAntes / l.h;
}
function novaCamada(cat, nome, foto, recorte=null){
  const l = {id:"c"+(++seq), cat, nome, foto, recorte, usarRecorte:!!recorte, crop:null, img:null, x:W/2, y:H/2, s:1, r:0, flip:false, w:0, h:0};
  atualizarImg(l); estado.camadas.push(l); return l;
}
function pessoaPrincipal(){ return estado.camadas.find(c=>c.cat==="pessoa"); }
function selecionar(id){ estado.sel=id; atualizarFerramentas(); desenhar(); }
function atualizarFerramentas(){
  const l = camadaSel(), img = l && l!==estado.texto;
  $("#selNome").textContent = l ? "Editando: " + l.nome : "";
  $("#tCortar").disabled = !img; $("#tFundo").disabled = !img || !l.recorte;
  $("#tHD").disabled = !img; $("#tFrente").disabled = !img; $("#tTras").disabled = !img; $("#tApagar").disabled = !img;
  $("#tEspelhar").disabled = !l;
  const temCorpo = estado.camadas.some(c=>c.cat==="corpo");
  $("#btnSemCorpo").classList.toggle("oculto", !temCorpo);
  $("#tSemCorpo").classList.toggle("oculto", !(l && (l.cat==="corpo" || l.cat==="cabeca")));
  $("#ajuste").classList.toggle("oculto", !l);
  const pessoas = estado.camadas.filter(c=>c.cat==="pessoa"), alvo = pessoaAlvo();
  $("#dicaCorpo").textContent = pessoas.length>1 && alvo ? `O corpinho vai em: ${alvo.nome}. Pra pôr em outra pessoa, toca nela antes.` : "";
  $("#tFundo").textContent = (img && l.recorte) ? (l.usarRecorte ? "🪄 Pôr fundo de volta" : "🪄 Tirar fundo") : "🪄 Fundo";
  syncSliders();
}
function syncSliders(){
  const l = camadaSel(); if (!l) return;
  $("#rTam").value = Math.round(500 + 250*Math.log2(Math.max(1e-6, l.s / (l.sBase||1))));
  let g = Math.round(l.r*180/Math.PI) % 360; if (g>180) g-=360; if (g<-180) g+=360;
  $("#rRot").value = g;
}
$("#rTam").oninput = e => { const l=camadaSel(); if(!l) return; const f=foto(l); l.s=(l.sBase||1)*Math.pow(2,(e.target.value-500)/250); moverFilhos(l,f); mexendo(true); pedirDesenho(); };
$("#rRot").oninput = e => { const l=camadaSel(); if(!l) return; const f=foto(l); let g=+e.target.value; if (Math.abs(g)<4) g=0; l.r=g*Math.PI/180; moverFilhos(l,f); mexendo(true); pedirDesenho(); };
for (const id of ["#rTam","#rRot"]) $(id).addEventListener("change", ()=>mexendo(false));
$("#tEspelhar").onclick = () => { const l=camadaSel(); if(l){ const f=foto(l); l.flip=!l.flip; moverFilhos(l,f); desenhar(); } };
$("#tFrente").onclick = () => { const a=estado.camadas, i=a.indexOf(camadaSel()); if(i>=0 && i<a.length-1){ [a[i],a[i+1]]=[a[i+1],a[i]]; desenhar(); } };
$("#tTras").onclick = () => { const a=estado.camadas, i=a.indexOf(camadaSel()); if(i>0){ [a[i],a[i-1]]=[a[i-1],a[i]]; desenhar(); } };
$("#tApagar").onclick = () => { let l=camadaSel(); if(!l || l===estado.texto) return; if(l.cat==="cabeca" && l.pai){ l = estado.camadas.find(c=>c.id===l.pai) || l; } apagarCamada(l); atualizarBotoesFoto(); };
$("#tFundo").onclick = () => { const l=camadaSel(); if(!l?.recorte) return; l.usarRecorte=!l.usarRecorte; l.crop=null; atualizarImg(l); atualizarFerramentas(); desenhar(); };
$("#tHD").onclick = async () => {
  const l=camadaSel(); if(!l || l===estado.texto) return;
  try { toast("Recorte caprichado... na 1ª vez baixa uns 40 MB, pode demorar", 0);
    l.recorte = await recorteHD(l.foto); l.usarRecorte=true; l.crop=null; atualizarImg(l); toast("Pronto!"); }
  catch(e){ console.error(e); toast("Não deu pra fazer o recorte caprichado aqui."); }
  atualizarFerramentas(); desenhar();
};

/* ---------- foto da pessoa ---------- */
let modoArquivo = "nova";
$("#btnFoto").onclick = () => { modoArquivo = pessoaPrincipal() ? "trocar" : "nova"; $("#arquivo").click(); };
$("#btnMaisPessoa").onclick = () => { modoArquivo = "nova"; $("#arquivo").click(); };
function atualizarBotoesFoto(){
  const tem = !!pessoaPrincipal();
  $("#btnFoto").textContent = tem ? "Trocar foto" : "Escolher foto";
  $("#btnMaisPessoa").classList.toggle("oculto", !tem);
}
$("#arquivo").onchange = async e => {
  const f=e.target.files[0]; e.target.value=""; if(!f) return;
  const status=$("#status");
  status.textContent="Carregando a foto...";
  const foto = paraCanvas(await carregarImg(URL.createObjectURL(f)));
  status.textContent="Recortando você da foto... (a 1ª vez demora uns segundos)";
  $("#btnFoto").disabled = true;
  let recorte=null, cabeca=null;
  try { ({corpo:recorte, cabeca} = await recortarPessoa(foto)); status.textContent="Pronto! Se o recorte ficou ruim, toca em ✨ Recorte caprichado ou ✂️ Cortar."; }
  catch(err){ console.error(err); status.textContent="Não achei a pessoa. Usando a foto inteira (dá pra ✂️ cortar)."; }
  $("#btnFoto").disabled = false;
  if (modoArquivo==="trocar"){
    const l = pessoaPrincipal(); l.foto=foto; l.recorte=recorte; l.cabeca=cabeca; l.usarRecorte=!!recorte; l.crop=null; atualizarImg(l);
    for (const h of estado.camadas.filter(c=>c.cat==="cabeca" && c.dono===l.id && cabeca)){ h.foto=cabeca; h.crop=null; atualizarImg(h); centralizarCabeca(h); }
    selecionar(l.id);
  } else {
    const qtd = estado.camadas.filter(c=>c.cat==="pessoa").length;
    const l = novaCamada("pessoa", qtd ? `Pessoa ${qtd+1}` : "Você", foto, recorte);
    l.cabeca = cabeca;
    l.s = l.sBase = Math.min((H*0.55)/l.h, (W*0.8)/l.w);
    l.x = qtd ? W*(qtd%2 ? 0.28 : 0.72) : W*0.5; l.y = H - l.h*l.s/2 - 40;
    estado.camadas.splice(estado.camadas.filter(c=>c.cat==="pessoa").length-1, 0, ...estado.camadas.splice(estado.camadas.indexOf(l),1)); // pessoas atrás dos acessórios
    selecionar(l.id);
  }
  atualizarBotoesFoto();
  if (corpoPendente){ const c=corpoPendente; corpoPendente=null; aplicarCorpo(c, modoArquivo==="trocar" ? pessoaPrincipal() : estado.camadas.find(x=>x.id===estado.sel)); }
  if ($("#editor").classList.contains("oculto")){ $("#editor").classList.remove("oculto"); $("#editor").scrollIntoView({behavior:"smooth"}); }
  desenhar();
};

/* ---------- recorte: MediaPipe (rápido, pessoas) ---------- */
let segmentador=null;
async function pegarSegmentador(){
  if (segmentador) return segmentador;
  const V="0.10.14";
  const { FilesetResolver, ImageSegmenter } = await import(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${V}/vision_bundle.mjs`);
  const vision = await FilesetResolver.forVisionTasks(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${V}/wasm`);
  segmentador = await ImageSegmenter.createFromOptions(vision, {
    baseOptions:{ modelAssetPath:"https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/1/selfie_multiclass_256x256.tflite" },
    runningMode:"IMAGE", outputCategoryMask:false, outputConfidenceMasks:true,
  });
  return segmentador;
}
// classes do modelo: 0 fundo, 1 cabelo, 2 pele do corpo, 3 rosto, 4 roupa, 5 acessórios (óculos etc.)
async function recortarPessoa(fonte){
  const seg = await pegarSegmentador(), res = seg.segment(fonte);
  const ms = res.confidenceMasks.map(m=>m.getAsFloat32Array()), mw=res.confidenceMasks[0].width, mh=res.confidenceMasks[0].height;
  res.close && res.close();
  const aplicar = (conf, lim=0.35, faixa=0.3) => {
    const mc=document.createElement("canvas"); mc.width=mw; mc.height=mh;
    const md=mc.getContext("2d").createImageData(mw,mh);
    for (let i=0;i<mw*mh;i++){ const a=Math.min(1,Math.max(0,(conf(i)-lim)/faixa)); md.data[i*4+3]=a*255; }
    mc.getContext("2d").putImageData(md,0,0);
    const out=document.createElement("canvas"); out.width=fonte.width; out.height=fonte.height;
    const o=out.getContext("2d"); o.filter="blur(1.2px)"; o.drawImage(mc,0,0,out.width,out.height); o.filter="none";
    o.globalCompositeOperation="source-in"; o.drawImage(fonte,0,0);
    return aparar(out);
  };
  const corpo = aplicar(i => 1 - ms[0][i]);
  let cabeca = null;
  try {
    cabeca = aplicar(i => ms[1][i] + ms[3][i], 0.5, 0.25);
    // centro do rosto (classe 3): é ele que vai no pescoço do corpinho
    let sw=0, sx=0, sy=0;
    for (let y=0;y<mh;y++) for (let x=0;x<mw;x++){ const v=ms[3][y*mw+x]; if(v>0.5){ sw+=v; sx+=v*x; sy+=v*y; } }
    if (sw > mw*mh*0.002){ const k=fonte.width/mw; cabeca.rosto = {x: sx/sw*k - cabeca.ox, y: sy/sw*k - cabeca.oy}; }
  } catch(e){}
  return {corpo, cabeca};
}
/* ---------- recorte caprichado: roda isolado num iframe sandbox (fundo.html) ---------- */
let caixa=null, caixaPronta=null, pedidoSeq=0;
const pedidos=new Map();
function abrirCaixa(){
  if (caixaPronta) return caixaPronta;
  caixa=document.createElement("iframe");
  caixa.setAttribute("sandbox","allow-scripts"); // sem allow-same-origin: não enxerga nada da página
  caixa.src="fundo.html"; caixa.title="recorte"; caixa.className="oculto"; caixa.setAttribute("aria-hidden","true");
  caixaPronta=new Promise((ok,erro)=>{
    const t=setTimeout(()=>erro(new Error("caixa não abriu")),20000);
    window.addEventListener("message", e=>{
      if (!caixa || e.source!==caixa.contentWindow) return; // só ouve a própria caixa
      const d=e.data||{};
      if (d.pronto){ clearTimeout(t); ok(); return; }
      const p=pedidos.get(d.id); if(!p) return; pedidos.delete(d.id);
      if (d.blob instanceof Blob && /^image\//.test(d.blob.type)) p.ok(d.blob); else p.erro(new Error(d.erro||"falhou"));
    });
  });
  document.body.appendChild(caixa);
  return caixaPronta;
}
async function recorteHD(fonte){
  await abrirCaixa();
  const blob = await new Promise(ok=>fonte.toBlob(ok,"image/png"));
  const id=++pedidoSeq;
  const saida = await new Promise((ok,erro)=>{
    pedidos.set(id,{ok,erro});
    setTimeout(()=>{ if(pedidos.delete(id)) erro(new Error("demorou demais")); }, 180000);
    caixa.contentWindow.postMessage({id, blob}, "*");
  });
  const img = await carregarImg(URL.createObjectURL(saida));
  return aparar(paraCanvas(img, 4000));
}
function aparar(c){
  const d=c.getContext("2d").getImageData(0,0,c.width,c.height).data;
  let x0=c.width,y0=c.height,x1=-1,y1=-1;
  for (let y=0;y<c.height;y+=2) for (let x=0;x<c.width;x+=2){ if(d[(y*c.width+x)*4+3]>40){ if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; } }
  if (x1<0) throw new Error("vazio");
  const p=6; x0=Math.max(0,x0-p); y0=Math.max(0,y0-p); x1=Math.min(c.width-1,x1+p); y1=Math.min(c.height-1,y1+p);
  const r=document.createElement("canvas"); r.width=x1-x0+1; r.height=y1-y0+1;
  r.getContext("2d").drawImage(c,x0,y0,r.width,r.height,0,0,r.width,r.height); r.ox=x0; r.oy=y0; return r;
}

/* ---------- acessórios ---------- */
for (const ab of ABAS){
  const b=document.createElement("button"); b.textContent=ab.nome; b.dataset.aba=ab.id; if(ab.id==="top") b.classList.add("on");
  b.onclick=()=>mostrarAba(ab.id); $("#abasAcess").appendChild(b);
}
function mostrarAba(id){
  document.querySelectorAll("#abasAcess button").forEach(x=>x.classList.toggle("on", x.dataset.aba===id));
  document.querySelectorAll("#bandeja button[data-aba]").forEach(x=>x.classList.toggle("oculto", id==="top" ? !x.dataset.top : x.dataset.aba!==id));
}
for (const a of ACESS){
  const b=document.createElement("button"); b.dataset.aba=a.aba; if(a.top) b.dataset.top="1"; else b.classList.add("oculto");
  b.innerHTML=`<img src="acessorios/${a.id}.webp" alt="" loading="lazy">${a.nome}`;
  b.onclick=async()=>{ const img=await carregarImg(`acessorios/${a.id}.webp`); adicionarAcessorio(a.nome, paraCanvas(img,700), null); };
  $("#bandeja").appendChild(b);
}
{ const b=document.createElement("button"); b.className="meu"; b.innerHTML="<big>＋</big>Meu acessório"; b.onclick=()=>$("#arquivoAcess").click(); $("#bandeja").appendChild(b); }
function adicionarAcessorio(nome, foto, recorte){
  const l = novaCamada("acess", nome, foto, recorte);
  const p = estado.camadas.find(c=>!c.oculto && (c.cat==="pessoa"||c.cat==="corpo"));
  const alvo = p ? p.h*p.s*0.3 : 420;
  l.s = l.sBase = Math.min(alvo/l.h, (W*0.5)/l.w);
  if (p){ l.x = p.x + (Math.random()-0.5)*p.w*p.s*0.4; l.y = p.y + (Math.random()-0.2)*p.h*p.s*0.25; } else { l.x=W/2; l.y=H*0.6; }
  selecionar(l.id);
  return l;
}
/* ---------- corpinhos (x,y = centro da cabeça; t = altura da cabeça, tudo em fração da imagem) ---------- */
const CORPOS = [
  {id:"costas-f",   g:"f", nome:"De costas",     x:.50, y:.05,  t:.10},
  {id:"capa-f",     g:"f", nome:"Capa de chuva", x:.26, y:.055, t:.10},
  {id:"heroina",    g:"f", nome:"Heroína",       x:.62, y:.0,   t:.11},
  {id:"correndo-f", g:"f", nome:"Fugindo",       x:.37, y:.08,  t:.125},
  {id:"sentada",    g:"f", nome:"De boa",        x:.51, y:.11,  t:.14},
  {id:"costas",     g:"m", nome:"De costas",     x:.49, y:.055, t:.105},
  {id:"capa",       g:"m", nome:"Capa de chuva", x:.30, y:.062, t:.11},
  {id:"heroi",      g:"m", nome:"Herói",         x:.53, y:.065, t:.11},
  {id:"correndo",   g:"m", nome:"Fugindo",       x:.26, y:.062, t:.12},
  {id:"sentado",    g:"m", nome:"De boa",        x:.54, y:.077, t:.15},
];
let corpoPendente=null;
for (const c of CORPOS){
  const b=document.createElement("button"); b.dataset.g=c.g; if(c.g!=="f") b.classList.add("oculto");
  b.innerHTML=`<img src="corpos/${c.id}.webp" alt="" loading="lazy">${c.nome}`;
  b.onclick=()=>{
    const p = pessoaAlvo();
    if (!p){ corpoPendente=c; modoArquivo="nova"; $("#arquivo").click(); return; }
    aplicarCorpo(c, p);
  };
  $("#corpos").appendChild(b);
}
// pessoa que recebe o corpinho: a selecionada (ou a dona do corpo/cabeça selecionado)
function pessoaAlvo(){
  const l = camadaSel();
  if (l && l.cat==="pessoa") return l;
  if (l && (l.cat==="corpo" || l.cat==="cabeca")) return estado.camadas.find(c=>c.id===l.dono) || pessoaPrincipal();
  return estado.camadas.find(c=>c.cat==="pessoa" && !c.oculto) || pessoaPrincipal();
}
function centralizarCabeca(cab){
  const corpo = estado.camadas.find(c=>c.id===cab.pai); if (!corpo || !corpo.modelo) return;
  const c = corpo.modelo, rosto = (!cab.crop && cab.foto.rosto) ? cab.foto.rosto : null;
  // ponto da cabeça do corpo (espaço da imagem do corpo) → tela
  let ax = (c.x-0.5)*corpo.w, ay = (c.y-0.5)*corpo.h - (rosto ? 0 : c.t*corpo.h*0.12);
  if (corpo.flip) ax = -ax;
  const cs=Math.cos(corpo.r), sn=Math.sin(corpo.r);
  const px = corpo.x + (ax*cs-ay*sn)*corpo.s, py = corpo.y + (ax*sn+ay*cs)*corpo.s;
  cab.s = cab.sBase = (c.t * corpo.h * corpo.s * 1.85) / cab.h;
  cab.r = corpo.r;
  // o centro do rosto (e não o da caixa com cabelo) cai no ponto
  let fx = rosto ? rosto.x - cab.w/2 : 0, fy = rosto ? rosto.y - cab.h/2 : 0;
  if (cab.flip) fx = -fx;
  cab.x = px - (fx*cs-fy*sn)*cab.s; cab.y = py - (fx*sn+fy*cs)*cab.s;
}
async function aplicarCorpo(c, p){
  if (!p) return;
  if (!p.cabeca){ toast("Não achei teu rosto nessa foto. Tenta uma com o rosto aparecendo."); return; }
  // tira corpinho antigo dessa pessoa
  for (const v of estado.camadas.filter(x=>x.cat==="corpo" && x.dono===p.id)) apagarCamada(v, false);
  const img = paraCanvas(await carregarImg(`corpos/${c.id}.webp`), 1000);
  const corpo = novaCamada("corpo", "Corpinho: "+c.nome+(p.nome!=="Você" ? ` (${p.nome})` : ""), img, null);
  corpo.modelo = c;
  const alt = Math.min(H*0.6, Math.max(H*0.42, p.h*p.s));
  corpo.s = corpo.sBase = alt / corpo.h;
  corpo.x = p.x; corpo.y = Math.min(H - corpo.h*corpo.s/2 - 30, p.y + p.h*p.s/2 - corpo.h*corpo.s/2);
  const cab = novaCamada("cabeca", p.nome==="Você" ? "Tua cabeça" : `Cabeça (${p.nome})`, p.cabeca, null);
  corpo.dono = cab.dono = p.id; corpo.filhos=[cab.id]; cab.pai=corpo.id;
  centralizarCabeca(cab);
  // corpo no lugar da pessoa, cabeça logo acima
  const a=estado.camadas; a.splice(a.indexOf(corpo),1); a.splice(a.indexOf(cab),1);
  const i=a.indexOf(p); a.splice(i+1,0,corpo,cab);
  p.oculto = true;
  selecionar(corpo.id);
  toast("Arrasta o corpinho que a cabeça vai junto. Toca na cabeça pra ajustar só ela (as setinhas ajudam).");
}
document.querySelectorAll("#estiloVideo button").forEach(b=>b.onclick=()=>{
  estiloVideo=b.dataset.e; document.querySelectorAll("#estiloVideo button").forEach(x=>x.classList.toggle("on", x===b));
});
document.querySelectorAll("#filtroCorpo button").forEach(b=>b.onclick=()=>{
  document.querySelectorAll("#filtroCorpo button").forEach(x=>x.classList.toggle("on", x===b));
  document.querySelectorAll("#corpos button").forEach(x=>x.classList.toggle("oculto", x.dataset.g!==b.dataset.g));
});
function tirarCorpinho(){
  // tira o corpinho da pessoa selecionada; se nada dela estiver selecionado, tira todos
  const l = camadaSel();
  const dono = l && (l.cat==="corpo"||l.cat==="cabeca") ? l.dono : null;
  for (const v of estado.camadas.filter(x=>x.cat==="corpo" && (!dono || x.dono===dono))) apagarCamada(v, false);
  const p = estado.camadas.find(c=>c.id===dono) || pessoaPrincipal(); selecionar(p ? p.id : "texto");
  toast("Voltou a foto inteira.");
}
$("#btnSemCorpo").onclick = tirarCorpinho;
function passoAjuste(a){
  const l=camadaSel(); if(!l) return; const f=foto(l), d=8;
  ({esq:()=>l.x-=d, dir:()=>l.x+=d, cima:()=>l.y-=d, baixo:()=>l.y+=d, menor:()=>l.s*=0.97, maior:()=>l.s*=1.03})[a]();
  moverFilhos(l,f); syncSliders(); pedirDesenho();
}
document.querySelectorAll("#ajuste .setas button").forEach(b=>{
  let t1=null, t2=null;
  const parar=()=>{ clearTimeout(t1); clearInterval(t2); t1=t2=null; mexendo(false); };
  b.addEventListener("pointerdown", e=>{ e.preventDefault(); passoAjuste(b.dataset.a); t1=setTimeout(()=>{ mexendo(true); t2=setInterval(()=>passoAjuste(b.dataset.a),50); },350); });
  for (const ev of ["pointerup","pointerleave","pointercancel"]) b.addEventListener(ev, parar);
  b.addEventListener("contextmenu", e=>e.preventDefault());
});
$("#tSemCorpo").onclick = tirarCorpinho;
function apagarCamada(l, resel=true){
  const ids = new Set([l.id, ...(l.filhos||[])]);
  estado.camadas = estado.camadas.filter(c=>!ids.has(c.id));
  if (l.cat==="corpo" || l.cat==="cabeca"){
    const dono = estado.camadas.find(c=>c.id===l.dono);
    if (dono && !estado.camadas.some(c=>c.cat==="corpo" && c.dono===dono.id)) dono.oculto=false;
    if (l.pai){ const pai=estado.camadas.find(c=>c.id===l.pai); if(pai) pai.filhos=pai.filhos.filter(x=>x!==l.id); }
  }
  if (resel) selecionar(estado.camadas.filter(c=>!c.oculto).at(-1)?.id || "texto");
}
// filhos (cabeça) acompanham o corpo
function foto(l){ return {x:l.x,y:l.y,s:l.s,r:l.r,flip:l.flip, f:(l.filhos||[]).map(id=>estado.camadas.find(c=>c.id===id)).filter(Boolean).map(c=>({c,x:c.x,y:c.y,s:c.s,r:c.r,flip:c.flip}))}; }
function moverFilhos(l, f){
  if (!f || !f.f.length) return;
  const k=l.s/f.s, dr=l.r-f.r, cos=Math.cos(dr), sin=Math.sin(dr), vira = l.flip!==f.flip;
  for (const o of f.f){
    let dx=o.x-f.x, dy=o.y-f.y;
    if (vira){ const c0=Math.cos(-f.r), s0=Math.sin(-f.r); let lx=dx*c0-dy*s0, ly=dx*s0+dy*c0; lx=-lx; dx=lx*Math.cos(f.r)-ly*Math.sin(f.r); dy=lx*Math.sin(f.r)+ly*Math.cos(f.r); }
    o.c.x = l.x + (dx*cos-dy*sin)*k; o.c.y = l.y + (dx*sin+dy*cos)*k;
    o.c.s = o.s*k; o.c.r = vira ? -(o.r) + 2*f.r + dr : o.r + dr; o.c.flip = vira ? !o.flip : o.flip;
  }
}

$("#arquivoAcess").onchange = async e => {
  const f=e.target.files[0]; e.target.value=""; if(!f) return;
  const foto = paraCanvas(await carregarImg(URL.createObjectURL(f)), 1000);
  const l = adicionarAcessorio("Meu acessório", foto, null);
  toast("Tirando o fundo do acessório... na 1ª vez baixa uns 40 MB", 0);
  try { l.recorte = await recorteHD(foto); l.usarRecorte=true; atualizarImg(l); toast("Pronto! Se preferir com fundo, toca em 🪄."); }
  catch(err){ console.error(err); toast("Não deu pra tirar o fundo. Dá pra ✂️ cortar."); }
  atualizarFerramentas(); desenhar();
};

/* ---------- corte ---------- */
const cropTela=$("#cropTela"), cctx=cropTela.getContext("2d");
let crop=null;
$("#tCortar").onclick = () => {
  const l=camadaSel(); if(!l || l===estado.texto) return;
  const b=fonteBase(l), e=Math.min((innerWidth-32)/b.width, (innerHeight*0.6)/b.height);
  cropTela.width=Math.round(b.width*e); cropTela.height=Math.round(b.height*e);
  crop={l, b, e, r: l.crop ? {...l.crop} : {x:0,y:0,w:b.width,h:b.height}, arr:null};
  $("#mCrop").classList.remove("oculto"); desenharCrop();
};
function desenharCrop(){
  const {b,e,r}=crop, W2=cropTela.width, H2=cropTela.height;
  const t=16; for(let y=0;y<H2;y+=t) for(let x=0;x<W2;x+=t){ cctx.fillStyle=((x/t+y/t)%2)?"#2a2a2a":"#3a3a3a"; cctx.fillRect(x,y,t,t); }
  cctx.drawImage(b,0,0,W2,H2);
  cctx.fillStyle="rgba(0,0,0,.6)";
  const x=r.x*e,y=r.y*e,w=r.w*e,h=r.h*e;
  cctx.fillRect(0,0,W2,y); cctx.fillRect(0,y+h,W2,H2-y-h); cctx.fillRect(0,y,x,h); cctx.fillRect(x+w,y,W2-x-w,h);
  cctx.strokeStyle="#ffd60a"; cctx.lineWidth=2; cctx.strokeRect(x,y,w,h);
  cctx.fillStyle="#ffd60a"; for(const [cx,cy] of [[x,y],[x+w,y],[x,y+h],[x+w,y+h]]) cctx.fillRect(cx-9,cy-9,18,18);
}
function pCrop(ev){ const rc=cropTela.getBoundingClientRect(); return {x:(ev.clientX-rc.left)*cropTela.width/rc.width/crop.e, y:(ev.clientY-rc.top)*cropTela.height/rc.height/crop.e}; }
cropTela.addEventListener("pointerdown", ev => {
  try{ cropTela.setPointerCapture(ev.pointerId); }catch(e){}
  const p=pCrop(ev), r=crop.r, tol=28/crop.e;
  const cantos={nw:[r.x,r.y], ne:[r.x+r.w,r.y], sw:[r.x,r.y+r.h], se:[r.x+r.w,r.y+r.h]};
  let modo=null; for(const k in cantos){ if(Math.hypot(p.x-cantos[k][0],p.y-cantos[k][1])<tol){ modo=k; break; } }
  if(!modo && p.x>r.x && p.x<r.x+r.w && p.y>r.y && p.y<r.y+r.h) modo="mover";
  crop.arr = modo ? {modo, p0:p, r0:{...r}} : null;
});
cropTela.addEventListener("pointermove", ev => {
  if(!crop?.arr) return;
  const p=pCrop(ev), {modo,p0,r0}=crop.arr, dx=p.x-p0.x, dy=p.y-p0.y, B=crop.b, min=20;
  let {x,y,w,h}=r0;
  if(modo==="mover"){ x=Math.min(Math.max(0,x+dx),B.width-w); y=Math.min(Math.max(0,y+dy),B.height-h); }
  else {
    if(modo.includes("w")){ const nx=Math.min(Math.max(0,x+dx),x+w-min); w+=x-nx; x=nx; }
    if(modo.includes("e")){ w=Math.min(Math.max(min,w+dx),B.width-x); }
    if(modo.includes("n")){ const ny=Math.min(Math.max(0,y+dy),y+h-min); h+=y-ny; y=ny; }
    if(modo.includes("s")){ h=Math.min(Math.max(min,h+dy),B.height-y); }
  }
  crop.r={x,y,w,h}; desenharCrop();
});
cropTela.addEventListener("pointerup", ()=>{ if(crop) crop.arr=null; });
$("#cropOk").onclick = () => { const {l,r,b}=crop; l.crop = (r.w>=b.width-1 && r.h>=b.height-1) ? null : r; atualizarImg(l); fecharCrop(); };
$("#cropOriginal").onclick = () => { crop.l.crop=null; atualizarImg(crop.l); fecharCrop(); };
$("#cropCancelar").onclick = fecharCrop;
function fecharCrop(){ $("#mCrop").classList.add("oculto"); crop=null; syncSliders(); desenhar(); }

/* ---------- toque no palco ---------- */
const toques=new Map(); let gesto=null;
function ponto(e){ const r=tela.getBoundingClientRect(); return {x:(e.clientX-r.left)*W/r.width, y:(e.clientY-r.top)*H/r.height}; }
function dentro(l,p,extra=1.1){
  const dx=p.x-l.x, dy=p.y-l.y, c=Math.cos(-l.r), s=Math.sin(-l.r), lx=dx*c-dy*s, ly=dx*s+dy*c;
  const min = 22 * W / (tela.getBoundingClientRect().width || W); // 22 px de cada lado = alvo de 44 px pro dedo
  return Math.abs(lx)<=Math.max(l.w*l.s/2*extra, min) && Math.abs(ly)<=Math.max(l.h*l.s/2*extra, min);
}
// redesenho no máximo 1x por quadro; sem sombra enquanto o dedo mexe (fica leve no celular)
let rafPend=false, estaMexendo=false;
function pedirDesenho(){ if(rafPend) return; rafPend=true; requestAnimationFrame(()=>{ rafPend=false; desenhar(); }); }
function mexendo(v){ if(estaMexendo===v) return; estaMexendo=v; if(!v) pedirDesenho(); }
for (const ev of ["gesturestart","gesturechange"]) $(".palco").addEventListener(ev, e=>e.preventDefault()); // Safari: não dar zoom na página
tela.addEventListener("pointerdown", e => {
  try{ tela.setPointerCapture(e.pointerId); }catch(err){}
  const p=ponto(e); toques.set(e.pointerId,p);
  if (toques.size===1){
    const ordem=[...estado.camadas.filter(c=>!c.oculto).reverse(), estado.texto];
    const atual=camadaSel();
    const alvo = (atual && dentro(atual,p,1.0)) ? atual : ordem.find(l=>dentro(l,p));
    if (alvo && alvo.id!==estado.sel) selecionar(alvo.id);
  }
  iniciarGesto();
});
tela.addEventListener("pointermove", e => {
  if(!toques.has(e.pointerId)) return;
  toques.set(e.pointerId, ponto(e));
  const l=camadaSel(); if(!gesto || !l) return;
  const pts=[...toques.values()];
  if (pts.length===1 && gesto.n===1){ l.x=gesto.lx+pts[0].x-gesto.p[0].x; l.y=gesto.ly+pts[0].y-gesto.p[0].y; }
  else if (pts.length>=2 && gesto.n>=2){
    const [a,b]=pts, [a0,b0]=gesto.p;
    const sb=l.sBase||1;
    l.s=Math.min(sb*6, Math.max(sb*0.12, gesto.ls*Math.hypot(b.x-a.x,b.y-a.y)/Math.max(1,Math.hypot(b0.x-a0.x,b0.y-a0.y))));
    l.r=gesto.lr+Math.atan2(b.y-a.y,b.x-a.x)-Math.atan2(b0.y-a0.y,b0.x-a0.x);
    l.x=gesto.lx+(a.x+b.x)/2-(a0.x+b0.x)/2; l.y=gesto.ly+(a.y+b.y)/2-(a0.y+b0.y)/2;
  }
  moverFilhos(l, gesto.f);
  mexendo(true); syncSliders(); pedirDesenho();
});
function fimToque(e){ toques.delete(e.pointerId); iniciarGesto(); if(!toques.size) mexendo(false); }
tela.addEventListener("pointerup", fimToque); tela.addEventListener("pointercancel", fimToque);
function iniciarGesto(){
  const l=camadaSel();
  if(!toques.size || !l){ gesto=null; return; }
  gesto={n:toques.size, p:[...toques.values()].map(p=>({...p})), lx:l.x, ly:l.y, ls:l.s, lr:l.r, f:foto(l)};
}
tela.addEventListener("wheel", e => { e.preventDefault(); const l=camadaSel(); if(!l) return; const f=foto(l); l.s*=e.deltaY<0?1.06:0.94; moverFilhos(l,f); syncSliders(); pedirDesenho(); }, {passive:false});

/* ---------- desenho ---------- */
function cobrir(c, img){ const s=Math.max(W/img.width,H/img.height), w=img.width*s, h=img.height*s; c.drawImage(img,(W-w)/2,(H-h)/2,w,h); }
function transf(c, l, extra=1){ c.translate(l.x,l.y); c.rotate(l.r); c.scale(l.s*extra*(l.flip?-1:1), l.s*extra); }
function desenharCamadas(c){
  for (const l of estado.camadas){
    if (l.oculto) continue;
    c.save(); transf(c,l);
    if (!estaMexendo || c!==ctx){ c.shadowColor="rgba(0,0,0,.45)"; c.shadowBlur=24/l.s; c.shadowOffsetY=8/l.s; }
    c.drawImage(l.img,-l.w/2,-l.h/2); c.restore();
  }
}
function quebrar(c, txt, max){
  const ps=txt.split(/\s+/).filter(Boolean), ls=[]; let at="";
  for (const p of ps){ const t=at?at+" "+p:p; if(c.measureText(t).width>max && at){ ls.push(at); at=p; } else at=t; }
  if(at) ls.push(at); return ls;
}
function desenharTexto(c, extra=1, dx=0, dy=0){
  const t=estado.texto, frase=$("#frase").value.trim().toUpperCase(); if(!frase) return;
  c.save(); c.translate(dx,dy); transf(c,t,extra);
  c.font="96px Anton, Impact, sans-serif"; c.textAlign="center"; c.textBaseline="middle";
  const ls=quebrar(c,frase,W*0.86), lh=108; t.h=ls.length*lh+30; t.w=W*0.9;
  c.lineJoin="round"; c.lineWidth=16; c.strokeStyle="#000"; c.fillStyle="#ffd60a";
  ls.forEach((ln,i)=>{ const y=(i-(ls.length-1)/2)*lh; c.strokeText(ln,0,y); c.fillText(ln,0,y); });
  c.restore();
}
function desenharMarca(c){
  c.save(); c.font="800 40px Inter, sans-serif"; c.textAlign="right"; c.textBaseline="bottom";
  c.fillStyle="rgba(0,0,0,.5)"; c.fillText("@jorgerprado",W-34,H-31); c.fillStyle="#fff"; c.fillText("@jorgerprado",W-36,H-36); c.restore();
}
function desenhar(final=false){
  ctx.fillStyle="#111"; ctx.fillRect(0,0,W,H);
  if (estado.fundo) cobrir(ctx, estado.fundo);
  desenharCamadas(ctx); desenharTexto(ctx); desenharMarca(ctx);
  const l=camadaSel();
  if (!final && l && (l!==estado.texto || $("#frase").value.trim())){
    ctx.save(); transf(ctx,l); ctx.setLineDash([18/l.s,12/l.s]); ctx.lineWidth=4/l.s; ctx.strokeStyle="rgba(255,214,10,.95)"; ctx.strokeRect(-l.w/2,-l.h/2,l.w,l.h); ctx.restore();
  }
}
// fonte: se não carregar, segue com a reserva (Impact) em vez de travar
async function fonteOk(){ try { if (document.fonts) await Promise.race([document.fonts.load("96px Anton"), new Promise(r=>setTimeout(r,2500))]); } catch(e){} }
fonteOk().then(()=>desenhar());

/* ---------- baixar imagem ---------- */
let arquivoFinal=null;
async function compartilhar(){
  try { await navigator.share({ files:[arquivoFinal], text:"Ainda bem que preparei o kit 🎒 @jorgerprado" }); } catch(e){}
}
document.querySelectorAll(".compartilhar").forEach(b=>b.onclick=compartilhar);
document.querySelectorAll(".fechar").forEach(b=>b.onclick=()=>{ document.querySelectorAll(".modal").forEach(m=>m.classList.add("oculto")); pararVideo(); });
function podeCompartilhar(f){ return !!(navigator.canShare && navigator.canShare({files:[f]})); }
$("#btnBaixar").onclick = async () => {
  await fonteOk();
  desenhar(true);
  const blob = await new Promise(ok=>tela.toBlob(ok,"image/png"));
  desenhar();
  arquivoFinal = new File([blob],"meu-fim-do-mundo.png",{type:"image/png"});
  const url=URL.createObjectURL(blob); $("#imgFinal").src=url; $("#lnkImg").href=url;
  $("#mImg .compartilhar").classList.toggle("oculto", !podeCompartilhar(arquivoFinal));
  $("#mImg").classList.remove("oculto");
};

/* ---------- recomendação de música ---------- */
function atualizarDica(){
  const html = `🎵 <span class="top">Música:</span> o vídeo sai sem som. Na hora de postar, coloca no app:<br><b>${RECOMENDA[estado.cena]||RECOMENDA.charles}</b> (combina com essa cena)<br>ou: ${RECOMENDA_GERAL.join(" · ")}`;
  $("#dicaMusica").innerHTML = html; $("#dicaMusicaVid").innerHTML = html;
}

/* ---------- vídeo ---------- */
const lerp=(a,b,t)=>a+(b-a)*t, cl=t=>Math.max(0,Math.min(1,t));
const easeOut=t=>1-Math.pow(1-t,3);
const easeBack=t=>{ const c1=1.70158,c3=c1+1; return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2); };
function tremida(t, ini, dur, amp){ if(t<ini||t>ini+dur) return [0,0]; const k=1-(t-ini)/dur; return [Math.sin(t*90)*amp*k, Math.cos(t*73)*amp*k]; }
function desenharCam(c, img, z, fx, fy, pan, sx, sy){
  // zoom em volta do foco, puxando o foco pro centro conforme "pan", sem mostrar borda
  let tx = fx*(1-z) + (W/2-fx)*pan, ty = fy*(1-z) + (H/2-fy)*pan;
  tx = Math.min(0, Math.max(W*(1-z), tx)); ty = Math.min(0, Math.max(H*(1-z), ty));
  c.save(); c.translate(tx+sx, ty+sy); c.scale(z,z); c.drawImage(img,0,0,W,H); c.restore();
}
function quadroSuave(c, t, bg, fg, foco, txt, marca){
  c.fillStyle="#000"; c.fillRect(0,0,W,H);
  const k = t/DUR, e = k<0.5 ? 2*k*k : 1-Math.pow(-2*k+2,2)/2; // sai e chega devagar
  desenharCam(c, bg, lerp(1.02, 1.12, e), foco.x, foco.y, 0.25*e, 0, 0);
  desenharCam(c, fg, lerp(1.0, 1.16, e), foco.x, foco.y, 0.25*e, 0, 0);
  const a = cl((t-0.3)/0.7);
  if (a>0){ c.save(); c.globalAlpha=a; c.drawImage(txt,0,0,W,H); c.restore(); }
  c.drawImage(marca,0,0,W,H);
  const fo = cl((t-(DUR-0.5))/0.5); if (fo){ c.fillStyle=`rgba(0,0,0,${fo})`; c.fillRect(0,0,W,H); }
}
function quadroVideo(c, t, bg, fg, foco, txt, marca){
  if (estiloVideo==="suave") return quadroSuave(c, t, bg, fg, foco, txt, marca);
  c.fillStyle="#000"; c.fillRect(0,0,W,H);
  const p = easeOut(cl((t-PUNCH)/0.3));
  const [sx,sy] = tremida(t, IMPACTO, 0.7, 34), [px,py] = tremida(t, PUNCH, 0.25, 18);
  const zImp = t>=IMPACTO ? 0.10*Math.max(0,1-(t-IMPACTO)/0.6) : 0;
  // fundo: começa perto do desastre e abre; no impacto dá um soco
  const zBg = lerp(1.32, 1.06, easeOut(cl(t/IMPACTO))) + zImp + 0.03*cl((t-IMPACTO)/(DUR-IMPACTO)) ;
  const zPunch = lerp(1, 1.42, p) + 0.04*cl((t-PUNCH)/(DUR-PUNCH));
  const fyBg = lerp(H*0.3, foco.y, p);
  desenharCam(c, bg, zBg*zPunch, lerp(W/2, foco.x, p), fyBg, p*0.9, sx+px, sy+py);
  // pessoa: entra de baixo
  const entrada = (1-easeBack(cl((t-0.15)/0.7)))*H*0.45;
  const zFg = (1.04 + zImp*0.5) * zPunch;
  c.save(); c.translate(0, entrada);
  desenharCam(c, fg, zFg, foco.x, foco.y, p*0.9, (sx+px)*0.6, (sy+py)*0.6);
  c.restore();
  // flash do impacto
  const fl = t>=IMPACTO ? Math.max(0, 1-(t-IMPACTO)/0.18) : 0;
  if (fl){ c.fillStyle=`rgba(255,255,255,${fl*0.75})`; c.fillRect(0,0,W,H); }
  // texto: pula na tela e treme junto
  const pop = t<0.4 ? 0 : easeBack(cl((t-0.4)/0.45));
  if (pop>0){ const T=estado.texto; c.save(); c.translate(T.x+sx*0.5, T.y+sy*0.5); c.scale(pop,pop); c.translate(-T.x,-T.y); c.drawImage(txt,0,0,W,H); c.restore(); }
  c.drawImage(marca,0,0,W,H);
  // fade final
  const fo = cl((t-(DUR-0.4))/0.4); if (fo){ c.fillStyle=`rgba(0,0,0,${fo})`; c.fillRect(0,0,W,H); }
}
function tipoVideo(){
  for (const t of ['video/mp4;codecs="avc1.42E01E,mp4a.40.2"','video/mp4;codecs=avc1','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'])
    if (window.MediaRecorder && MediaRecorder.isTypeSupported(t)) return t;
  return null;
}
let gravacao=null;
function pararVideo(){ if(!gravacao) return; gravacao.cancelado=true; try{ gravacao.rec.state!=="inactive" && gravacao.rec.stop(); }catch(e){} cancelAnimationFrame(gravacao.raf); gravacao=null; }
$("#btnVideo").onclick = async () => {
  const tipo = tipoVideo();
  if (!tipo){ toast("Teu navegador não grava vídeo. Tenta no Chrome ou Safari atualizado."); return; }
  // trilha silenciosa: mantém o vídeo a 30 qps e pronto pra receber música no app
  let actx=null; try { actx = new (window.AudioContext||window.webkitAudioContext)(); await Promise.race([actx.resume(), new Promise(r=>setTimeout(r,500))]); if (actx.state!=="running"){ actx.close(); actx=null; } } catch(e){ actx=null; }
  await fonteOk();
  // camadas separadas pro efeito de profundidade
  // tudo pré-desenhado já no tamanho do vídeo: cada quadro só copia (fica leve no celular)
  const R=720/W;
  const pre = desenha => { const k=document.createElement("canvas"); k.width=720; k.height=1280; const kc=k.getContext("2d"); kc.scale(R,R); desenha(kc); return k; };
  const bg = pre(kc => { kc.fillStyle="#111"; kc.fillRect(0,0,W,H); if(estado.fundo) cobrir(kc, estado.fundo); });
  const fg = pre(kc => desenharCamadas(kc));
  const txt = pre(kc => desenharTexto(kc));
  const marca = pre(kc => desenharMarca(kc));
  const vis = estado.camadas.filter(c=>!c.oculto), cab = vis.find(c=>c.cat==="cabeca"), p = vis.find(c=>c.cat==="pessoa") || vis[0];
  const foco = cab ? {x:cab.x, y:cab.y + cab.h*cab.s*0.2} : p ? {x:p.x, y:p.y - p.h*p.s*0.15} : {x:W/2, y:H*0.6};
  // tela de gravação (720x1280 pra não pesar no celular)
  const rec=document.createElement("canvas"); rec.width=720; rec.height=1280;
  const rc=rec.getContext("2d"); rc.scale(R,R);
  $("#vidPalco").innerHTML=""; $("#vidPalco").appendChild(rec);
  rec.style.cssText="max-height:58dvh;max-width:100%;border-radius:12px;display:block";
  $("#vidAcoes").classList.add("oculto"); $("#vidStatus").textContent="Gravando... não sai da tela 🎬"; $("#vidBarra").style.width="0";
  $("#mVid").classList.remove("oculto");
  quadroVideo(rc, 0, bg, fg, foco, txt, marca);
  const stream = rec.captureStream(30);
  if (actx){ try { const dest=actx.createMediaStreamDestination(), g0=actx.createGain(), osc=actx.createOscillator(); g0.gain.value=0; osc.connect(g0).connect(dest); osc.start(); dest.stream.getAudioTracks().forEach(tr=>stream.addTrack(tr)); } catch(e){} }
  const partes=[], mr=new MediaRecorder(stream,{mimeType:tipo, videoBitsPerSecond:6_000_000});
  mr.ondataavailable=e=>{ if(e.data.size) partes.push(e.data); };
  gravacao={rec:mr, raf:0, cancelado:false};
  const g=gravacao;
  mr.onstop=()=>{
    stream.getTracks().forEach(tr=>tr.stop()); try{ actx && actx.close(); }catch(e){}
    if (g.cancelado) return;
    const ext = tipo.startsWith("video/mp4") ? "mp4" : "webm";
    const blob = new Blob(partes,{type:tipo.split(";")[0]});
    arquivoFinal = new File([blob], `meu-fim-do-mundo.${ext}`, {type:blob.type});
    const url=URL.createObjectURL(blob);
    const v=document.createElement("video"); v.src=url; v.controls=true; v.playsInline=true; v.loop=true; v.style.cssText=rec.style.cssText;
    $("#vidPalco").innerHTML=""; $("#vidPalco").appendChild(v); v.play().catch(()=>{});
    $("#lnkVid").href=url; $("#lnkVid").download=`meu-fim-do-mundo.${ext}`;
    $("#mVid .compartilhar").classList.toggle("oculto", !podeCompartilhar(arquivoFinal));
    atualizarDica();
    $("#vidStatus").textContent = ext==="mp4" ? "Pronto! 🔥" : "Pronto! (saiu em .webm: se o Instagram reclamar, grava pelo Chrome atualizado)";
    $("#vidAcoes").classList.remove("oculto");
    gravacao=null;
  };
  mr.start(250);
  const t0 = performance.now();
  const passo = () => {
    if (g.cancelado) return;
    const t=(performance.now()-t0)/1000;
    quadroVideo(rc, Math.min(t,DUR), bg, fg, foco, txt, marca);
    $("#vidBarra").style.width = (cl(t/DUR)*100)+"%";
    if (t>=DUR){ $("#vidStatus").textContent="Finalizando..."; setTimeout(()=>{ if(mr.state!=="inactive") mr.stop(); }, 120); return; }
    g.raf=requestAnimationFrame(passo);
  };
  g.raf=requestAnimationFrame(passo);
};
