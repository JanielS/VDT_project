# Plano de Fonte Privada de Dados

## Objetivo

Este documento descreve como o motor de calculo do VDT deve evoluir para consumir
fontes oficiais da empresa sem alterar o contrato do frontend.

O principio principal e manter esta separacao:

- frontend publica: interface, interacao e chamadas HTTP;
- backend privado: regras numericas, formulas, defaults e acesso a dados oficiais.

O frontend nunca deve conhecer credenciais, strings de conexao ou detalhes da
origem real dos dados.

## Estado desejado

O backend continua com a mesma API publica interna:

- `GET /api/simulation/initial`
- `POST /api/simulation/update-input`
- `POST /api/simulation/apply-plan`
- `POST /api/simulation/reset`

A unica mudanca futura deve estar em `data_source.py`, que passara a buscar
dados em fontes reais e devolver um mapa normalizado de valores de entrada.

## Responsabilidade dos arquivos

### `main.py`

- expor os endpoints da API FastAPI;
- receber requests do frontend;
- chamar o motor de calculo;
- retornar `SimulationResponse`.

### `models.py`

- definir os contratos da API com Pydantic;
- validar payloads de entrada e saida;
- manter os tipos estaveis para frontend e testes.

### `calculation_engine.py`

- hidratar indicadores de estrutura + valores base;
- aplicar `whatIf`, `budget` e `outlook`;
- recalcular toda a arvore;
- bloquear edicao manual em formulas;
- devolver a arvore pronta para renderizacao.

### `formula_evaluator.py`

- avaliar expressoes matematicas de forma segura;
- aceitar apenas operacoes permitidas;
- rejeitar qualquer sintaxe que nao seja numerica.

### `formulas.py`

- conter a lista oficial de formulas;
- ser facil de editar sem mexer no frontend;
- permanecer como unica fonte de verdade para expressao numerica.

### `indicators.py`

- conter apenas a estrutura da arvore;
- definir `id`, `label`, `type`, `unit`, `group`, `formulaId` e `children`;
- nao carregar valores numericos oficiais.

### `data_source.py`

- ser o unico ponto oficial de origem dos valores base;
- retornar apenas indicadores de entrada;
- manter a forma de retorno estavel para permitir trocar Excel por banco depois.

## Evolucao futura de `data_source.py`

O arquivo deve funcionar como uma fachada unica de dados:

1. ler configuracao do ambiente;
2. escolher a origem ativa;
3. consultar a fonte real;
4. normalizar os dados;
5. devolver os valores no formato esperado pelo motor.

Quando a empresa liberar a fonte real, a troca deve acontecer sem mudar o
frontend e, idealmente, sem mudar o motor de calculo.

### Fase 1: valores mockados

- manter dados fixos e reproduziveis;
- usar isso para desenvolvimento local e testes.

### Fase 2: leitura de Excel

- ler a planilha oficial da empresa;
- mapear colunas para os ids dos indicadores;
- validar tipos e unidades;
- rejeitar linhas ausentes ou inconsistentes antes do calculo.

### Fase 3: leitura de banco

- conectar em banco oficial com credenciais seguras;
- consultar por id do indicador e versao do dado;
- normalizar o resultado para o mesmo contrato do Excel;
- manter o mesmo formato para o motor nao mudar.

## Seguranca e credenciais

### Regras obrigatorias

- nunca versionar credenciais no GitHub;
- nunca colocar senha, token, chave ou string de conexao em `data_source.py`;
- nunca commitar `.env` real;
- usar apenas `.env.example` com nomes de variaveis, sem valores sensiveis;
- armazenar segredos em variaveis de ambiente ou cofre da infraestrutura.

### Exemplo de variaveis

- `VDT_DATA_SOURCE_MODE=mock|excel|database`
- `VDT_EXCEL_PATH=...`
- `VDT_DB_HOST=...`
- `VDT_DB_NAME=...`
- `VDT_DB_USER=...`
- `VDT_DB_PASSWORD=...`

Esses nomes podem existir no codigo, mas os valores reais jamais devem sair do
ambiente seguro.

### Boas praticas

- usar conta tecnica com menor privilegio possivel;
- separar permissao de leitura e escrita, quando existir;
- rotacionar credenciais periodicamente;
- registrar acesso e falhas em logs internos;
- evitar expor dados sensiveis em mensagens de erro.

## Fluxo de dados

1. o frontend solicita `/api/simulation/initial`;
2. o backend chama `data_source.py`;
3. `data_source.py` devolve os valores base dos inputs;
4. o motor combina esses valores com a estrutura de `indicators.py`;
5. o motor calcula tudo com `formulas.py`;
6. o frontend recebe a arvore completa e apenas renderiza.

Quando o usuario altera um input:

1. o frontend envia o estado atual;
2. o backend atualiza `whatIf` do input;
3. o motor recalcula a arvore inteira;
4. o frontend atualiza a interface.

## Contrato de saida esperado

O `data_source.py` deve entregar dados em um formato previsivel, com:

- id do indicador;
- `actual`;
- `budget`;
- `outlook`.

O `whatIf` nao deve ser tratado como dado oficial persistido.
Ele e um estado de execucao hidratado no backend a partir de `actual`.

## Validacoes futuras

Antes de calcular, o backend deve validar:

- se o indicador existe na estrutura;
- se o tipo e `input`;
- se o valor e numerico;
- se a origem retornou todos os campos obrigatorios;
- se nao ha divergencia de unidade ou identificador.

## Roadmap de implementacao

### Etapa 1

- manter mock atual;
- consolidar o contrato de saida;
- manter tests cobrindo `initial`, `update-input`, `apply-plan` e `reset`.

### Etapa 2

- criar adaptador de Excel;
- deixar o caminho configuravel por ambiente;
- validar mapeamento com uma planilha oficial.

### Etapa 3

- criar adaptador de banco;
- integrar com credenciais do ambiente interno;
- validar performance e observabilidade.

### Etapa 4

- desligar a fonte mock em producao;
- manter o mesmo contrato de API;
- monitorar regressao de dados e calculo.

## Nao objetivos desta fase

- nao conectar ao banco oficial agora;
- nao mover regra financeira para o frontend;
- nao expor credenciais no repositório;
- nao alterar a experiencia visual do usuario.

## Resumo pratico

Se esta documentacao for seguida, a mudanca futura de Excel para banco deve
exigir apenas a troca da implementacao interna de `data_source.py` e, quando
necessario, ajustes em arquivos de configuracao. O frontend e o motor de
calculo permanecem estaveis.
