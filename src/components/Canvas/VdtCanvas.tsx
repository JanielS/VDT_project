import { Background, Controls, MiniMap, ReactFlow, useNodesState, useEdgesState } from '@xyflow/react';
import { useEffect, useMemo, useState } from 'react';
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
  const [isMiddleButtonPanning, setIsMiddleButtonPanning] = useState(false);

  const elements = useMemo(
    () => buildTreeElements(indicators, expandedIds, selectedPath),
    [indicators, expandedIds, selectedPath],
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(elements.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(elements.edges);
  const isTemporaryNavigationMode = interactionMode === 'select' && isMiddleButtonPanning;
  const panOnDrag = interactionMode === 'pan' ? true : [1];

  useEffect(() => {
    setNodes(elements.nodes);
    setEdges(elements.edges);
  }, [elements, setEdges, setNodes]);

  useEffect(() => {
    if (!isMiddleButtonPanning) return;

    const stopMiddleButtonPan = () => setIsMiddleButtonPanning(false);
    const stopWhenMiddleButtonIsReleased = (event: MouseEvent | PointerEvent) => {
      if ((event.buttons & 4) === 0) stopMiddleButtonPan();
    };

    window.addEventListener('mouseup', stopMiddleButtonPan, true);
    window.addEventListener('pointerup', stopMiddleButtonPan, true);
    window.addEventListener('pointercancel', stopMiddleButtonPan, true);
    window.addEventListener('mousemove', stopWhenMiddleButtonIsReleased, true);
    window.addEventListener('pointermove', stopWhenMiddleButtonIsReleased, true);
    window.addEventListener('blur', stopMiddleButtonPan);

    return () => {
      window.removeEventListener('mouseup', stopMiddleButtonPan, true);
      window.removeEventListener('pointerup', stopMiddleButtonPan, true);
      window.removeEventListener('pointercancel', stopMiddleButtonPan, true);
      window.removeEventListener('mousemove', stopWhenMiddleButtonIsReleased, true);
      window.removeEventListener('pointermove', stopWhenMiddleButtonIsReleased, true);
      window.removeEventListener('blur', stopMiddleButtonPan);
    };
  }, [isMiddleButtonPanning]);

  return (
    <main
      className="canvas-shell"
      onAuxClick={(event) => {
        if (event.button === 1) event.preventDefault();
      }}
      onMouseDownCapture={(event) => {
        if (event.button === 1) {
          event.preventDefault();
          setIsMiddleButtonPanning(true);
        }
      }}
      onMouseUpCapture={(event) => {
        if (event.button === 1) setIsMiddleButtonPanning(false);
      }}
    >
      <Toolbar isTemporaryNavigationMode={isTemporaryNavigationMode} onStartTour={() => window.dispatchEvent(new Event('vdt:start-tour'))} />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => interactionMode === 'select' && !isTemporaryNavigationMode && selectIndicator(node.id)}
        panOnDrag={panOnDrag}
        nodesDraggable={interactionMode === 'pan'}
        nodesConnectable={false}
        elementsSelectable={interactionMode === 'select' && !isTemporaryNavigationMode}
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
