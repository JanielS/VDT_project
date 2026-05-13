import { z } from 'zod';

export const formulaDefinitionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  expression: z.string().optional(),
  description: z.string().optional(),
  dependencies: z.array(z.string()).default([]),
  status: z.enum(['validated', 'pending']).default('validated'),
});

export const formulasSchema = z.array(formulaDefinitionSchema);

export type FormulaDefinition = z.infer<typeof formulaDefinitionSchema>;
