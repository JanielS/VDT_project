import { create } from 'zustand';
import { getPathToRoot } from '../engine/dependencyGraph';
import { simulationApi } from '../services/simulationApi';
import type { FormulaDefinition } from '../types/formula';
import type { CalculatedIndicator, Indicator } from '../types/indicator';

type InteractionMode = 'pan' | 'select';
type ThemeMode = 'light' | 'dark';
type PlanScenario = 'budget' | 'outlook';

const initialExpandedIds = ['ebitda'];

type SimulationStore = {
  baseIndicators: Indicator[];
  indicators: CalculatedIndicator[];
  formulas: FormulaDefinition[];
  expandedIds: string[];
  selectedId?: string;
  sidePanelOpen: boolean;
  searchTerm: string;
  interactionMode: InteractionMode;
  themeMode: ThemeMode;
  selectedPath: string[];
  isCalculating: boolean;
  calculationError?: string;
  initializeSimulation: () => Promise<void>;
  setThemeMode: (themeMode: ThemeMode) => void;
  setInteractionMode: (interactionMode: InteractionMode) => void;
  toggleExpanded: (id: string) => void;
  selectIndicator: (id?: string) => void;
  updateWhatIf: (id: string, value?: number) => Promise<void>;
  applyPlanToWhatIf: (scenario: PlanScenario) => Promise<void>;
  resetSimulation: () => Promise<void>;
  setSidePanelOpen: (sidePanelOpen: boolean) => void;
  setSearchTerm: (searchTerm: string) => void;
};

const getInitialTheme = (): ThemeMode => {
  if (typeof localStorage === 'undefined') return 'light';
  return localStorage.getItem('vdt-theme') === 'dark' ? 'dark' : 'light';
};

let latestCalculationRequest = 0;
let activeRequest: AbortController | undefined;

const createRequest = () => {
  latestCalculationRequest += 1;
  activeRequest?.abort();
  activeRequest = new AbortController();
  return { requestId: latestCalculationRequest, signal: activeRequest.signal };
};

const isLatestRequest = (requestId: number) => requestId === latestCalculationRequest;

const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : 'Falha ao recalcular a simulacao.');

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  baseIndicators: [],
  indicators: [],
  formulas: [],
  expandedIds: initialExpandedIds,
  selectedId: 'ebitda',
  sidePanelOpen: false,
  searchTerm: '',
  interactionMode: 'select',
  themeMode: getInitialTheme(),
  selectedPath: ['ebitda'],
  isCalculating: false,
  calculationError: undefined,
  initializeSimulation: async () => {
    const { requestId, signal } = createRequest();
    set({ isCalculating: true, calculationError: undefined });

    try {
      const response = await simulationApi.initial(signal);
      if (!isLatestRequest(requestId)) return;
      set({
        baseIndicators: response.baseIndicators,
        indicators: response.indicators,
        formulas: response.formulas,
        selectedPath: getPathToRoot(response.indicators, get().selectedId),
        isCalculating: false,
      });
    } catch (error) {
      if (signal.aborted || !isLatestRequest(requestId)) return;
      set({ calculationError: getErrorMessage(error), isCalculating: false });
    }
  },
  setThemeMode: (themeMode) => {
    localStorage.setItem('vdt-theme', themeMode);
    set({ themeMode });
  },
  setInteractionMode: (interactionMode) => set({ interactionMode }),
  toggleExpanded: (id) => {
    const expanded = new Set(get().expandedIds);
    if (expanded.has(id)) expanded.delete(id);
    else expanded.add(id);
    set({ expandedIds: [...expanded] });
  },
  selectIndicator: (id) => {
    const indicators = get().indicators;
    set({
      selectedId: id,
      selectedPath: getPathToRoot(indicators, id),
    });
  },
  updateWhatIf: async (id, value) => {
    const { requestId, signal } = createRequest();
    set({ isCalculating: true, calculationError: undefined });

    try {
      const response = await simulationApi.updateInput(get().baseIndicators, id, value, signal);
      if (!isLatestRequest(requestId)) return;
      set({
        baseIndicators: response.baseIndicators,
        indicators: response.indicators,
        formulas: response.formulas,
        selectedPath: getPathToRoot(response.indicators, get().selectedId),
        isCalculating: false,
      });
    } catch (error) {
      if (signal.aborted || !isLatestRequest(requestId)) return;
      set({ calculationError: getErrorMessage(error), isCalculating: false });
    }
  },
  applyPlanToWhatIf: async (scenario) => {
    const { requestId, signal } = createRequest();
    set({ isCalculating: true, calculationError: undefined });

    try {
      const response = await simulationApi.applyPlan(get().baseIndicators, scenario, signal);
      if (!isLatestRequest(requestId)) return;
      set({
        baseIndicators: response.baseIndicators,
        indicators: response.indicators,
        formulas: response.formulas,
        selectedPath: getPathToRoot(response.indicators, get().selectedId),
        isCalculating: false,
      });
    } catch (error) {
      if (signal.aborted || !isLatestRequest(requestId)) return;
      set({ calculationError: getErrorMessage(error), isCalculating: false });
    }
  },
  resetSimulation: async () => {
    const { requestId, signal } = createRequest();
    set({ isCalculating: true, calculationError: undefined });

    try {
      const response = await simulationApi.reset(get().baseIndicators, signal);
      if (!isLatestRequest(requestId)) return;
      set({
        baseIndicators: response.baseIndicators,
        indicators: response.indicators,
        formulas: response.formulas,
        selectedId: 'ebitda',
        selectedPath: ['ebitda'],
        expandedIds: initialExpandedIds,
        isCalculating: false,
      });
    } catch (error) {
      if (signal.aborted || !isLatestRequest(requestId)) return;
      set({ calculationError: getErrorMessage(error), isCalculating: false });
    }
  },
  setSidePanelOpen: (sidePanelOpen) => set({ sidePanelOpen }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
}));
