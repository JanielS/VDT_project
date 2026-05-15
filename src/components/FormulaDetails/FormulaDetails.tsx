import { AlertTriangle, FunctionSquare, PencilLine, X } from 'lucide-react';
import { formulasMock } from '../../data/formulas.mock';
import { useSimulationStore } from '../../store/simulationStore';
import { formatNumber } from '../../utils/formatNumber';

export function FormulaDetails() {
  const selectedId = useSimulationStore((state) => state.selectedId);
  const indicators = useSimulationStore((state) => state.indicators);
  const selectIndicator = useSimulationStore((state) => state.selectIndicator);
  const selected = indicators.find((indicator) => indicator.id === selectedId);

  if (!selected) return null;

  const formula = formulasMock.find((item) => item.id === selected.formulaId);
  const dependencies = (formula?.dependencies.length ? formula.dependencies : selected.children ?? [])
    .map((id) => indicators.find((indicator) => indicator.id === id))
    .filter(Boolean);
  const relatedInputs = dependencies.filter((indicator) => indicator?.type === 'input');
  const isInput = selected.type === 'input';

  return (
    <aside className="formula-details" data-tour="selected-details">
      <button className="icon-button close-button" title="Fechar detalhes" onClick={() => selectIndicator(undefined)} type="button">
        <X size={16} />
      </button>
      <div className="details-title">
        {isInput ? <PencilLine size={18} /> : formula?.status === 'pending' ? <AlertTriangle size={18} /> : <FunctionSquare size={18} />}
        <div>
          <span>{isInput ? 'Input selecionado' : formula?.status === 'pending' ? 'Formula pendente' : 'Formula calculada'}</span>
          <strong>{selected.label}</strong>
        </div>
      </div>
      {isInput ? (
        <p>Este indicador e uma alavanca editavel da simulacao. Budget, Outlook e Actual permanecem como referencias.</p>
      ) : (
        <>
          <div className="formula-expression">{formula?.expression || 'Formula ainda nao validada. O no permanece rastreavel no fluxo.'}</div>
          <p>{formula?.description || 'Detalhe de calculo aguardando validacao na fonte de formulas.'}</p>
        </>
      )}
      <dl>
        <dt>What If</dt>
        <dd>{formatNumber(selected.values.whatIf, selected.unit)}</dd>
        <dt>Actual</dt>
        <dd>{formatNumber(selected.values.actual, selected.unit)}</dd>
        {isInput ? (
          <>
            <dt>Grupo</dt>
            <dd>{selected.group || 'Sem grupo'}</dd>
            <dt>Unidade</dt>
            <dd>{selected.unit || 'index'}</dd>
          </>
        ) : (
          <>
            <dt>Dependencias</dt>
            <dd>{dependencies.map((item) => item?.label).join(', ') || 'Sem dependencias mapeadas'}</dd>
            <dt>Inputs diretos</dt>
            <dd>{relatedInputs.map((item) => item?.label).join(', ') || 'Nenhum input direto'}</dd>
          </>
        )}
      </dl>
    </aside>
  );
}
