import { Background, Controls, MiniMap, ReactFlow, useNodesState, useEdgesState } from '@xyflow/react';
import { useEffect, useMemo } from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { buildTreeElements } from '../../utils/treeLayout';
import { IndicatorNode } from '../IndicatorNode/IndicatorNode';
import { Toolbar } from '../Toolbar/Toolbar';

const nodeTypes = {
  indicator: IndicatorNode,
};

export function VdtCanvas() {
  const indicators = useSimulationStore((state) => state.indicators);
  const expandedIds = useSimulationStore((state) => state.expandedIds);
  const selectedPath = useSimulationStore((state) => state.selectedPath);
  const interactionMode = useSimulationStore((state) => state.interactionMode);
  const selectIndicator = useSimulationStore((state) => state.selectIndicator);

  const elements = useMemo(
    () => buildTreeElements(indicators, expandedIds, selectedPath),
    [indicators, expandedIds, selectedPath],
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(elements.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(elements.edges);

  useEffect(() => {
    setNodes(elements.nodes);
    setEdges(elements.edges);
  }, [elements, setEdges, setNodes]);

  return (
    <main className="canvas-shell">
      <Toolbar />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => interactionMode === 'select' && selectIndicator(node.id)}
        panOnDrag={interactionMode === 'pan'}
        nodesDraggable={interactionMode === 'pan'}
        nodesConnectable={false}
        elementsSelectable={interactionMode === 'select'}
        minZoom={0.18}
        maxZoom={1.4}
        fitView
        fitViewOptions={{ padding: 0.18 }}
      >
        <Background color="var(--vdt-border)" gap={24} size={1} />
        <Controls position="bottom-left" showInteractive={false} />
        <MiniMap
          position="bottom-right"
          pannable
          zoomable
          nodeColor={(node) => {
            const type = (node.data as any)?.indicator?.type;
            return type === 'input' ? 'var(--vdt-green)' : 'var(--vdt-gold)';
          }}
        />
      </ReactFlow>
    </main>
  );
}
