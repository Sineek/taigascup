# Taiga's Cup — Gerador de Posts (Angular)

Versão Angular do gerador de posts, componentizada e com biblioteca local de imagens.

## Estrutura principal

- `GeneratorControlsComponent`: formulário do evento, roda, validação e downloads.
- `RankEditorComponent`: editor reutilizável de cada colocação do Top 3.
- `ImageLibraryComponent`: modal reutilizável com busca, filtro e miniaturas.
- `PostPreviewComponent`: canvases e exportação das imagens.
- `PostRendererService`: desenho, posicionamento, zoom, fonte e exportação PNG.
- `ImageLibraryService`: carrega o índice da biblioteca em `assets`.
- `scripts/generate-library.mjs`: varre as pastas da biblioteca e gera o JSON automaticamente.
- `assets/templates/`: templates do PSD que antes estavam em Base64.

## Executar

```bash
npm install
npm start
```

Depois acesse `http://localhost:4200`.

## Biblioteca de imagens

Você pode continuar usando os inputs de arquivo normalmente ou clicar em **📚 Abrir biblioteca**.

Coloque as imagens nas seguintes pastas:

```text
src/assets/library/
├── wheels/
│   ├── OP14/
│   │   └── roda-op14.png
│   └── OP15/
│       └── roda-op15.png
└── backgrounds/
    ├── OP14/
    │   ├── luffy.png
    │   └── zoro.png
    └── OP15/
        ├── nami.png
        └── shanks.png
```

A primeira subpasta vira automaticamente o filtro de coleção. Por exemplo, tudo dentro de `backgrounds/OP15/` aparece na coleção **OP15**.

Imagens colocadas diretamente dentro de `wheels/` ou `backgrounds/` aparecem como coleção **Geral**.

Formatos reconhecidos: PNG, JPG/JPEG e WEBP.

### Atualizar a biblioteca

Rode:

```bash
npm run library:generate
```

O script gera `src/assets/library/library.json` automaticamente. Você não precisa editar esse JSON.

`npm start` e `npm run build` já executam a atualização da biblioteca antes do Angular.

## Fonte

O projeto tenta usar `VAG Rounded BT` instalada localmente. Se ela não existir no computador, utiliza uma fonte arredondada de fallback.

## Comportamento preservado

- Canvas 1080 × 1080 para colocação e roda.
- Número da edição centralizado no mesmo ponto do código original.
- Upload da roda com zoom e posição X/Y.
- Top 3 com nick, imagem, zoom e posição X/Y.
- Seleção de imagens por arquivo ou pela biblioteca local.
- Busca e filtro por coleção na biblioteca.
- Validação antes dos downloads.
- Exportação individual ou das duas imagens em PNG.
- Processamento totalmente local no navegador.
