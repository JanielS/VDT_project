"""Official formula catalog for the VDT engine.

This file is intentionally data-first. When a formula changes, edit it here and
leave the frontend untouched.
"""

try:
    from .models import FormulaDefinition
except ImportError:
    from models import FormulaDefinition


# Keep formulas grouped by business branch to make edits easier to review.
FORMULAS = [
    FormulaDefinition(**{
        "id": "ebitda_formula",
        "label": "EBITDA",
        "expression": "net_revenue - operating_costs",
        "dependencies": [
            "net_revenue",
            "operating_costs",
        ],
        "status": "validated",
        "description": "EBITDA calculado como receita líquida menos custos operacionais.",
    }),
    FormulaDefinition(**{
        "id": "net_revenue_formula",
        "label": "Receita Líquida",
        "expression": "gross_revenue - smelters",
        "dependencies": [
            "gross_revenue",
            "smelters",
        ],
        "status": "validated",
        "description": "Receita líquida após efeitos de smelters.",
    }),
    FormulaDefinition(**{
        "id": "gross_revenue_formula",
        "label": "Receita Bruta",
        "expression": "copper_revenue + gold_revenue",
        "dependencies": [
            "copper_revenue",
            "gold_revenue",
        ],
        "status": "validated",
        "description": "Soma dos indicadores filhos conforme estrutura do fluxo de valor.",
    }),
    FormulaDefinition(**{
        "id": "copper_revenue_formula",
        "label": "Receita do Cu",
        "expression": "contained_copper * cu_price / 1000",
        "dependencies": [
            "contained_copper",
            "cu_price",
        ],
        "status": "validated",
        "description": "Cobre contido multiplicado pelo preço do cobre, convertido para kUSD.",
    }),
    FormulaDefinition(**{
        "id": "contained_copper_formula",
        "label": "Cobre Contido",
        "expression": "wet_feed_mass * head_grade * cu_recovery",
        "dependencies": [
            "wet_feed_mass",
            "head_grade",
            "cu_recovery",
        ],
        "status": "validated",
        "description": "Massa alimentada vezes teor de cobre e recuperação de cobre.",
    }),
    FormulaDefinition(**{
        "id": "wet_feed_mass_formula",
        "label": "Massa de Alimentação Via Úmida",
        "expression": "wet_route_productivity * wet_route_efficiency * wet_route_calendar_hours",
        "dependencies": [
            "wet_route_productivity",
            "wet_route_efficiency",
            "wet_route_calendar_hours",
        ],
        "status": "validated",
        "description": "Produtividade da via úmida ajustada pela eficiência e horas calendário.",
    }),
    FormulaDefinition(**{
        "id": "wet_feed_mass_reference_formula",
        "label": "Massa de Alimentação Via Úmida (referência)",
        "expression": "wet_feed_mass",
        "dependencies": [
            "wet_feed_mass",
        ],
        "status": "validated",
        "description": "Referência visual terminal para ramos de consumo específico que dependem da massa de alimentação via úmida.",
    }),
    FormulaDefinition(**{
        "id": "wet_route_efficiency_formula",
        "label": "Eficiência da Via Úmida",
        "expression": "df_wet_route * ut_wet_route",
        "dependencies": [
            "df_wet_route",
            "ut_wet_route",
        ],
        "status": "validated",
        "description": "Eficiência composta por disponibilidade física e utilização.",
    }),
    FormulaDefinition(**{
        "id": "ut_wet_route_formula",
        "label": "UT Via Úmida",
        "expression": "(hmp - hmnp - stopped_hours) / hmp",
        "dependencies": [
            "hmp",
            "hmnp",
            "stopped_hours",
        ],
        "status": "validated",
        "description": "Utilização operacional da via úmida considerando horas paradas.",
    }),
    FormulaDefinition(**{
        "id": "gold_revenue_formula",
        "label": "Receita do Ouro",
        "expression": "contained_gold_concentrate * gold_price / 1000",
        "dependencies": [
            "contained_gold_concentrate",
            "gold_price",
        ],
        "status": "validated",
        "description": "Ouro contido no concentrado multiplicado pelo preço do ouro.",
    }),
    FormulaDefinition(**{
        "id": "contained_gold_formula",
        "label": "Ouro Contido no Concentrado",
        "expression": "concentrate_mass * gold_concentrate_grade",
        "dependencies": [
            "concentrate_mass",
            "gold_concentrate_grade",
        ],
        "status": "validated",
        "description": "Massa de concentrado multiplicada pelo teor de ouro.",
    }),
    FormulaDefinition(**{
        "id": "concentrate_mass_formula",
        "label": "Massa de Concentrado Cu",
        "expression": "contained_copper / cu_concentrate_grade",
        "dependencies": [
            "contained_copper",
            "cu_concentrate_grade",
        ],
        "status": "validated",
        "description": "Massa estimada de concentrado a partir do cobre contido e teor do concentrado.",
    }),
    FormulaDefinition(**{
        "id": "contained_copper_reference_formula",
        "label": "Cobre Contido (referencia)",
        "expression": "contained_copper",
        "dependencies": [
            "contained_copper",
        ],
        "status": "validated",
        "description": "Referencia visual terminal para indicar que a massa de concentrado depende do cobre contido calculado no ramo de receita de cobre.",
    }),
    FormulaDefinition(**{
        "id": "operating_costs_formula",
        "label": "Custos Operacionais",
        "expression": "support_costs + production_costs",
        "dependencies": [
            "support_costs",
            "production_costs",
        ],
        "status": "validated",
        "description": "Soma dos indicadores filhos conforme estrutura do fluxo de valor.",
    }),
    FormulaDefinition(**{
        "id": "production_costs_formula",
        "label": "Custos de Produção",
        "expression": "mine_costs + plant_costs + logistics_costs",
        "dependencies": [
            "mine_costs",
            "plant_costs",
            "logistics_costs",
        ],
        "status": "validated",
        "description": "Soma dos indicadores filhos conforme estrutura do fluxo de valor.",
    }),
    FormulaDefinition(**{
        "id": "sum_children_formula",
        "label": "Soma dos filhos",
        "expression": "",
        "dependencies": [],
        "status": "validated",
        "description": "Soma dos indicadores filhos conforme estrutura do fluxo de valor.",
    }),
    FormulaDefinition(**{
        "id": "ball_aço_4_qty_formula",
        "label": "Quantidade Bola Aço 4\"",
        "expression": "ball_aço_4_consumption * wet_feed_mass / 1000",
        "dependencies": [
            "ball_aço_4_consumption",
            "wet_feed_mass",
        ],
        "status": "validated",
        "description": "Quantidade calculada por consumo especifico multiplicado pela massa de alimentacao da via umida.",
    }),
    FormulaDefinition(**{
        "id": "ball_aço_4_formula",
        "label": "Custo Bola Aço 4\"",
        "expression": "ball_aço_4_quantity * ball_aço_4_price / 1000",
        "dependencies": [
            "ball_aço_4_quantity",
            "ball_aço_4_price",
        ],
        "status": "validated",
        "description": "Custo calculado por quantidade multiplicada pelo preco, convertido para kUSD.",
    }),
    FormulaDefinition(**{
        "id": "ball_aço_3_qty_formula",
        "label": "Quantidade Bola Aço 3\"",
        "expression": "ball_aço_3_consumption * wet_feed_mass / 1000",
        "dependencies": [
            "ball_aço_3_consumption",
            "wet_feed_mass",
        ],
        "status": "validated",
        "description": "Quantidade calculada por consumo especifico multiplicado pela massa de alimentacao da via umida.",
    }),
    FormulaDefinition(**{
        "id": "ball_aço_3_formula",
        "label": "Custo Bola Aço 3\"",
        "expression": "ball_aço_3_quantity * ball_aço_3_price / 1000",
        "dependencies": [
            "ball_aço_3_quantity",
            "ball_aço_3_price",
        ],
        "status": "validated",
        "description": "Custo calculado por quantidade multiplicada pelo preco, convertido para kUSD.",
    }),
    FormulaDefinition(**{
        "id": "ceramic_ball_hig_1_qty_formula",
        "label": "Quantidade Cerâmica Hig 1",
        "expression": "ceramic_ball_hig_1_consumption * wet_feed_mass / 1000",
        "dependencies": [
            "ceramic_ball_hig_1_consumption",
            "wet_feed_mass",
        ],
        "status": "validated",
        "description": "Quantidade calculada por consumo especifico multiplicado pela massa de alimentacao da via umida.",
    }),
    FormulaDefinition(**{
        "id": "ceramic_ball_hig_1_formula",
        "label": "Custo Bola Cerâmica Hig 1",
        "expression": "ceramic_ball_hig_1_quantity * ceramic_ball_hig_1_price / 1000",
        "dependencies": [
            "ceramic_ball_hig_1_quantity",
            "ceramic_ball_hig_1_price",
        ],
        "status": "validated",
        "description": "Custo calculado por quantidade multiplicada pelo preco, convertido para kUSD.",
    }),
    FormulaDefinition(**{
        "id": "ceramic_ball_hig_2_qty_formula",
        "label": "Quantidade Cerâmica Hig 2",
        "expression": "ceramic_ball_hig_2_consumption * wet_feed_mass / 1000",
        "dependencies": [
            "ceramic_ball_hig_2_consumption",
            "wet_feed_mass",
        ],
        "status": "validated",
        "description": "Quantidade calculada por consumo especifico multiplicado pela massa de alimentacao da via umida.",
    }),
    FormulaDefinition(**{
        "id": "ceramic_ball_hig_2_formula",
        "label": "Custo Bola Cerâmica Hig 2",
        "expression": "ceramic_ball_hig_2_quantity * ceramic_ball_hig_2_price / 1000",
        "dependencies": [
            "ceramic_ball_hig_2_quantity",
            "ceramic_ball_hig_2_price",
        ],
        "status": "validated",
        "description": "Custo calculado por quantidade multiplicada pelo preco, convertido para kUSD.",
    }),
    FormulaDefinition(**{
        "id": "flocculant_qty_formula",
        "label": "Quantidade Floculante",
        "expression": "flocculant_consumption * wet_feed_mass / 1000",
        "dependencies": [
            "flocculant_consumption",
            "wet_feed_mass",
        ],
        "status": "validated",
        "description": "Quantidade calculada por consumo especifico multiplicado pela massa de alimentacao da via umida.",
    }),
    FormulaDefinition(**{
        "id": "flocculant_formula",
        "label": "Custo de Floculante",
        "expression": "flocculant_quantity * flocculant_price / 1000",
        "dependencies": [
            "flocculant_quantity",
            "flocculant_price",
        ],
        "status": "validated",
        "description": "Custo calculado por quantidade multiplicada pelo preco, convertido para kUSD.",
    }),
    FormulaDefinition(**{
        "id": "frother_qty_formula",
        "label": "Quantidade Espumante",
        "expression": "frother_consumption * wet_feed_mass / 1000",
        "dependencies": [
            "frother_consumption",
            "wet_feed_mass",
        ],
        "status": "validated",
        "description": "Quantidade calculada por consumo especifico multiplicado pela massa de alimentacao da via umida.",
    }),
    FormulaDefinition(**{
        "id": "frother_formula",
        "label": "Custo de Espumante",
        "expression": "frother_quantity * frother_price / 1000",
        "dependencies": [
            "frother_quantity",
            "frother_price",
        ],
        "status": "validated",
        "description": "Custo calculado por quantidade multiplicada pelo preco, convertido para kUSD.",
    }),
    FormulaDefinition(**{
        "id": "collector_1_qty_formula",
        "label": "Quantidade Coletor 1",
        "expression": "collector_1_consumption * wet_feed_mass / 1000",
        "dependencies": [
            "collector_1_consumption",
            "wet_feed_mass",
        ],
        "status": "validated",
        "description": "Quantidade calculada por consumo especifico multiplicado pela massa de alimentacao da via umida.",
    }),
    FormulaDefinition(**{
        "id": "collector_1_formula",
        "label": "Custo de Coletor 1",
        "expression": "collector_1_quantity * collector_1_price / 1000",
        "dependencies": [
            "collector_1_quantity",
            "collector_1_price",
        ],
        "status": "validated",
        "description": "Custo calculado por quantidade multiplicada pelo preco, convertido para kUSD.",
    }),
    FormulaDefinition(**{
        "id": "collector_2_qty_formula",
        "label": "Quantidade Coletor 2",
        "expression": "collector_2_consumption * wet_feed_mass / 1000",
        "dependencies": [
            "collector_2_consumption",
            "wet_feed_mass",
        ],
        "status": "validated",
        "description": "Quantidade calculada por consumo especifico multiplicado pela massa de alimentacao da via umida.",
    }),
    FormulaDefinition(**{
        "id": "collector_2_formula",
        "label": "Custo de Coletor 2",
        "expression": "collector_2_quantity * collector_2_price / 1000",
        "dependencies": [
            "collector_2_quantity",
            "collector_2_price",
        ],
        "status": "validated",
        "description": "Custo calculado por quantidade multiplicada pelo preco, convertido para kUSD.",
    }),
    FormulaDefinition(**{
        "id": "lime_qty_formula",
        "label": "Quantidade Cal",
        "expression": "lime_consumption * wet_feed_mass / 1000",
        "dependencies": [
            "lime_consumption",
            "wet_feed_mass",
        ],
        "status": "validated",
        "description": "Quantidade calculada por consumo especifico multiplicado pela massa de alimentacao da via umida.",
    }),
    FormulaDefinition(**{
        "id": "lime_formula",
        "label": "Custo de Cal",
        "expression": "lime_quantity * lime_price / 1000",
        "dependencies": [
            "lime_quantity",
            "lime_price",
        ],
        "status": "validated",
        "description": "Custo calculado por quantidade multiplicada pelo preco, convertido para kUSD.",
    }),
    FormulaDefinition(**{
        "id": "depressor_qty_formula",
        "label": "Quantidade Depressor",
        "expression": "depressor_consumption * wet_feed_mass / 1000",
        "dependencies": [
            "depressor_consumption",
            "wet_feed_mass",
        ],
        "status": "validated",
        "description": "Quantidade calculada por consumo especifico multiplicado pela massa de alimentacao da via umida.",
    }),
    FormulaDefinition(**{
        "id": "depressor_formula",
        "label": "Custo de Depressor",
        "expression": "depressor_quantity * depressor_price / 1000",
        "dependencies": [
            "depressor_quantity",
            "depressor_price",
        ],
        "status": "validated",
        "description": "Custo calculado por quantidade multiplicada pelo preco, convertido para kUSD.",
    }),
    FormulaDefinition(**{
        "id": "activator_qty_formula",
        "label": "Quantidade Ativador",
        "expression": "activator_consumption * wet_feed_mass / 1000",
        "dependencies": [
            "activator_consumption",
            "wet_feed_mass",
        ],
        "status": "validated",
        "description": "Quantidade calculada por consumo especifico multiplicado pela massa de alimentacao da via umida.",
    }),
    FormulaDefinition(**{
        "id": "activator_formula",
        "label": "Custo de Ativador",
        "expression": "activator_quantity * activator_price / 1000",
        "dependencies": [
            "activator_quantity",
            "activator_price",
        ],
        "status": "validated",
        "description": "Custo calculado por quantidade multiplicada pelo preco, convertido para kUSD.",
    }),
]


def get_formulas() -> list[FormulaDefinition]:
    return [formula.model_copy(deep=True) for formula in FORMULAS]
