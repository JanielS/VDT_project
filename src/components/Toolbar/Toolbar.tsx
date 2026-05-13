import { Hand, MousePointer2, PanelLeftClose, PanelLeftOpen, RotateCcw } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';

export function Toolbar() {
  const interactionMode = useSimulationStore((state) => state.interactionMode);
  const setInteractionMode = useSimulationStore((state) => state.setInteractionMode);
  const resetSimulation = useSimulationStore((state) => state.resetSimulation);
  const sidePanelOpen = useSimulationStore((state) => state.sidePanelOpen);
  const setSidePanelOpen = useSimulationStore((state) => state.setSidePanelOpen);

  return (
    <div className="toolbar">
      <button
        className="icon-button"
        title={sidePanelOpen ? 'Recolher painel' : 'Abrir painel'}
        onClick={() => setSidePanelOpen(!sidePanelOpen)}
        type="button"
      >
        {sidePanelOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
      </button>
      <ThemeToggle />
      <span className="toolbar-divider" />
      <button
        className={interactionMode === 'pan' ? 'icon-button active' : 'icon-button'}
        title="Modo navegacao"
        onClick={() => setInteractionMode('pan')}
        type="button"
      >
        <Hand size={18} />
      </button>
      <button
        className={interactionMode === 'select' ? 'icon-button active' : 'icon-button'}
        title="Modo selecao e edicao"
        onClick={() => setInteractionMode('select')}
        type="button"
      >
        <MousePointer2 size={18} />
      </button>
      <button className="icon-button" title="Resetar simulacao" onClick={resetSimulation} type="button">
        <RotateCcw size={18} />
      </button>
    </div>
  );
}
