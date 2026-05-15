import { X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useSimulationStore } from '../../store/simulationStore';

type TourStep = {
  countInTour?: boolean;
  id: string;
  selector: string;
  text: string;
  illustration?: 'middle-drag';
  placement?: 'left' | 'right' | 'bottom' | 'center';
  nextLabel?: string;
};

const steps: TourStep[] = [
  {
    id: 'intro',
    selector: '[data-tour="node-ebitda"]',
    text: 'O EBITDA e o ponto de partida. Siga pela cadeia de receita para abrir os proximos niveis.',
    nextLabel: 'Comecar',
  },
  {
    id: 'expand-net-revenue',
    selector: '[data-tour="expand-net_revenue"]',
    text: 'Expanda Receita Liquida.',
  },
  {
    countInTour: false,
    id: 'middle-drag',
    selector: '[data-tour="canvas-navigation"]',
    text: 'Clique na bolinha do mouse e arraste para a esquerda.',
    illustration: 'middle-drag',
    placement: 'center',
  },
  {
    id: 'expand-gross-revenue',
    selector: '[data-tour="expand-gross_revenue"]',
    text: 'Agora expanda Receita Bruta e mantenha o fluxo centralizado.',
  },
  {
    id: 'expand-copper-revenue',
    selector: '[data-tour="expand-copper_revenue"]',
    text: 'Expanda Receita do Cu para chegar aos drivers de cobre.',
  },
  {
    id: 'expand-contained-copper',
    selector: '[data-tour="expand-contained_copper"]',
    text: 'Expanda Cobre Contido. O proximo ajuste sera no Head Grade.',
  },
  {
    id: 'edit-head-grade',
    selector: '[data-tour="node-whatif-head_grade"]',
    text: 'Altere o What If de Head Grade e confirme com Enter ou saindo do campo.',
  },
  {
    id: 'fit-view',
    selector: '.react-flow__controls-fitview',
    text: 'Clique em Fit View para enxergar a arvore completa.',
  },
  {
    id: 'open-panel',
    selector: '[data-tour="panel-toggle"]',
    text: 'Abra o painel de inputs para editar alavancas em lista.',
  },
  {
    id: 'scroll-panel',
    selector: '[data-tour="panel-list"]',
    text: 'Role o painel para navegar por todas as alavancas disponiveis.',
    placement: 'right',
  },
  {
    id: 'search-hmp',
    selector: '[data-tour="panel-search"]',
    text: 'Digite HMP na pesquisa para filtrar a alavanca.',
    placement: 'right',
  },
  {
    id: 'edit-hmp',
    selector: '[data-tour="panel-whatif-hmp"]',
    text: 'Altere o What If de HMP por aqui e confirme o valor.',
    placement: 'right',
  },
  {
    id: 'watch-ebitda',
    selector: '[data-tour="ebitda-kpi"]',
    text: 'O EBITDA What If reflete as alteracoes em tempo real.',
    placement: 'left',
    nextLabel: 'Entendi',
  },
  {
    id: 'close-panel',
    selector: '[data-tour="panel-toggle"]',
    text: 'Recolha o painel para liberar espaco no canvas.',
  },
  {
    id: 'selected-details',
    selector: '[data-tour="selected-details"]',
    text: 'A lateral direita mostra os detalhes do card selecionado.',
    placement: 'left',
    nextLabel: 'Continuar',
  },
  {
    id: 'reset-simulation',
    selector: '[data-tour="reset-simulation"]',
    text: 'Resete a simulacao para restaurar os valores de referencia.',
  },
  {
    id: 'dark-theme',
    selector: '[data-tour="theme-toggle"]',
    text: 'Ative o tema escuro para alternar a leitura da interface.',
  },
];

type Highlight = {
  height: number;
  left: number;
  top: number;
  width: number;
};

const padding = 8;
const totalTourSteps = steps.filter((step) => step.countInTour !== false).length;

