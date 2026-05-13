# AGENTS.md — VDT Value Driver Tree

## 1\. Papel do agente

Você é um agente de desenvolvimento responsável por construir o MVP do **VDT — Value Driver Tree**, uma aplicação web sofisticada, interativa e escalável para simulação de impacto operacional, comercial e financeiro no **EBITDA**.

O objetivo é transformar uma árvore de valor em uma interface visual, navegável e simulável, permitindo que usuários alterem premissas operacionais/comerciais e vejam automaticamente os impactos nos indicadores calculados até o EBITDA.

Este projeto deve ser tratado como um **produto analítico interativo**, não como um dashboard tradicional.

\---

## 2\. Visão do produto

O **VDT — Value Driver Tree** é uma aplicação para análise de cenários e simulação de valor.

A aplicação deve permitir que o usuário navegue por uma árvore de indicadores, edite variáveis de entrada e visualize a propagação dos impactos financeiros de forma clara, visual e responsiva.

Regra principal do produto:

> Inputs são alavancas de simulação. Fórmulas são consequências automáticas.

O usuário altera apenas indicadores do tipo `input`. Indicadores do tipo `formula` devem ser sempre calculados automaticamente pelo motor de cálculo.

\---

## 3\. Produto esperado

Construir uma aplicação web minimalista, sofisticada, responsiva e interativa que permita:

* visualizar uma árvore de valor iniciando em **EBITDA**;
* expandir e recolher grupos de indicadores;
* diferenciar visualmente indicadores editáveis e indicadores calculados;
* alterar valores de simulação em indicadores do tipo `input`;
* recalcular automaticamente todos os indicadores dependentes;
* exibir **Budget**, **Outlook**, **Actual** e **What If** em cada indicador;
* alternar entre tema claro e tema escuro;
* salvar a preferência de tema em `localStorage`;
* navegar pela árvore usando modo “mãozinha”;
* clicar nos cards usando modo seleção/edição;
* editar diretamente o valor de **What If** ao clicar em um card do tipo `input`;
* exibir detalhe de fórmula ao clicar em um card do tipo `formula`;
* ter painel lateral retrátil com todos os indicadores editáveis;
* permitir pesquisa no painel lateral para localizar rapidamente um input;
* permitir zoom, pan e enquadramento automático da árvore;
* permitir destacar o caminho entre um card selecionado e o **EBITDA**;
* preparar a arquitetura para futura leitura de dados vindos de Excel, banco de dados e APIs;
* preparar a arquitetura para futura integração com **SQL Server**.

\---

## 4\. Stack tecnológica esperada

Mesmo sendo um MVP, a aplicação deve ser construída com uma base técnica moderna, robusta e escalável.

Usar preferencialmente:

* **React**
* **TypeScript**
* **Vite**
* **React Flow** para renderização da árvore, nós, conexões, pan, zoom, seleção e enquadramento
* **Zustand** para gerenciamento de estado da simulação
* **TanStack Query** para futura camada de busca/cache de dados externos
* **Zod** para validação dos dados de indicadores e fórmulas
* **Tailwind CSS** ou CSS variables para design system e temas
* **Framer Motion** para animações discretas de transição e propagação de impacto
* **Lucide React** para ícones
* Dados mockados em arquivos locais para o MVP
* Arquitetura preparada para futura conexão com banco de dados

Evitar soluções improvisadas ou excessivamente simples. O MVP deve ser funcional, mas já nascer com arquitetura de produto escalável.

\---

## 5\. Referência visual e de interação

A principal inspiração visual e de interação deve ser o **dbdiagram**.

Referência: https://dbdiagram.io/home

Características desejadas:

* canvas limpo;
* nós compactos;
* conexões técnicas e discretas;
* pan e zoom fluido;
* painel lateral retrátil;
* sensação de ferramenta de modelagem;
* pouca poluição visual;
* interações rápidas e objetivas;
* foco em análise e simulação, não em visual de dashboard convencional.

A identidade visual da empresa deve inspirar a paleta:

* verde;
* branco;
* cinza;
* preto/grafite;
* detalhes em dourado.

Referência institucional: https://vale-verde.com/

\---

