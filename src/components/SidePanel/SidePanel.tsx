import { Search, SlidersHorizontal } from 'lucide-react';
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
    <aside className={sidePanelOpen ? 'side-panel open' : 'side-panel'}>
      <div className="side-panel-header">
        <SlidersHorizontal size={18} />
        <div>
          <strong>Inputs</strong>
          <span>{inputs.length} alavancas</span>
        </div>
      </div>
      <label className="search-box">
        <Search size={16} />
        <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Pesquisar input" />
      </label>
      <div className="input-list">
        {inputs.map((indicator) => {
          const current = indicator.values.whatIf ?? indicator.values.actual;
          const changed = current !== indicator.values.actual;

          return (
            <button className={changed ? 'input-row changed' : 'input-row'} key={indicator.id} onClick={() => selectIndicator(indicator.id)} type="button">
              <span className="input-row-title">
                <strong>{indicator.label}</strong>
                <small>{indicator.group} · {indicator.unit}</small>
              </span>
              <span className="input-row-values">
                <small>Actual {formatNumber(indicator.values.actual)}</small>
                <input
                  value={current}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => {
                    const parsed = Number(event.target.value.replace(',', '.'));
                    if (!Number.isNaN(parsed)) updateWhatIf(indicator.id, parsed);
                  }}
                />
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
