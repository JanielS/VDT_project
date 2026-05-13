export function formatNumber(value: number | undefined, unit?: string) {
  const safeValue = value ?? 0;
  const fractionDigits = Math.abs(safeValue) < 10 ? 2 : 1;
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(safeValue);

  return unit ? `${formatted} ${unit}` : formatted;
}
