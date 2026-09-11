# Biblioteca de imagens

Coloque aqui as imagens que você quer acessar diretamente pelo gerador.

Estrutura recomendada:

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

O nome da primeira subpasta vira o filtro de coleção no modal. Imagens colocadas diretamente em `wheels/` ou `backgrounds/` aparecem na coleção `Geral`.

Formatos reconhecidos: PNG, JPG/JPEG e WEBP.

Depois de adicionar ou remover imagens, rode:

```bash
npm run library:generate
```

`npm start` e `npm run build` já executam essa geração automaticamente.
