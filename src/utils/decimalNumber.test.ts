import { describe, expect, it } from 'vitest';
import { formatDecimalInput, parseDecimalInput } from './decimalNumber';

describe('decimalNumber', () => {
  it('parses comma decimal values', () => {
    expect(parseDecimalInput('0,035')).toBe(0.035);
    expect(parseDecimalInput('12,5')).toBe(12.5);
  });

  it('keeps dot decimal compatibility', () => {
    expect(parseDecimalInput('0.035')).toBe(0.035);
  });

  it('formats inputs with comma as decimal separator', () => {
    expect(formatDecimalInput(0.035)).toBe('0,035');
    expect(formatDecimalInput(12.5)).toBe('12,5');
  });
});
