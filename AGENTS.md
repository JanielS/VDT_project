# AGENTS.md - VDT Value Driver Tree

## 1. Papel do agente

Voce e um agente de desenvolvimento responsavel por evoluir o **VDT - Value Driver Tree**, uma aplicacao web interativa para simulacao de impacto operacional, comercial e financeiro no **EBITDA**.

O projeto ja possui um MVP funcional publicado no GitHub:

```text
https://github.com/JanielS/VDT_project
```

A partir desta fase, o foco nao e mais "criar o projeto do zero", e sim **manter, refinar e evoluir uma base existente** com cuidado tecnico, visual e funcional.

Regra central do produto:

> Inputs sao alavancas de simulacao. Formulas sao consequencias automaticas.

O agente deve tratar o VDT como um **produto analitico interativo**, nao como dashboard tradicional.

---

## 2. Estado atual do projeto

O MVP esta implementado com:

* React + TypeScript + Vite;
* React Flow para canvas, nos, conexoes, pan, zoom e fit view;
* Zustand para estado global da simulacao;
* TanStack Query preparado para futura camada de dados externos;
* Zod para validacao de indicadores e formulas;
* CSS variables como design system de temas;
* Framer Motion para animacoes discretas;
* Lucide React para icones;
* dados mockados em arquivos locais;
* motor de calculo isolado em `src/engine`;
* testes automatizados com Vitest.

Arquivos de referencia do negocio:

```text
AGENTS.md
VDT_FLUXO.pdf
Formulas.xlsx
Logo_MVV.png
MVV_LOGO_BRANCA.png
```

Arquivos principais da aplicacao:

```text
src/data/indicators.mock.ts
src/data/formulas.mock.ts
src/engine/calculationEngine.ts
src/store/simulationStore.ts
src/components/Canvas/VdtCanvas.tsx
src/components/IndicatorNode/IndicatorNode.tsx
src/components/SidePanel/SidePanel.tsx
src/components/DecimalInput/DecimalInput.tsx
src/utils/treeLayout.ts
src/utils/decimalNumber.ts
```

---

## 3. Funcionalidades ja implementadas

O produto ja permite:

* visualizar a arvore de valor iniciando em **EBITDA**;
* expandir e recolher grupos de indicadores;
* navegar no canvas com modo "mao";
* selecionar/editar com modo de selecao;
* diferenciar indicadores `input` e `formula`;
* editar **What If** em inputs pelo card ou painel lateral;
* aceitar numeros decimais com virgula como padrao, por exemplo `0,045`;
* recalcular indicadores dependentes automaticamente;
* exibir **Budget**, **Outlook**, **Actual** e **What If**;
* mostrar detalhe de formulas calculadas;
* listar inputs em painel lateral retratil com busca;
* destacar caminho entre o card selecionado e o EBITDA;
* alternar tema claro/escuro;
* persistir tema em `localStorage`;
* usar `Logo_MVV.png` no tema claro;
* usar `MVV_LOGO_BRANCA.png` no tema escuro;
* mostrar variacao do EBITDA What If contra EBITDA Actual no header.

---

## 4. Regras de produto que nao devem ser quebradas

* Indicadores do tipo `formula` nunca devem ser editaveis manualmente.
* Indicadores do tipo `input` sao as unicas alavancas editaveis.
* Se um input nao tiver What If definido, usar Actual como fallback.
* Budget, Outlook e Actual sao referencias e nao devem ser editaveis no MVP.
* Formulas nao devem ser hardcoded em componentes React.
* Componentes visuais nao devem conter regra financeira.
* O motor de calculo nao deve depender de React.
* A arvore nao deve iniciar totalmente expandida.
* A interface deve continuar parecendo ferramenta de modelagem/canvas, inspirada no dbdiagram.
* Evitar visual de dashboard tradicional.
* Evitar cores fixas espalhadas; usar tokens/variaveis de tema.
* Manter arquitetura preparada para Excel, APIs e SQL Server no futuro.

---

## 5. Regras de UX atuais

### Canvas

* O canvas deve permanecer limpo, tecnico e navegavel.
* A expansao deve manter o no pai centralizado em relacao aos filhos.
* Deve haver distancia suficiente entre cards expandidos para evitar sobreposicao.
* O usuario deve conseguir usar pan, zoom e fit view sem perder contexto.

### Cards

Cada card deve exibir:

* nome do indicador;
* unidade;
* Budget;
* Outlook;
* Actual;
* What If.

Inputs devem ter destaque visual e permitir edicao de What If.
Formulas devem indicar que sao calculadas.

