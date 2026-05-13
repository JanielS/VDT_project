import { AlertTriangle, FunctionSquare, X } from 'lucide-react';
import { formulasMock } from '../../data/formulas.mock';
import { useSimulationStore } from '../../store/simulationStore';
import { formatNumber } from '../../utils/formatNumber';

export function FormulaDetails() {
  const selectedId = useSimulationStore((state) => state.selectedId);
  const indicators = useSimulationStore((state) => state.indicators);
  const selectIndicator = useSimulationStore((state) => state.selectIndicator);
  const selected = indicators.find((indicator) => indicator.id === selectedId);

  if (!selected || selected.type !== 'formula') return null;

  const formula = formulasMock.find((item) => item.id === selected.formulaId);
  const dependencies = (formula?.dependencies.length ? formula.dependencies : selected.children ?? [])
    .map((id) => indicators.find((indicator) => indicator.id === id))
    .filter(Boolean);
  const relatedInputs = dependencies.filter((indicator) => indicator?.type === 'input');

  return (
    <aside className="formula-details">
      <button className="icon-button close-button" title="Fechar detalhes" onClick={() => selectIndicator(undefined)} type="button">
        <X size={16} />
      </button>
      <div className="details-title">
        {formula?.status === 'pending' ? <AlertTriangle size={18} /> : <FunctionSquare size={18} />}
        <div>
          <span>{formula?.status === 'pending' ? 'Fórmula pendente' : 'Fórmula calculada'}</span>
          <strong>{selected.label}</strong>
        </div>
      </div>
      <div className="formula-expression">{formula?.expression || 'Fórmula ainda não validada. O nó permanece rastreável no fluxo.'}</div>
      <p>{formula?.description || 'Detalhe de cálculo aguardando validação na fonte de fórmulas.'}</p>
      <dl>
        <dt>What If</dt>
        <dd>{formatNumber(selected.values.whatIf, selected.unit)}</dd>
        <dt>Dependências</dt>
        <dd>{dependencies.map((item) => item?.label).join(', ') || 'Sem dependências mapeadas'}</dd>
        <dt>Inputs diretos</dt>
        <dd>{relatedInputs.map((item) => item?.label).join(', ') || 'Nenhum input direto'}</dd>
      </dl>
    </aside>
  );
}
