import type { Edge, Node } from '@xyflow/react';
import type { CalculatedIndicator } from '../types/indicator';

type NodeData = {
  indicator: CalculatedIndicator;
  isExpanded: boolean;
  isSelected: boolean;
  isPathHighlighted: boolean;
};

export function buildTreeElements(
  indicators: CalculatedIndicator[],
  expandedIds: string[],
  selectedPath: string[],
): { nodes: Node<NodeData>[]; edges: Edge[] } {
  const byId = new Map(indicators.map((indicator) => [indicator.id, indicator]));
  const expanded = new Set(expandedIds);
  const path = new Set(selectedPath);
  const nodes: Node<NodeData>[] = [];
  const edges: Edge[] = [];
  let yCursor = 0;
  const rowHeight = 172;
  const columnWidth = 330;

  const walk = (id: string, depth: number): number => {
    const indicator = byId.get(id);
    if (!indicator) return yCursor;

    const children = indicator.children ?? [];
    const visibleChildren = expanded.has(id) ? children : [];

    const childYs = visibleChildren.map((childId) => {
      edges.push({
        id: `${id}-${childId}`,
        source: id,
        target: childId,
        type: 'smoothstep',
        animated: path.has(id) && path.has(childId),
        className: path.has(id) && path.has(childId) ? 'path-edge' : undefined,
      });
      return walk(childId, depth + 1);
    });

    const ownY = childYs.length
      ? (Math.min(...childYs) + Math.max(...childYs)) / 2
      : yCursor++ * rowHeight;

    nodes.push({
      id,
      type: 'indicator',
      position: { x: depth * columnWidth, y: ownY },
      data: {
        indicator,
        isExpanded: expanded.has(id),
        isSelected: selectedPath[0] === id,
        isPathHighlighted: path.has(id),
      },
    });

    return ownY;
  };

  walk('ebitda', 0);

  return { nodes, edges };
}
