"""Pydantic models used by the VDT calculation API.

The models are intentionally small and explicit so the contract stays easy to
edit when the backend grows to support Excel or database-backed sources.
"""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class IndicatorValueSet(BaseModel):
    budget: float
    outlook: float
    actual: float
    whatIf: float | None = None


class IndicatorBase(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    label: str
    type: Literal["input", "formula"]
    unit: str
    group: str | None = None
    formulaId: str | None = None
    children: list[str] | None = None


class IndicatorStructure(IndicatorBase):
    pass


class Indicator(IndicatorBase):
    values: IndicatorValueSet


class CalculatedIndicator(Indicator):
    formulaStatus: Literal["validated", "pending"] | None = None


class FormulaDefinition(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    label: str
    expression: str | None = None
    description: str | None = None
    dependencies: list[str] = Field(default_factory=list)
    status: Literal["validated", "pending"] = "validated"


class CalculationRequest(BaseModel):
    indicators: list[Indicator]


class UpdateInputRequest(CalculationRequest):
    indicatorId: str
    whatIf: float | None = None


class ApplyPlanRequest(CalculationRequest):
    scenario: Literal["budget", "outlook"]


class SimulationResponse(BaseModel):
    baseIndicators: list[Indicator]
    indicators: list[CalculatedIndicator]
    formulas: list[FormulaDefinition]
