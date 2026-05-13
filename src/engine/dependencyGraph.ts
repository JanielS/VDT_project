import type { Indicator } from '../types/indicator';

export function buildParentMap(indicators: Indicator[]) {
  const parents = new Map<string, string>();

  for (const indicator of indicators) {
    for (const childId of indicator.children ?? []) {
      parents.set(childId, indicator.id);
    }
  }

  return parents;
}

export function getPathToRoot(indicators: Indicator[], selectedId?: string, rootId = 'ebitda') {
  if (!selectedId) return [];

  const parents = buildParentMap(indicators);
  const path = [selectedId];
  let current = selectedId;

  while (current !== rootId) {
    const parent = parents.get(current);
    if (!parent) break;
    path.push(parent);
    current = parent;
  }

  return path;
}

export function getDescendantIds(indicators: Indicator[], id: string) {
  const byId = new Map(indicators.map((indicator) => [indicator.id, indicator]));
  const descendants = new Set<string>();

  const visit = (currentId: string) => {
    const current = byId.get(currentId);
    for (const childId of current?.children ?? []) {
      descendants.add(childId);
      visit(childId);
    }
  };

  visit(id);
  return descendants;
}
