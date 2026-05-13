export function parseDecimalInput(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed || trimmed === '-' || trimmed === ',' || trimmed === '.' || trimmed === '-,' || trimmed === '-.') {
    return undefined;
  }

  const normalized = trimmed.includes(',')
    ? trimmed.replace(/\./g, '').replace(',', '.')
    : trimmed;
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : undefined;
}

export function formatDecimalInput(value: number | undefined) {
  if (value === undefined || Number.isNaN(value)) return '';

  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 8,
    minimumFractionDigits: 0,
    useGrouping: false,
  }).format(value);
}
