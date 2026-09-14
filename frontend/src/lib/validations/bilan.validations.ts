import { z } from 'zod';

export const bilanItemSchema = z.object({
  category: z.string().min(1),
  account_code: z.string().min(1),
  account_name: z.string().min(1),
  amount: z.number(),
  is_calculated: z.boolean(),
});

export const bilanDraftSchema = z.object({
  name: z.string().min(1),
  fiscal_year: z.number().int().positive(),
  data: z.array(bilanItemSchema),
});

export type BilanItemInput = z.infer<typeof bilanItemSchema>;
export type BilanDraftInput = z.infer<typeof bilanDraftSchema>;

export function validateBilanItem(data: BilanItemInput): z.ZodError | null {
  const result = bilanItemSchema.safeParse(data);
  return result.success ? null : result.error;
}

export function validateBilanDraft(data: BilanDraftInput): z.ZodError | null {
  const result = bilanDraftSchema.safeParse(data);
  return result.success ? null : result.error;
}