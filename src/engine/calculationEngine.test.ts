import { describe, expect, it } from 'vitest';
import { formulasMock } from '../data/formulas.mock';
import { indicatorsMock } from '../data/indicators.mock';
import { calculateIndicators, updateInputWhatIf } from './calculationEngine';

describe('calculationEngine', () => {
  it('calculates EBITDA from the value driver tree', () => {
    const calculated = calculateIndicators(indicatorsMock, formulasMock);
    const ebitda = calculated.find((indicator) => indicator.id === 'ebitda');

    expect(ebitda?.values.whatIf).toBeTypeOf('number');
    expect(ebitda?.type).toBe('formula');
  });

  it('falls back to actual values when whatIf is absent', () => {
    const withoutWhatIf = indicatorsMock.map((indicator) =>
      indicator.id === 'cu_price'
        ? { ...indicator, values: { budget: indicator.values.budget, outlook: indicator.values.outlook, actual: indicator.values.actual } }
        : indicator,
    );
    const calculated = calculateIndicators(withoutWhatIf, formulasMock);
    const copperPrice = calculated.find((indicator) => indicator.id === 'cu_price');

    expect(copperPrice?.values.whatIf ?? copperPrice?.values.actual).toBe(copperPrice?.values.actual);
  });

  it('recalculates dependent indicators after an input change', () => {
    const before = calculateIndicators(indicatorsMock, formulasMock);
    const beforeEbitda = before.find((indicator) => indicator.id === 'ebitda')?.values.whatIf;
    const updated = updateInputWhatIf(indicatorsMock, 'cu_price', 9600);
    const after = calculateIndicators(updated, formulasMock);
    const afterEbitda = after.find((indicator) => indicator.id === 'ebitda')?.values.whatIf;

    expect(afterEbitda).not.toBe(beforeEbitda);
  });

  it('blocks manual edits on formula indicators', () => {
    expect(() => updateInputWhatIf(indicatorsMock, 'ebitda', 1)).toThrow(/calculado automaticamente/);
  });

  it('uses a terminal copper reference under concentrate mass without reusing the main copper node visually', () => {
    const concentrateMass = indicatorsMock.find((indicator) => indicator.id === 'concentrate_mass');
    const calculated = calculateIndicators(indicatorsMock, formulasMock);
    const containedCopper = calculated.find((indicator) => indicator.id === 'contained_copper');
    const containedCopperReference = calculated.find((indicator) => indicator.id === 'contained_copper_reference');

    expect(concentrateMass?.children).toContain('contained_copper_reference');
    expect(concentrateMass?.children).not.toContain('contained_copper');
    expect(containedCopperReference?.values.whatIf).toBe(containedCopper?.values.whatIf);
  });

  it('uses terminal wet feed mass references in consumption quantity branches', () => {
    const quantityIndicators = indicatorsMock.filter((indicator) => indicator.id.endsWith('_quantity'));
    const calculated = calculateIndicators(indicatorsMock, formulasMock);
    const wetFeedMass = calculated.find((indicator) => indicator.id === 'wet_feed_mass');
    const wetFeedReferences = calculated.filter((indicator) => indicator.id.startsWith('wet_feed_mass_ref_'));

    expect(quantityIndicators.length).toBeGreaterThan(0);
    expect(wetFeedReferences.length).toBe(quantityIndicators.length);

    for (const indicator of quantityIndicators) {
      expect(indicator.children).not.toContain('wet_feed_mass');
      expect(indicator.children?.some((childId) => childId.startsWith('wet_feed_mass_ref_'))).toBe(true);
    }

    for (const reference of wetFeedReferences) {
      expect(reference.children).toBeUndefined();
      expect(reference.values.whatIf).toBe(wetFeedMass?.values.whatIf);
    }
  });
});
