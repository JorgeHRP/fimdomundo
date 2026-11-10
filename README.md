# Monte seu fim do mundo

Escolha o apocalipse, suba sua foto, coloque acessórios e baixe a imagem ou um vídeo de 10 s.
Tudo roda no navegador: a foto nunca sai do celular.

Por [@jorgerprado](https://www.instagram.com/jorgerprado/).

## Rodar

```bash
pip install -r requirements.txt
python servidor.py   # http://127.0.0.1:8000
```

Python 3.12. O `servidor.py` serve só os arquivos do site (lista branca na memória), com cabeçalhos de segurança, limite por IP e banimento automático. Variáveis opcionais estão documentadas no topo do arquivo.

## Créditos

- Vulcão (`cenas/vulcao*.jpg`): "Stromboli Eruption", Wolfgang Beyer, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/), via [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Stromboli_Eruption.jpg). Recortada para 9:16.
- Cena "Rumbling" (`cenas/eren*.jpg`): arte original de **Nezzu**, sobre *Attack on Titan* (Hajime Isayama). Usada como homenagem/meme; todos os direitos dos autores.
- Demais cenas, acessórios e corpos: gerados por IA para este projeto.
- Recorte de pessoas: [MediaPipe](https://github.com/google-ai-edge/mediapipe) (Apache 2.0). Recorte de objetos: [@imgly/background-removal](https://github.com/imgly/background-removal-js) (AGPL-3.0), empacotado em `vendor/fundo.js`.
- Fontes: Anton e Inter (SIL Open Font License).
