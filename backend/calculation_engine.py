"""Calculation engine for the VDT tree.

The engine keeps the business rules in one place and treats the frontend as a
pure consumer of calculated state. Inputs come from the data source, formulas
live in ``formulas.py`` and the engine combines both into a recalculated tree.
"""

from typing import Literal

try:
    from .data_source import get_default_indicator_values
    from .formula_evaluator import evaluate_expression
    from .formulas import get_formulas
    from .indicators import get_indicator_structures
    from .models import CalculatedIndicator, FormulaDefinition, Indicator, IndicatorStructure, IndicatorValueSet
except ImportError:
    from data_source import get_default_indicator_values
    from formula_evaluator import evaluate_expression
    from formulas import get_formulas
    from indicators import get_indicator_structures
    from models import CalculatedIndicator, FormulaDefinition, Indicator, IndicatorStructure, IndicatorValueSet

Scenario = Literal["budget", "outlook", "actual", "whatIf"]


def value_of(indicator: Indicator) -> float:
    return indicator.values.whatIf if indicator.values.whatIf is not None else indicator.values.actual


def scenario_value_of(indicator: Indicator, scenario: Scenario) -> float:
    if scenario == "whatIf":
        return value_of(indicator)
    return getattr(indicator.values, scenario)


def round_currency(value: float) -> float:
    return round(value * 100) / 100


def _empty_formula_values() -> IndicatorValueSet:
    return IndicatorValueSet(budget=0, outlook=0, actual=0, whatIf=0)


def _hydrate_indicator(structure: IndicatorStructure, values_by_id: dict[str, IndicatorValueSet]) -> Indicator:
    if structure.type == "input":
        values = values_by_id.get(structure.id)
        if values is None:
            raise ValueError(f"Missing default values for indicator: {structure.id}")
        indicator_values = values.model_copy(deep=True)
        indicator_values.whatIf = indicator_values.actual
    else:
        indicator_values = _empty_formula_values()

    return Indicator(**structure.model_dump(), values=indicator_values)


def calculate_indicators(indicators: list[Indicator], formulas: list[FormulaDefinition]) -> list[CalculatedIndicator]:
    by_id = {indicator.id: indicator.model_copy(deep=True) for indicator in indicators}
    formulas_by_id = {formula.id: formula for formula in formulas}
    visiting: set[str] = set()
    calculated: set[str] = set()

    def calculate(indicator_id: str) -> float:
        indicator = by_id.get(indicator_id)
        if indicator is None:
            return 0
        if indicator_id in calculated or indicator_id in visiting:
            return value_of(indicator)

        visiting.add(indicator_id)

        if indicator.type == "formula":
            child_ids = indicator.children or []
            for child_id in child_ids:
                calculate(child_id)

            formula = formulas_by_id.get(indicator.formulaId) if indicator.formulaId else None
            is_generic_sum = indicator.formulaId == "sum_children_formula"
            dependency_ids = formula.dependencies if formula and formula.dependencies else child_ids

            for dependency_id in dependency_ids:
                calculate(dependency_id)

            def read(dependency_id: str, scenario: Scenario) -> float:
                dependency = by_id.get(dependency_id)
                return scenario_value_of(dependency or indicator, scenario)

            def calculate_scenario_value(scenario: Scenario) -> float:
                if formula and formula.status == "pending":
                    if child_ids:
                        return sum(read(child_id, scenario) for child_id in child_ids)
                    return scenario_value_of(indicator, scenario)

                if is_generic_sum:
                    return sum(read(child_id, scenario) for child_id in child_ids)

                if formula and formula.expression:
                    context = {dependency_id: read(dependency_id, scenario) for dependency_id in dependency_ids}
                    return evaluate_expression(formula.expression, context)

                if child_ids:
                    return sum(read(child_id, scenario) for child_id in child_ids)

                return scenario_value_of(indicator, scenario)

            indicator.values.budget = round_currency(calculate_scenario_value("budget"))
            indicator.values.outlook = round_currency(calculate_scenario_value("outlook"))
            indicator.values.actual = round_currency(calculate_scenario_value("actual"))
            indicator.values.whatIf = round_currency(calculate_scenario_value("whatIf"))

        calculated.add(indicator_id)
        visiting.remove(indicator_id)
        return value_of(indicator)

    for indicator in indicators:
        calculate(indicator.id)

    result: list[CalculatedIndicator] = []
    for indicator in indicators:
        calculated_indicator = CalculatedIndicator.model_validate(by_id[indicator.id].model_dump())
        formula = formulas_by_id.get(calculated_indicator.formulaId) if calculated_indicator.formulaId else None
        if calculated_indicator.type == "formula":
            calculated_indicator.formulaStatus = formula.status if formula else "pending"
        result.append(calculated_indicator)

    return result


def build_default_indicators() -> list[Indicator]:
    """Build the bootstrap tree used by the API and reset endpoint."""

    values_by_id = get_default_indicator_values()
    return [_hydrate_indicator(structure, values_by_id) for structure in get_indicator_structures()]


def recalculate_tree(indicators: list[Indicator]) -> list[CalculatedIndicator]:
    return calculate_indicators(indicators, get_formulas())


def update_input_what_if(indicators: list[Indicator], indicator_id: str, what_if: float | None) -> list[Indicator]:
    updated: list[Indicator] = []

    for indicator in indicators:
        if indicator.id != indicator_id:
            updated.append(indicator)
            continue

        if indicator.type != "input":
            raise ValueError(
                "Este indicador e calculado automaticamente. Para altera-lo, ajuste uma das variaveis de entrada relacionadas."
            )

        next_indicator = indicator.model_copy(deep=True)
        next_indicator.values.whatIf = what_if
        updated.append(next_indicator)

    return updated


def apply_plan_to_what_if(indicators: list[Indicator], scenario: Literal["budget", "outlook"]) -> list[Indicator]:
    updated: list[Indicator] = []

    for indicator in indicators:
        next_indicator = indicator.model_copy(deep=True)
        if next_indicator.type == "input":
            next_indicator.values.whatIf = getattr(next_indicator.values, scenario)
        updated.append(next_indicator)

    return updated


def reset_simulation(indicators: list[Indicator]) -> list[Indicator]:
    return build_default_indicators()
