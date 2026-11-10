// Ponte da caixa de areia: recebe uma imagem da página principal, devolve sem fundo.
// Só aceita mensagens do próprio pai e só imagens (Blob) de até 15 MB.
(function () {
  if (window.parent === window) return; // aberto direto: não faz nada
  const MAX = 15 * 1024 * 1024;
  window.addEventListener("message", async (e) => {
    if (e.source !== window.parent) return;
    const d = e.data;
    if (!d || typeof d.id !== "number" || !(d.blob instanceof Blob) || d.blob.size > MAX || !/^image\//.test(d.blob.type)) return;
    try {
      const saida = await FundoLib.removeBackground(d.blob, { model: "small", output: { format: "image/png" } });
      window.parent.postMessage({ id: d.id, blob: saida }, "*");
    } catch (err) {
      window.parent.postMessage({ id: d.id, erro: String(err && err.message || err).slice(0, 200) }, "*");
    }
  });
  window.parent.postMessage({ pronto: true }, "*");
})();
