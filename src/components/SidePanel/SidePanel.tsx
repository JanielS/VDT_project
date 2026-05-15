import { Search, SlidersHorizontal } from 'lucide-react';
import { DecimalInput } from '../DecimalInput/DecimalInput';
import { useSimulationStore } from '../../store/simulationStore';
import { formatNumber } from '../../utils/formatNumber';

export function SidePanel() {
  const indicators = useSimulationStore((state) => state.indicators);
  const sidePanelOpen = useSimulationStore((state) => state.sidePanelOpen);
  const searchTerm = useSimulationStore((state) => state.searchTerm);
  const setSearchTerm = useSimulationStore((state) => state.setSearchTerm);
  const updateWhatIf = useSimulationStore((state) => state.updateWhatIf);
  const selectIndicator = useSimulationStore((state) => state.selectIndicator);

  const inputs = indicators
    .filter((indicator) => indicator.type === 'input')
    .filter((indicator) => indicator.label.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <aside className={sidePanelOpen ? 'side-panel open' : 'side-panel'} data-tour="side-panel">
      <div className="side-panel-header">
        <SlidersHorizontal size={18} />
        <div>
          <strong>Inputs</strong>
          <span>{inputs.length} alavancas</span>
        </div>
      </div>
      <label className="search-box" data-tour="panel-search">
        <Search size={16} />
        <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Pesquisar input" />
      </label>
      <div className="input-list" data-tour="panel-list">
        {inputs.map((indicator) => {
          const current = indicator.values.whatIf ?? indicator.values.actual;
          const changed = current !== indicator.values.actual;

          return (
            <button
              className={changed ? 'input-row changed' : 'input-row'}
              data-tour={`panel-row-${indicator.id}`}
              key={indicator.id}
              onClick={() => selectIndicator(indicator.id)}
              type="button"
            >
              <span className="input-row-title">
                <strong>{indicator.label}</strong>
                <small>{indicator.group} · {indicator.unit}</small>
              </span>
              <span className="input-row-values">
                <small>Actual {formatNumber(indicator.values.actual)}</small>
                <DecimalInput
                  dataTour={`panel-whatif-${indicator.id}`}
                  value={current}
                  onClick={(event) => event.stopPropagation()}
                  onCommit={(value) => updateWhatIf(indicator.id, value)}
                />
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
