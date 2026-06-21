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
- O backend Python fica em um repositorio privado separado

## Como rodar

```bash
npm install
npm run dev
```

O frontend usa `/api` como proxy local quando a API estiver em `http://127.0.0.1:8000`.
Em producao, defina `VITE_SIMULATION_API_URL` caso a API esteja em outro host.
O backend deve ser executado a partir do repositorio privado.

## Scripts

```bash
npm run build
npm run test
```

## Estrutura

- `src/engine`: utilitarios de grafo usados pela interface
- `src/store`: estado global da simulacao
- `src/components`: canvas, cards, toolbar, painel lateral e detalhes de formulas
- `src/themes`: tokens de tema claro e escuro
- `VITE_SIMULATION_API_URL`: URL da API de simulacao quando nao estiver no mesmo host

## Materiais de referencia

- `AGENTS.md`: especificacao do produto
- `VDT_FLUXO.pdf`: referencia visual da arvore de valor
- `Formulas.xlsx`: apoio para formulas
- `Logo_MVV.png` e `MVV_LOGO_BRANCA.png`: identidade visual