export function UserTour() {
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [highlight, setHighlight] = useState<Highlight>();
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const middleDragStartX = useRef<number | null>(null);
  const indicators = useSimulationStore((state) => state.indicators);
  const expandedIds = useSimulationStore((state) => state.expandedIds);
  const sidePanelOpen = useSimulationStore((state) => state.sidePanelOpen);
  const searchTerm = useSimulationStore((state) => state.searchTerm);
  const themeMode = useSimulationStore((state) => state.themeMode);
  const resetSimulation = useSimulationStore((state) => state.resetSimulation);
  const selectIndicator = useSimulationStore((state) => state.selectIndicator);
  const setInteractionMode = useSimulationStore((state) => state.setInteractionMode);
  const setSearchTerm = useSimulationStore((state) => state.setSearchTerm);
  const setSidePanelOpen = useSimulationStore((state) => state.setSidePanelOpen);
  const setThemeMode = useSimulationStore((state) => state.setThemeMode);
  const current = steps[stepIndex];

  const changedInputs = useMemo(() => {
    const getChanged = (id: string) => {
      const indicator = indicators.find((item) => item.id === id);
      if (!indicator) return false;
      return (indicator.values.whatIf ?? indicator.values.actual) !== indicator.values.actual;
    };

    return {
      headGrade: getChanged('head_grade'),
      hmp: getChanged('hmp'),
    };
  }, [indicators]);

  const goNext = useCallback(() => {
    setStepIndex((index) => {
      if (index >= steps.length - 1) {
        setActive(false);
        return 0;
      }

      return index + 1;
    });
  }, []);

  const startTour = useCallback(() => {
    resetSimulation();
    setInteractionMode('select');
    setSearchTerm('');
    setSidePanelOpen(false);
    setThemeMode('light');
    selectIndicator('ebitda');
    setStepIndex(0);
    setActive(true);
  }, [resetSimulation, selectIndicator, setInteractionMode, setSearchTerm, setSidePanelOpen, setThemeMode]);

  useEffect(() => {
    window.addEventListener('vdt:start-tour', startTour);
    return () => window.removeEventListener('vdt:start-tour', startTour);
  }, [startTour]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tour') !== '1') return;

    const timeout = window.setTimeout(startTour, 250);
    return () => window.clearTimeout(timeout);
  }, [startTour]);

  useEffect(() => {
    if (!active || !current) return;

    if (current.id === 'open-panel') setSidePanelOpen(false);
    if (current.id === 'scroll-panel') setSidePanelOpen(true);
    if (current.id === 'search-hmp') setSidePanelOpen(true);
    if (current.id === 'edit-hmp') setSidePanelOpen(true);
    if (current.id === 'selected-details') selectIndicator('ebitda');
  }, [active, current, selectIndicator, setSidePanelOpen]);

  useEffect(() => {
    if (!active || !current) return;

    const updateHighlight = () => {
      const nextTarget = document.querySelector<HTMLElement>(current.selector);
      setTarget(nextTarget);

      if (!nextTarget) {
        setHighlight(undefined);
        return;
      }

      const rect = nextTarget.getBoundingClientRect();
      setHighlight({
        height: rect.height + padding * 2,
        left: rect.left - padding,
        top: rect.top - padding,
        width: rect.width + padding * 2,
      });
    };

    updateHighlight();
    const interval = window.setInterval(updateHighlight, 120);
    window.addEventListener('resize', updateHighlight);
    window.addEventListener('scroll', updateHighlight, true);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('resize', updateHighlight);
      window.removeEventListener('scroll', updateHighlight, true);
    };
  }, [active, current]);

  useEffect(() => {
    if (!active || !current || !target) return;

    if (['search-hmp', 'edit-head-grade', 'edit-hmp'].includes(current.id)) {
      const focusTarget = current.id === 'search-hmp' ? target.querySelector<HTMLElement>('input') : target;
      focusTarget?.focus({ preventScroll: true });
    }
  }, [active, current, target]);

  useEffect(() => {
    if (!active || !current) return;

    if (current.id === 'expand-net-revenue' && expandedIds.includes('net_revenue')) goNext();
    if (current.id === 'expand-gross-revenue' && expandedIds.includes('gross_revenue')) goNext();
    if (current.id === 'expand-copper-revenue' && expandedIds.includes('copper_revenue')) goNext();
    if (current.id === 'expand-contained-copper' && expandedIds.includes('contained_copper')) goNext();
    if (current.id === 'edit-head-grade' && changedInputs.headGrade) goNext();
    if (current.id === 'open-panel' && sidePanelOpen) goNext();
    if (current.id === 'search-hmp' && searchTerm.trim().toLowerCase() === 'hmp') goNext();
    if (current.id === 'edit-hmp' && changedInputs.hmp) goNext();
    if (current.id === 'close-panel' && !sidePanelOpen) goNext();
    if (current.id === 'dark-theme' && themeMode === 'dark') {
      const timeout = window.setTimeout(() => setActive(false), 700);
      return () => window.clearTimeout(timeout);
    }
  }, [active, changedInputs, current, expandedIds, goNext, searchTerm, sidePanelOpen, themeMode]);

  useEffect(() => {
    if (!active || current?.id !== 'middle-drag') return;

    const startMiddleDrag = (event: MouseEvent) => {
      if (event.button === 1) middleDragStartX.current = event.clientX;
    };
    const trackMiddleDrag = (event: MouseEvent) => {
      const startX = middleDragStartX.current;
      if (startX === null || (event.buttons & 4) === 0) return;
      if (event.clientX <= startX - 42) {
        middleDragStartX.current = null;
        goNext();
      }
    };
    const stopMiddleDrag = () => {
      middleDragStartX.current = null;
    };

    document.addEventListener('mousedown', startMiddleDrag, true);
    document.addEventListener('mousemove', trackMiddleDrag, true);
    document.addEventListener('mouseup', stopMiddleDrag, true);
    window.addEventListener('blur', stopMiddleDrag);

    return () => {
      document.removeEventListener('mousedown', startMiddleDrag, true);
      document.removeEventListener('mousemove', trackMiddleDrag, true);
      document.removeEventListener('mouseup', stopMiddleDrag, true);
      window.removeEventListener('blur', stopMiddleDrag);
    };
  }, [active, current, goNext]);

  useEffect(() => {
    if (!active || !current) return;

    const onClick = (event: MouseEvent) => {
      const element = event.target as HTMLElement;
      if (current.id === 'fit-view' && element.closest('.react-flow__controls-fitview')) goNext();
      if (current.id === 'reset-simulation' && element.closest('[data-tour="reset-simulation"]')) goNext();
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [active, current, goNext]);

  useEffect(() => {
    if (!active || current?.id !== 'scroll-panel') return;

    const list = document.querySelector<HTMLElement>('[data-tour="panel-list"]');
    if (!list) return;

    const onScroll = () => {
      if (list.scrollTop > 24) goNext();
    };

    list.addEventListener('scroll', onScroll);
    return () => list.removeEventListener('scroll', onScroll);
  }, [active, current, goNext]);

  if (!active || !current || !highlight) return null;

  const tooltipStyle = getTooltipStyle(highlight, current.placement);
  const stepNumber = getVisibleStepNumber(stepIndex);

  return (
    <div className="user-tour" aria-live="polite">
      <div className="tour-spotlight" style={highlight} />
      <section className={`tour-card ${current.placement ?? 'bottom'}`} style={tooltipStyle}>
        <button className="tour-close" title="Fechar guia" onClick={() => setActive(false)} type="button">
          <X size={14} />
        </button>
        <span>
          {stepNumber} / {totalTourSteps}
        </span>
        <p>{current.text}</p>
        {current.illustration === 'middle-drag' ? <MiddleDragCue /> : null}
        {current.nextLabel ? (
          <button className="tour-next" onClick={goNext} type="button">
            {current.nextLabel}
          </button>
        ) : null}
      </section>
    </div>
  );
}

function getVisibleStepNumber(stepIndex: number) {
  return steps.slice(0, stepIndex + 1).filter((step) => step.countInTour !== false).length;
}

function MiddleDragCue() {
  return (
    <div className="tour-drag-cue" aria-hidden="true">
      <div className="tour-drag-line">
        <i />
      </div>
      <div className="tour-mouse">
        <span />
      </div>
    </div>
  );
}

function getTooltipStyle(highlight: Highlight, placement: TourStep['placement']): CSSProperties {
  const width = 250;
  const gap = 14;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
  const baseLeft = highlight.left + highlight.width / 2 - width / 2;

  if (placement === 'left') {
    return {
      left: clamp(highlight.left - width - gap, 14, viewportWidth - width - 14),
      top: clamp(highlight.top, 14, viewportHeight - 150),
      width,
    };
  }

  if (placement === 'right') {
    return {
      left: clamp(highlight.left + highlight.width + gap, 14, viewportWidth - width - 14),
      top: clamp(highlight.top, 14, viewportHeight - 150),
      width,
    };
  }

  if (placement === 'center') {
    return {
      left: clamp(viewportWidth / 2 - width / 2, 14, viewportWidth - width - 14),
      top: clamp(viewportHeight / 2 - 80, 14, viewportHeight - 170),
      width,
    };
  }

  return {
    left: clamp(baseLeft, 14, viewportWidth - width - 14),
    top: clamp(highlight.top + highlight.height + gap, 14, viewportHeight - 150),
    width,
  };
}
