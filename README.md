# VDT - Value Driver Tree

Aplicacao web interativa para simulacao de impacto operacional, comercial e financeiro no EBITDA a partir de uma arvore de valor.

## Stack

- React
- TypeScript
- Vite
- React Flow
- Zustand
- TanStack Query
- Zod
- Framer Motion
- Lucide React

## Como rodar

```bash
npm install
npm run dev
```

## Scripts

```bash
npm run build
npm run test
```

## Estrutura

- `src/data`: dados mockados de indicadores e formulas
- `src/engine`: motor de calculo independente da interface
- `src/store`: estado global da simulacao
- `src/components`: canvas, cards, toolbar, painel lateral e detalhes de formulas
- `src/themes`: tokens de tema claro e escuro

## Materiais de referencia

- `AGENTS.md`: especificacao do produto
- `VDT_FLUXO.pdf`: referencia visual da arvore de valor
- `Formulas.xlsx`: apoio para formulas
- `Logo_MVV.png` e `MVV_LOGO_BRANCA.png`: identidade visual