## 6\. Tema visual

A aplicação deve ter dois temas: claro e escuro.

O tema claro deve ser o padrão inicial.

### Tema claro

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

### Tema escuro

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

Regras:

* o tema claro deve ser o padrão;
* o usuário deve conseguir alternar para tema escuro;
* a preferência deve ser salva em `localStorage`;
* usar tokens/variáveis de tema;
* evitar cores fixas espalhadas nos componentes;
* garantir boa legibilidade nos dois temas.

\---

## 7\. Estrutura inicial da árvore

Ao abrir a aplicação, exibir somente a estrutura inicial:

```text
EBITDA
├── Copper Revenue
├── Gold Revenue
└── Total Operational Costs
```

Os demais indicadores devem aparecer por expansão.

Exemplo de árvore expandida:

```text
EBITDA
├── Copper Revenue
│   ├── Cu Sales
│   ├── Cu Price
│   └── Cu Payability
├── Gold Revenue
│   ├── Au Sales
│   ├── Au Price
│   └── Au Payability
└── Total Operational Costs
    ├── Fuel Cost
    ├── Maintenance Cost
    └── Support Costs
```

A aplicação deve começar com os grupos principais recolhidos, evitando carregar a árvore totalmente expandida por padrão.

\---

## 8\. Modelo de indicador

Cada indicador deve seguir um modelo semelhante a este:

```ts
type IndicatorType = 'input' | 'formula'

type IndicatorValueSet = {
  budget: number
  outlook: number
  actual: number
  whatIf?: number
}

type Indicator = {
  id: string
  label: string
  type: IndicatorType
  unit: string
  group?: string
  formulaId?: string
  children?: string\[]
  values: IndicatorValueSet
}
```

Observações:

* `formulaId` deve referenciar uma fórmula externa definida em arquivo próprio;
* o arquivo de fórmulas será fornecido separadamente;
* o modelo deve permitir futura expansão para metadados, categorias, owners, versões e origem dos dados;
* os indicadores devem ser validados com Zod ou mecanismo equivalente antes de serem usados na aplicação.

\---

## 9\. Arquivo separado de fórmulas

As fórmulas **não devem ficar hardcoded diretamente nos componentes visuais**.

O projeto deve considerar que haverá um arquivo separado contendo as fórmulas dos indicadores calculados.

Esse arquivo poderá ser algo como:

```ts
type FormulaDefinition = {
  id: string
  label: string
  expression: string
}
```

Exemplo conceitual:

```ts
const formulas: FormulaDefinition\[] = \[
  {
    id: 'copper\_revenue\_formula',
    label: 'Copper Revenue',
    expression: 'cu\_sales \* cu\_price \* cu\_payability',
  }
]
```

Regras:

* o motor de cálculo deve consumir esse arquivo de fórmulas;
* os componentes visuais não devem conhecer a lógica matemática interna;
* fórmulas devem ser avaliadas por uma camada dedicada;
* dependências devem ser rastreáveis;
* ao alterar um input, o sistema deve recalcular todos os indicadores dependentes;
* ao clicar em um indicador do tipo `formula`, o usuário deve visualizar a fórmula;
* a estrutura deve permitir trocar o arquivo mockado por uma fonte externa no futuro.

\---

## 10\. Campos exibidos em cada card

Cada nó da árvore deve exibir:

* nome do indicador;
* unidade;
* Budget;
* Outlook;
* Actual;
* What If.

Exemplo visual do conteúdo do card:

```text
Copper Revenue
Unit: kUSD
Budget: 100.0
Outlook: 105.0
Actual: 98.0
What If: 110.0
```

Regras:

* **Budget**, **Outlook** e **Actual** são valores de referência;
* no MVP, esses campos não devem ser editáveis;
* **What If** representa o cenário simulado;
* em indicadores do tipo `input`, **What If** pode ser editado;
* em indicadores do tipo `formula`, **What If** deve ser calculado automaticamente;
* se um input não tiver **What If** definido, usar **Actual** como base para os cálculos.

\---

## 11\. Tipos de indicadores

### 11.1 Input

Indicadores editáveis pelo usuário.

Exemplos:

