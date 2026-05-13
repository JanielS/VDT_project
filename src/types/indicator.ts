import { z } from 'zod';

export const indicatorTypeSchema = z.enum(['input', 'formula']);

export const indicatorValueSetSchema = z.object({
  budget: z.number(),
  outlook: z.number(),
  actual: z.number(),
  whatIf: z.number().optional(),
});

export const indicatorSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  type: indicatorTypeSchema,
  unit: z.string(),
  group: z.string().optional(),
  formulaId: z.string().optional(),
  children: z.array(z.string()).optional(),
  values: indicatorValueSetSchema,
});

export const indicatorsSchema = z.array(indicatorSchema);

export type IndicatorType = z.infer<typeof indicatorTypeSchema>;
export type IndicatorValueSet = z.infer<typeof indicatorValueSetSchema>;
export type Indicator = z.infer<typeof indicatorSchema>;

export type CalculatedIndicator = Indicator & {
  formulaStatus?: 'validated' | 'pending';
};
