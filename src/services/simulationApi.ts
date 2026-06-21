import type { FormulaDefinition } from '../types/formula';
import type { CalculatedIndicator, Indicator } from '../types/indicator';

type PlanScenario = 'budget' | 'outlook';

type SimulationResponse = {
  baseIndicators: Indicator[];
  indicators: CalculatedIndicator[];
  formulas: FormulaDefinition[];
};

const API_BASE_URL =
  import.meta.env.VITE_SIMULATION_API_URL ??
  'https://vdt-calculation-engine-janiels-projects-64eb2efd.vercel.app';

async function postSimulation(path: string, body: unknown, signal?: AbortSignal): Promise<SimulationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/simulation${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => undefined);
    const message = typeof payload?.detail === 'string' ? payload.detail : 'Falha ao recalcular a simulacao.';
    throw new Error(message);
  }

  return response.json();
}

export const simulationApi = {
  async initial(signal?: AbortSignal): Promise<SimulationResponse> {
    const response = await fetch(`${API_BASE_URL}/api/simulation/initial`, { signal });

    if (!response.ok) {
      throw new Error('Falha ao carregar os dados iniciais da simulacao.');
    }

    return response.json();
  },
  calculate(indicators: Indicator[], signal?: AbortSignal) {
    return postSimulation('/calculate', { indicators }, signal);
  },
  updateInput(
    indicators: Indicator[],
    indicatorId: string,
    whatIf: number | undefined,
    signal?: AbortSignal,
  ) {
    return postSimulation('/update-input', { indicators, indicatorId, whatIf }, signal);
  },
  applyPlan(indicators: Indicator[], scenario: PlanScenario, signal?: AbortSignal) {
    return postSimulation('/apply-plan', { indicators, scenario }, signal);
  },
  reset(indicators: Indicator[], signal?: AbortSignal) {
    return postSimulation('/reset', { indicators }, signal);
  },
};
