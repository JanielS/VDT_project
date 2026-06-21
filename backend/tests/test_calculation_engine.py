import pytest

from backend.calculation_engine import build_default_indicators, calculate_indicators, recalculate_tree, reset_simulation, update_input_what_if
from backend.data_source import get_default_indicator_values
from backend.formulas import get_formulas
from backend.formula_evaluator import evaluate_expression
from backend.main import initial
from backend.indicators import get_indicator_structures
from backend.models import FormulaDefinition, Indicator, IndicatorValueSet


def values(actual: float, what_if: float | None = None) -> IndicatorValueSet:
    return IndicatorValueSet(
        budget=round(actual * 0.96, 2),
        outlook=round(actual * 1.03, 2),
        actual=actual,
        whatIf=actual if what_if is None else what_if,
    )


def fixture_tree() -> tuple[list[Indicator], list[FormulaDefinition]]:
    indicators = [
        Indicator(id="ebitda", label="EBITDA", type="formula", unit="kUSD", formulaId="ebitda_formula", children=["revenue", "costs"], values=values(0)),
        Indicator(id="revenue", label="Revenue", type="formula", unit="kUSD", formulaId="revenue_formula", children=["volume", "price"], values=values(0)),
        Indicator(id="volume", label="Volume", type="input", unit="t", values=values(10)),
        Indicator(id="price", label="Price", type="input", unit="USD/t", values=values(5)),
        Indicator(id="costs", label="Costs", type="input", unit="kUSD", values=values(12)),
        Indicator(id="revenue_ref", label="Revenue Ref", type="formula", unit="kUSD", formulaId="revenue_ref_formula", values=values(0)),
    ]
    formulas = [
        FormulaDefinition(id="ebitda_formula", label="EBITDA", expression="revenue - costs", dependencies=["revenue", "costs"]),
        FormulaDefinition(id="revenue_formula", label="Revenue", expression="volume * price", dependencies=["volume", "price"]),
        FormulaDefinition(id="revenue_ref_formula", label="Revenue Ref", expression="revenue", dependencies=["revenue"]),
    ]
    return indicators, formulas


def test_calculates_ebitda_from_tree() -> None:
    indicators, formulas = fixture_tree()
    calculated = calculate_indicators(indicators, formulas)
    ebitda = next(indicator for indicator in calculated if indicator.id == "ebitda")

    assert ebitda.type == "formula"
    assert ebitda.values.whatIf == 38


def test_falls_back_to_actual_when_what_if_is_absent() -> None:
    indicators, formulas = fixture_tree()
    indicators[3].values.whatIf = None
    calculated = calculate_indicators(indicators, formulas)
    price = next(indicator for indicator in calculated if indicator.id == "price")
    ebitda = next(indicator for indicator in calculated if indicator.id == "ebitda")

    assert (price.values.whatIf or price.values.actual) == price.values.actual
    assert ebitda.values.whatIf == 38


def test_recalculates_dependents_after_input_change() -> None:
    indicators, formulas = fixture_tree()
    before = calculate_indicators(indicators, formulas)
    updated = update_input_what_if(indicators, "price", 8)
    after = calculate_indicators(updated, formulas)

    before_ebitda = next(indicator for indicator in before if indicator.id == "ebitda")
    after_ebitda = next(indicator for indicator in after if indicator.id == "ebitda")
    assert after_ebitda.values.whatIf != before_ebitda.values.whatIf
    assert after_ebitda.values.whatIf == 68


def test_blocks_manual_edits_on_formula_indicators() -> None:
    indicators, _ = fixture_tree()

    with pytest.raises(ValueError, match="calculado automaticamente"):
        update_input_what_if(indicators, "ebitda", 1)


def test_terminal_references_use_dependency_without_visual_child() -> None:
    indicators, formulas = fixture_tree()
    calculated = calculate_indicators(indicators, formulas)
    revenue = next(indicator for indicator in calculated if indicator.id == "revenue")
    revenue_ref = next(indicator for indicator in calculated if indicator.id == "revenue_ref")

    assert revenue_ref.children is None
    assert revenue_ref.values.whatIf == revenue.values.whatIf


def test_reset_restores_actual_as_what_if() -> None:
    indicators, _ = fixture_tree()
    updated = update_input_what_if(indicators, "price", 8)
    reset = reset_simulation(updated)
    ebitda = next(indicator for indicator in reset if indicator.id == "ebitda")

    assert ebitda.values.whatIf == ebitda.values.actual


def test_initial_response_uses_backend_defaults_and_formulas() -> None:
    response = initial()
    ebitda = next(indicator for indicator in response.indicators if indicator.id == "ebitda")
    inputs = [indicator for indicator in response.baseIndicators if indicator.type == "input"]

    assert response.formulas == get_formulas()
    assert ebitda.values.whatIf == ebitda.values.actual
    assert all(indicator.values.whatIf == indicator.values.actual for indicator in inputs)
    assert set(get_default_indicator_values()) == {structure.id for structure in get_indicator_structures() if structure.type == "input"}
    assert 'ebitda' not in get_default_indicator_values()
    assert 'gross_revenue' not in get_default_indicator_values()


def test_data_source_contains_only_input_defaults() -> None:
    default_ids = set(get_default_indicator_values())
    input_ids = {structure.id for structure in get_indicator_structures() if structure.type == 'input'}
    formula_ids = {structure.id for structure in get_indicator_structures() if structure.type == 'formula'}

    assert default_ids == input_ids
    assert default_ids.isdisjoint(formula_ids)


def test_official_backend_tree_recalculates_after_input_change() -> None:
    indicators = build_default_indicators()
    before = recalculate_tree(indicators)
    updated = update_input_what_if(indicators, "cu_price", 9600)
    after = recalculate_tree(updated)

    before_ebitda = next(indicator for indicator in before if indicator.id == "ebitda")
    after_ebitda = next(indicator for indicator in after if indicator.id == "ebitda")

    assert after_ebitda.values.whatIf != before_ebitda.values.whatIf


def test_formula_evaluator_rejects_unsupported_syntax() -> None:
    with pytest.raises(ValueError):
        evaluate_expression("__import__('os').system('echo nope')", {})


def test_formula_evaluator_returns_zero_for_division_by_zero() -> None:
    assert evaluate_expression("x / y", {"x": 1, "y": 0}) == 0