### Numeros decimais

* A entrada decimal deve aceitar virgula como padrao: `0,045`.
* Entrada com ponto ainda pode ser aceita por compatibilidade: `0.045`.
* Ao confirmar o valor, a interface deve exibir virgula como separador decimal.
* Nao transformar `0,045` em `0` durante a digitacao.

---

## 6. Motor de calculo

O motor de calculo fica em:

```text
src/engine/
```

Responsabilidades:

* receber indicadores;
* receber formulas;
* calcular indicadores do tipo `formula`;
* recalcular dependentes quando input muda;
* calcular Budget, Outlook, Actual e What If para formulas;
* usar Actual como fallback quando What If nao existir;
* bloquear edicao manual de formulas;
* permanecer testavel isoladamente.

Antes de alterar regras de calculo, revisar:

```text
src/engine/calculationEngine.ts
src/engine/formulaEvaluator.ts
src/engine/dependencyGraph.ts
src/data/formulas.mock.ts
src/data/indicators.mock.ts
```

---

## 7. Dados e formulas

Fonte estrutural principal:

```text
VDT_FLUXO.pdf
```

Fonte auxiliar de formulas:

```text
Formulas.xlsx
```

No estado atual, nem todas as formulas de negocio foram validadas em fonte definitiva. Quando houver formula ausente ou ambigua:

* manter o no visivel;
* marcar a formula como pendente quando necessario;
* nao esconder a estrutura da arvore;
* nao inventar logica financeira sem deixar rastreavel;
* preferir formulas mockadas claras e substituiveis.

---

## 8. Padrao visual

A paleta deve continuar inspirada na Vale Verde:

* verde;
* branco;
* cinza;
* preto/grafite;
* dourado.

Tema claro:

```ts
const lightTheme = {
  background: '#F8FAF7',
  canvas: '#FFFFFF',
  card: '#FFFFFF',
  border: '#D8E0D5',
  text: '#1F2933',
  muted: '#6B7280',
  green: '#00843D',
  gold: '#C9A227',
  danger: '#B42318',
  input: '#EAF7EF',
  formula: '#F8FAFC',
  selected: '#DCFCE7',
  pathHighlight: '#22C55E'
}
```

Tema escuro:

```ts
const darkTheme = {
  background: '#0B0F0D',
  canvas: '#111827',
  card: '#161B22',
  border: '#30363D',
  text: '#E5E7EB',
  muted: '#9CA3AF',
  green: '#22C55E',
  gold: '#D6B84A',
  danger: '#F87171',
  input: '#102A1A',
  formula: '#1F2937',
  selected: '#064E3B',
  pathHighlight: '#22C55E'
}
```

---

## 9. Workflow de desenvolvimento

Antes de qualquer alteracao:

```bash
git status --short --branch
```

Para uma nova demanda:

```bash
git switch main
git pull
git switch -c nome_da_branch
```

Ao finalizar:

```bash
npm run build
npm run test
git status --short
git add .
git commit -m "Mensagem clara"
git push -u origin nome_da_branch
```

Quando o usuario aprovar:

```bash
git switch main
git merge --ff-only nome_da_branch
git push origin main
```

Nao fazer merge na `main` sem confirmacao do usuario.

---

## 10. Validacao obrigatoria

Para mudancas de codigo, sempre tentar rodar:

```bash
npm run build
npm run test
```

Para mudancas visuais, tambem validar no navegador:

* tema claro;
* tema escuro;
* logo correta por tema;
* expansao/recolhimento;
* pan/zoom;
* edicao de input;
* recalcule do EBITDA;
* ausencia de sobreposicao incoerente entre cards.

Se algum comando falhar por restricao do ambiente, explicar claramente o motivo e o que foi/nao foi validado.

---

## 11. Proximos focos naturais

Prioridades provaveis para proximas fases:

* validar formulas reais com o time de negocio;
* substituir mocks por uma camada de importacao estruturada;
* preparar leitura de Excel de forma controlada;
* desenhar contrato de API para dados externos;
* planejar integracao futura com SQL Server;
* melhorar responsividade mobile;
* melhorar agrupamento/colapso de grandes subarvores;
* adicionar testes para layout, parsing numerico e dependencia de formulas;
* criar pipeline de CI no GitHub.

---

## 12. Principio final

Toda evolucao deve preservar a separacao:

```text
dados -> motor de calculo -> estado global -> componentes visuais
```

O VDT deve continuar sendo uma ferramenta de simulacao clara, sofisticada e evolutiva.
