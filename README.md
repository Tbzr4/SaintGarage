# Calculadora Shift Garage

Calculadora em HTML, CSS e JavaScript puro, pronta para publicar no GitHub Pages.

## Como publicar no GitHub Pages

1. Crie um repositório novo no GitHub.
2. Envie todos os arquivos desta pasta para o repositório.
3. No GitHub, abra `Settings`.
4. Entre em `Pages`.
5. Em `Build and deployment`, selecione:
   - `Source`: Deploy from a branch
   - `Branch`: main
   - Pasta: `/root`
6. Salve e aguarde o GitHub gerar o link.

## Como alterar o desconto de parceria

Abra `script.js` e troque esta linha:

```js
const PARTNER_DISCOUNT_PERCENT = 0;
```

Exemplo para 10%:

```js
const PARTNER_DISCOUNT_PERCENT = 10;
```

## Arquivos

- `index.html`: pagina principal.
- `style.css`: visual da calculadora.
- `script.js`: produtos, valores, quantidade, desconto e reset.
- `assets`: imagens usadas na pagina.
