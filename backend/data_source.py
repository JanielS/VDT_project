"""Official default values for input indicators.

Only input nodes live here. Derived nodes are recalculated by the engine and
should never be copied into this source file.
"""

try:
    from .models import IndicatorValueSet
except ImportError:
    from models import IndicatorValueSet


def make_values(actual: float, budget: float | None = None, outlook: float | None = None) -> IndicatorValueSet:
    if budget is None:
        budget = round(actual * 0.96 * 100) / 100
    if outlook is None:
        outlook = round(actual * 1.03 * 100) / 100
    return IndicatorValueSet(budget=budget, outlook=outlook, actual=actual)


# Grouped by business area so future Excel/DB migrations stay easy to scan.
DEFAULT_INPUT_VALUES = {
    'treatment_dmt': make_values(1400, 1344, 1442),
    'refining_payable': make_values(1600, 1536, 1648),
    'penalties_mgo': make_values(600, 576, 618),
    'hmp': make_values(42, 38, 44),
    'hmnp': make_values(18, 16, 20),
    'hpo': make_values(24, 21, 26),
    'wet_route_calendar_hours': make_values(720, 691.2, 741.6),
    'wet_route_productivity': make_values(340, 326.4, 350.2),
    'head_grade': make_values(0.0078, 0.01, 0.01),
    'cu_recovery': make_values(0.88, 0.84, 0.91),
    'cu_price': make_values(8600, 8256, 8858),
    'cu_concentrate_grade': make_values(0.28, 0.27, 0.29),
    'gold_concentrate_grade': make_values(0.035, 0.03, 0.04),
    'gold_price': make_values(1980, 1900.8, 2039.4),
    'ga_site': make_values(2500, 2400, 2575),
    'bh_office': make_values(1100, 1056, 1133),
    'drill_blasting': make_values(2600, 2496, 2678),
    'hauling': make_values(3800, 3648, 3914),
    'loading': make_values(2100, 2016, 2163),
    'mine_labour': make_values(2800, 2688, 2884),
    'ga_services': make_values(1700, 1632, 1751),
    'fuel': make_values(2400, 2304, 2472),
    'mine_support': make_values(1000, 960, 1030),
    'ball_aço_4_consumption': make_values(0.16, 0.15, 0.16),
    'ball_aço_4_price': make_values(1300, 1248, 1339),
    'ball_aço_3_consumption': make_values(0.12, 0.12, 0.12),
    'ball_aço_3_price': make_values(1220, 1171.2, 1256.6),
    'ceramic_ball_hig_1_consumption': make_values(0.05, 0.05, 0.05),
    'ceramic_ball_hig_1_price': make_values(2600, 2496, 2678),
    'ceramic_ball_hig_2_consumption': make_values(0.04, 0.04, 0.04),
    'ceramic_ball_hig_2_price': make_values(2750, 2640, 2832.5),
    'flocculant_consumption': make_values(0.025, 0.02, 0.03),
    'flocculant_price': make_values(4200, 4032, 4326),
    'frother_consumption': make_values(0.035, 0.03, 0.04),
    'frother_price': make_values(3100, 2976, 3193),
    'collector_1_consumption': make_values(0.041, 0.04, 0.04),
    'collector_1_price': make_values(5200, 4992, 5356),
    'collector_2_consumption': make_values(0.018, 0.02, 0.02),
    'collector_2_price': make_values(4900, 4704, 5047),
    'lime_consumption': make_values(0.72, 0.69, 0.74),
    'lime_price': make_values(180, 172.8, 185.4),
    'depressor_consumption': make_values(0.09, 0.09, 0.09),
    'depressor_price': make_values(2850, 2736, 2935.5),
    'activator_consumption': make_values(0.065, 0.06, 0.07),
    'activator_price': make_values(3600, 3456, 3708),
    'power': make_values(6800, 6528, 7004),
    'materials': make_values(2100, 2016, 2163),
    'services': make_values(1900, 1824, 1957),
    'labour_ga': make_values(4400, 4224, 4532),
    'water': make_values(720, 691.2, 741.6),
    'laboratory': make_values(560, 537.6, 576.8),
    'lube_fuel': make_values(920, 883.2, 947.6),
    'tsf': make_values(1350, 1296, 1390.5),
    'sea_freight': make_values(3100, 2976, 3193),
    'road_freight': make_values(2200, 2112, 2266),
    'port_operations': make_values(1250, 1200, 1287.5),
    'other_services': make_values(600, 576, 618),
    'logistics_labour': make_values(850, 816, 875.5),
}


def get_default_indicator_values() -> dict[str, IndicatorValueSet]:
    return {
        indicator_id: value.model_copy(deep=True)
        for indicator_id, value in DEFAULT_INPUT_VALUES.items()
    }
