import type { FormulaDefinition } from '../types/formula';
import type { CalculatedIndicator, Indicator } from '../types/indicator';
import { evaluateExpression } from './formulaEvaluator';

const valueOf = (indicator: Indicator) => indicator.values.whatIf ?? indicator.values.actual;
type Scenario = 'budget' | 'outlook' | 'actual' | 'whatIf';

const scenarioValueOf = (indicator: Indicator, scenario: Scenario) => {
  if (scenario === 'whatIf') return valueOf(indicator);
  return indicator.values[scenario];
};

export function calculateIndicators(indicators: Indicator[], formulas: FormulaDefinition[]): CalculatedIndicator[] {
  const byId = new Map(indicators.map((indicator) => [indicator.id, { ...indicator, values: { ...indicator.values } }]));
  const formulasById = new Map(formulas.map((formula) => [formula.id, formula]));
  const visiting = new Set<string>();
  const calculated = new Set<string>();

  const calculate = (id: string): number => {
    const indicator = byId.get(id);
    if (!indicator) return 0;
    if (calculated.has(id)) return valueOf(indicator);
    if (visiting.has(id)) return valueOf(indicator);

    visiting.add(id);

    if (indicator.type === 'formula') {
      for (const childId of indicator.children ?? []) {
        calculate(childId);
      }

      const formula = indicator.formulaId ? formulasById.get(indicator.formulaId) : undefined;
      const isGenericSum = indicator.formulaId === 'sum_children_formula';
      const childIds = indicator.children ?? [];
      const calculateScenarioValue = (scenario: Scenario) => {
        const read = (childId: string) => scenarioValueOf(byId.get(childId) ?? indicator, scenario);

        if (formula?.status === 'pending') {
          return childIds.length ? childIds.reduce((sum, childId) => sum + read(childId), 0) : scenarioValueOf(indicator, scenario);
        }

        if (isGenericSum) {
          return childIds.reduce((sum, childId) => sum + read(childId), 0);
        }

        if (formula?.expression) {
          const dependencyIds = formula.dependencies.length ? formula.dependencies : childIds;
          const context = Object.fromEntries(dependencyIds.map((dependencyId) => [dependencyId, read(dependencyId)]));
          return evaluateExpression(formula.expression, context);
        }

        if (childIds.length) {
          return childIds.reduce((sum, childId) => sum + read(childId), 0);
        }

        return scenarioValueOf(indicator, scenario);
      };

      indicator.values.budget = Math.round(calculateScenarioValue('budget') * 100) / 100;
      indicator.values.outlook = Math.round(calculateScenarioValue('outlook') * 100) / 100;
      indicator.values.actual = Math.round(calculateScenarioValue('actual') * 100) / 100;
      indicator.values.whatIf = Math.round(calculateScenarioValue('whatIf') * 100) / 100;
      (indicator as CalculatedIndicator).formulaStatus = formula?.status ?? 'pending';
    }

    calculated.add(id);
    visiting.delete(id);
    return valueOf(indicator);
  };

  for (const indicator of indicators) {
    calculate(indicator.id);
  }

  return indicators.map((indicator) => byId.get(indicator.id) as CalculatedIndicator);
}

export function updateInputWhatIf(indicators: Indicator[], id: string, whatIf?: number) {
  return indicators.map((indicator) => {
    if (indicator.id !== id) return indicator;
    if (indicator.type !== 'input') {
      throw new Error('Este indicador é calculado automaticamente. Para alterá-lo, ajuste uma das variáveis de entrada relacionadas.');
    }

    return {
      ...indicator,
      values: {
        ...indicator.values,
        whatIf,
      },
    };
  });
}