* Cu Price;
* Cu Payability;
* Cu Sales;
* Au Price;
* Au Payability;
* Au Sales;
* Fuel Cost;
* Maintenance Cost;
* Support Costs.

Regras:

* o campo **What If** é editável;
* o nó deve ter destaque visual;
* alterações devem recalcular todos os indicadores dependentes;
* se o usuário não informar **What If**, usar **Actual** como base;
* o usuário deve conseguir editar pelo painel lateral ou diretamente no card;
* inputs devem ser listados no painel lateral retrátil;
* inputs devem poder ser filtrados por texto no painel lateral.

### 11.2 Formula

Indicadores calculados automaticamente.

Exemplos:

* EBITDA;
* Copper Revenue;
* Gold Revenue;
* Total Operational Costs.

Regras:

* o campo **What If** não é editável;
* o valor deve ser calculado pelo motor de fórmulas;
* ao clicar, mostrar fórmula, descrição e inputs relacionados;
* nunca permitir sobrescrever manualmente o resultado calculado;
* fórmulas devem ser isoladas da camada visual;
* o card deve indicar visualmente que o indicador é calculado.

Mensagem sugerida para tentativa de edição:

```text
Este indicador é calculado automaticamente. Para alterá-lo, ajuste uma das variáveis de entrada relacionadas.
```

\---

## 12\. Modos de interação

A aplicação deve oferecer modos claros de navegação e edição.

### 12.1 Modo navegação

Neste modo, o usuário pode mover o canvas usando uma ferramenta de “mãozinha”.

Funcionalidades esperadas:

* arrastar o canvas;
* aplicar zoom;
* enquadrar a árvore na tela;
* expandir e recolher grupos de indicadores;
* navegar sem editar acidentalmente os cards.

### 12.2 Modo seleção/edição

Neste modo, o usuário pode clicar nos cards da árvore.

Regras:

* ao clicar em um card do tipo `input`, permitir edição direta do campo **What If**;
* ao clicar em um card do tipo `formula`, não permitir edição manual;
* para indicadores calculados, exibir painel ou tooltip com:

  * fórmula utilizada;
  * descrição da fórmula;
  * indicadores dependentes;
  * inputs que influenciam o resultado.

\---

## 13\. Painel lateral de inputs

A aplicação deve possuir um painel lateral retrátil.

Esse painel deve:

* listar todos os indicadores do tipo `input`;
* permitir editar o campo **What If** de cada input;
* possuir caixa de pesquisa para localizar inputs pelo nome;
* indicar unidade do indicador;
* mostrar Actual e What If lado a lado;
* destacar inputs alterados em relação ao Actual;
* ter botão para abrir e recolher;
* manter o canvas utilizável mesmo quando estiver recolhido.

\---

## 14\. Interações esperadas

Implementar:

* expandir e recolher nós;
* pan e zoom no canvas;
* botão para enquadrar a árvore na tela;
* botão para resetar simulação;
* alternância entre modo navegação e modo seleção;
* edição direta de **What If** em cards do tipo `input`;
* bloqueio de edição em cards do tipo `formula`;
* painel de detalhe para fórmulas;
* destaque de caminho entre card selecionado e EBITDA;
* animação discreta indicando propagação de impacto;
* tooltip ou painel lateral com detalhes do indicador;
* alternância de tema claro/escuro;
* persistência da preferência de tema;
* estado global consistente para simulação.

\---

## 15\. Motor de cálculo

Criar uma camada dedicada para cálculo dos indicadores.

Essa camada deve ser independente da interface.

Responsabilidades do motor de cálculo:

* receber indicadores;
* receber fórmulas;
* identificar dependências;
* calcular indicadores do tipo `formula`;
* recalcular indicadores afetados quando um input mudar;
* usar **Actual** como fallback quando **What If** não existir;
* retornar os valores calculados de **What If**;
* impedir edição manual de indicadores calculados;
* possibilitar futura substituição do mock local por dados externos.

O motor de cálculo deve ser testável isoladamente.

Evitar que componentes React contenham regras de cálculo.

\---

## 16\. Dados iniciais

Para o MVP, usar dados mockados em arquivos locais.

