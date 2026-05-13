export type FormulaContext = Record<string, number>;

const allowedExpression = /^[\d\s+\-*/()._%A-Za-zÀ-ÿ0-9]+$/;

export function evaluateExpression(expression: string, context: FormulaContext): number {
  if (!allowedExpression.test(expression)) {
    throw new Error(`Formula contains unsupported characters: ${expression}`);
  }

  const names = Object.keys(context);
  const values = names.map((name) => context[name]);
  const evaluator = new Function(...names, `"use strict"; return (${expression});`);
  const result = evaluator(...values);

  if (typeof result !== 'number' || Number.isNaN(result) || !Number.isFinite(result)) {
    return 0;
  }

  return result;
}
