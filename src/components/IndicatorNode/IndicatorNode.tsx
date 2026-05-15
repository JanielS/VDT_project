import { Handle, Position, type NodeProps } from '@xyflow/react';
import { ChevronDown, ChevronRight, Lock, PencilLine } from 'lucide-react';
import { memo } from 'react';
import { motion } from 'framer-motion';
import { DecimalInput } from '../DecimalInput/DecimalInput';
import { useSimulationStore } from '../../store/simulationStore';
import type { CalculatedIndicator } from '../../types/indicator';
import { formatNumber } from '../../utils/formatNumber';

type IndicatorNodeData = {
  indicator: CalculatedIndicator;
  isExpanded: boolean;
  isSelected: boolean;
  isPathHighlighted: boolean;
};

function IndicatorNodeComponent({ data }: NodeProps) {
  const { indicator, isExpanded, isSelected, isPathHighlighted } = data as IndicatorNodeData;
  const interactionMode = useSimulationStore((state) => state.interactionMode);
  const toggleExpanded = useSimulationStore((state) => state.toggleExpanded);
  const selectIndicator = useSimulationStore((state) => state.selectIndicator);
  const updateWhatIf = useSimulationStore((state) => state.updateWhatIf);
  const canExpand = Boolean(indicator.children?.length);
  const isInput = indicator.type === 'input';
  const isEditable = isInput && interactionMode === 'select';
  const isChanged = isInput && (indicator.values.whatIf ?? indicator.values.actual) !== indicator.values.actual;

  return (
    <motion.div
      data-indicator-id={indicator.id}
      data-tour={`node-${indicator.id}`}
      className={[
        'indicator-node',
        isInput ? 'input-node' : 'formula-node',
        isSelected ? 'selected' : '',
        isPathHighlighted ? 'path-highlighted' : '',
        indicator.formulaStatus === 'pending' ? 'pending-formula' : '',
      ].join(' ')}
      initial={{ opacity: 0.85, scale: 0.98 }}
      animate={{ opacity: 1, scale: isSelected ? 1.02 : 1 }}
      transition={{ duration: 0.18 }}
      onClick={() => interactionMode === 'select' && selectIndicator(indicator.id)}
    >
      <Handle type="target" position={Position.Left} />
      <div className="node-header">
        <button
          className="expand-button"
          data-tour={`expand-${indicator.id}`}
          disabled={!canExpand}
          title={isExpanded ? 'Recolher' : 'Expandir'}
          onClick={(event) => {
            event.stopPropagation();
            if (canExpand) toggleExpanded(indicator.id);
          }}
          type="button"
        >
          {canExpand ? isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} /> : null}
        </button>
        <div className="node-title">
          <strong>{indicator.label}</strong>
          <span>{indicator.unit || 'index'}</span>
        </div>
        <span className={isInput ? 'node-badge input' : 'node-badge formula'} title={isInput ? 'Input editável' : 'Indicador calculado'}>
          {isInput ? <PencilLine size={13} /> : <Lock size={13} />}
        </span>
      </div>
      <div className="node-metrics">
        <span>Budget</span>
        <b>{formatNumber(indicator.values.budget)}</b>
        <span>Outlook</span>
        <b>{formatNumber(indicator.values.outlook)}</b>
        <span>Actual</span>
        <b>{formatNumber(indicator.values.actual)}</b>
        <span>What If</span>
        {isEditable ? (
          <DecimalInput
            className={isChanged ? 'changed' : ''}
            dataTour={`node-whatif-${indicator.id}`}
            value={indicator.values.whatIf ?? indicator.values.actual}
            onCommit={(value) => updateWhatIf(indicator.id, value)}
            onClick={(event) => event.stopPropagation()}
          />
        ) : (
          <b>{formatNumber(indicator.values.whatIf ?? indicator.values.actual)}</b>
        )}
      </div>
      {indicator.formulaStatus === 'pending' ? <div className="pending-label">formula pending</div> : null}
      <Handle type="source" position={Position.Right} />
    </motion.div>
  );
}

export const IndicatorNode = memo(IndicatorNodeComponent);