Estrutura sugerida:

```text
src/data/indicators.mock.ts
src/data/formulas.mock.ts
```

O arquivo de indicadores deve conter:

* identificador;
* nome;
* tipo;
* unidade;
* grupo;
* filhos;
* valores de Budget, Outlook, Actual e What If.

O arquivo de fórmulas será fornecido separadamente e deve ser consumido pelo motor de cálculo.

A arquitetura deve permitir futura leitura de:

* Excel;
* API;
* banco de dados;
* SQL Server.

\---

## 17\. Organização sugerida do código

Estruturar o projeto de forma modular.

Sugestão:

```text
src/
├── app/
│   ├── App.tsx
│   └── providers.tsx
├── components/
│   ├── Canvas/
│   ├── IndicatorNode/
│   ├── SidePanel/
│   ├── Toolbar/
│   ├── FormulaDetails/
│   └── ThemeToggle/
├── data/
│   ├── indicators.mock.ts
│   └── formulas.mock.ts
├── engine/
│   ├── calculationEngine.ts
│   ├── dependencyGraph.ts
│   └── formulaEvaluator.ts
├── store/
│   └── simulationStore.ts
├── themes/
│   └── theme.ts
├── types/
│   ├── indicator.ts
│   └── formula.ts
├── utils/
│   ├── formatNumber.ts
│   └── treeLayout.ts
└── main.tsx
```

Princípios:

* componentes visuais não devem conter regra de cálculo;
* motor de cálculo não deve depender de React;
* estado da simulação deve ficar centralizado;
* temas devem ser definidos por tokens;
* dados mockados devem ficar isolados;
* preparar pontos claros para futura integração com backend.

\---

## 18\. Critérios de aceite do MVP

O MVP será considerado funcional quando:

* a árvore inicial abrir com **EBITDA** e três blocos principais;
* os demais indicadores aparecerem apenas por expansão;
* cada nó exibir Budget, Outlook, Actual e What If;
* inputs forem editáveis;
* fórmulas forem bloqueadas para edição;
* alterações em inputs recalcularem indicadores dependentes automaticamente;
* EBITDA for recalculado automaticamente após alterações relevantes;
* houver painel lateral retrátil com todos os inputs editáveis;
* houver pesquisa de inputs no painel lateral;
* houver edição direta no card do tipo `input`;
* houver painel ou tooltip para detalhes de indicadores calculados;
* houver expansão e recolhimento de nós;
* houver pan, zoom e enquadramento da árvore;
* houver destaque do caminho entre um card selecionado e EBITDA;
* houver tema claro padrão e tema escuro opcional;
* preferência de tema for salva localmente;
* o visual lembrar uma ferramenta de diagrama/canvas, inspirada no dbdiagram;
* o código estiver organizado para futura leitura de Excel, APIs e SQL Server;
* a lógica de cálculo estiver separada dos componentes visuais.

\---

## 19\. Restrições importantes

* Não permitir edição direta de indicadores do tipo `formula`.
* Não misturar lógica de cálculo com componentes visuais.
* Não carregar toda a árvore expandida por padrão.
* Não usar cores fixas sem tokens de tema.
* Não depender de Excel como estrutura permanente.
* Não criar interface poluída ou excessivamente parecida com dashboard tradicional.
* Não hardcodar fórmulas dentro dos componentes React.
* Não acoplar o motor de cálculo ao React.
* Não tratar o VDT como um simples dashboard.
* Não ignorar a futura integração com banco de dados.

\---

## 20\. Resultado esperado da primeira entrega

Na primeira entrega, criar uma aplicação funcional com:

* projeto configurado em React + TypeScript + Vite;
* árvore renderizada com React Flow;
* dados mockados de indicadores;
* leitura de fórmulas a partir de arquivo separado;
* motor de cálculo isolado;
* painel lateral retrátil;
* edição de inputs;
* recálculo automático;
* tema claro/escuro;
* pan, zoom e fit view;
* expansão/recolhimento;
* destaque de caminho até EBITDA;
* código limpo, modular e preparado para evolução.

A prioridade é entregar uma base sólida, bonita, interativa e tecnicamente bem organizada para evolução posterior.

