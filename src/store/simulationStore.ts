import { create } from 'zustand';
import { formulasMock } from '../data/formulas.mock';
import { indicatorsMock } from '../data/indicators.mock';
import { calculateIndicators, updateInputWhatIf } from '../engine/calculationEngine';
import { getPathToRoot } from '../engine/dependencyGraph';
import type { CalculatedIndicator, Indicator } from '../types/indicator';

type InteractionMode = 'pan' | 'select';
type ThemeMode = 'light' | 'dark';

const initialIndicators: Indicator[] = indicatorsMock;
const initialExpandedIds = ['ebitda'];

type SimulationStore = {
  baseIndicators: Indicator[];
  indicators: CalculatedIndicator[];
  expandedIds: string[];
  selectedId?: string;
  sidePanelOpen: boolean;
  searchTerm: string;
  interactionMode: InteractionMode;
  themeMode: ThemeMode;
  selectedPath: string[];
  setThemeMode: (themeMode: ThemeMode) => void;
  setInteractionMode: (interactionMode: InteractionMode) => void;
  toggleExpanded: (id: string) => void;
  selectIndicator: (id?: string) => void;
  updateWhatIf: (id: string, value?: number) => void;
  resetSimulation: () => void;
  setSidePanelOpen: (sidePanelOpen: boolean) => void;
  setSearchTerm: (searchTerm: string) => void;
};

const getInitialTheme = (): ThemeMode => {
  if (typeof localStorage === 'undefined') return 'light';
  return localStorage.getItem('vdt-theme') === 'dark' ? 'dark' : 'light';
};

const recalculate = (indicators: Indicator[]) => calculateIndicators(indicators, formulasMock);

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  baseIndicators: initialIndicators,
  indicators: recalculate(initialIndicators),
  expandedIds: initialExpandedIds,
  selectedId: 'ebitda',
  sidePanelOpen: true,
  searchTerm: '',
  interactionMode: 'select',
  themeMode: getInitialTheme(),
  selectedPath: ['ebitda'],
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
  updateWhatIf: (id, value) => {
    const updated = updateInputWhatIf(get().baseIndicators, id, value);
    const calculated = recalculate(updated);
    set({
      baseIndicators: updated,
      indicators: calculated,
      selectedPath: getPathToRoot(calculated, get().selectedId),
    });
  },
  resetSimulation: () => {
    const reset = initialIndicators.map((indicator) => ({
      ...indicator,
      values: {
        ...indicator.values,
        whatIf: indicator.values.actual,
      },
    }));
    const calculated = recalculate(reset);
    set({
      baseIndicators: reset,
      indicators: calculated,
      selectedId: 'ebitda',
      selectedPath: ['ebitda'],
      expandedIds: initialExpandedIds,
    });
  },
  setSidePanelOpen: (sidePanelOpen) => set({ sidePanelOpen }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
}));
