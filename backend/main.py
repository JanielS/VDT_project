"""FastAPI entrypoint for the VDT calculation backend."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

try:
    from .calculation_engine import (
        apply_plan_to_what_if,
        build_default_indicators,
        recalculate_tree,
        reset_simulation,
        update_input_what_if,
    )
    from .formulas import get_formulas
    from .models import ApplyPlanRequest, CalculationRequest, Indicator, SimulationResponse, UpdateInputRequest
except ImportError:
    from calculation_engine import (
        apply_plan_to_what_if,
        build_default_indicators,
        recalculate_tree,
        reset_simulation,
        update_input_what_if,
    )
    from formulas import get_formulas
    from models import ApplyPlanRequest, CalculationRequest, Indicator, SimulationResponse, UpdateInputRequest

app = FastAPI(title="VDT Calculation API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def simulation_response(base_indicators: list[Indicator]) -> SimulationResponse:
    return SimulationResponse(
        baseIndicators=base_indicators,
        indicators=recalculate_tree(base_indicators),
        formulas=get_formulas(),
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/simulation/initial", response_model=SimulationResponse)
def initial() -> SimulationResponse:
    return simulation_response(build_default_indicators())


@app.post("/simulation/calculate", response_model=SimulationResponse)
def calculate(request: CalculationRequest) -> SimulationResponse:
    return simulation_response(request.indicators)


@app.post("/simulation/update-input", response_model=SimulationResponse)
def update_input(request: UpdateInputRequest) -> SimulationResponse:
    try:
        base_indicators = update_input_what_if(request.indicators, request.indicatorId, request.whatIf)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return simulation_response(base_indicators)


@app.post("/simulation/apply-plan", response_model=SimulationResponse)
def apply_plan(request: ApplyPlanRequest) -> SimulationResponse:
    return simulation_response(apply_plan_to_what_if(request.indicators, request.scenario))


@app.post("/simulation/reset", response_model=SimulationResponse)
def reset(request: CalculationRequest) -> SimulationResponse:
    return simulation_response(reset_simulation(request.indicators))
