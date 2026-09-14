import { z } from "zod";

export const bilanItemSchema = z.object({
  id: z.string().optional(),
  category: z.string().min(1),
  account_code: z.string().min(1),
  account_name: z.string().min(1),
  amount: z.number(),
  is_calculated: z.boolean().default(false),
});

export const balanceSheetTemplateSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  is_default: z.boolean().default(false),
  created_at: z.string(),
});

export const balanceSheetDraftSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  fiscal_year: z.number().int().positive(),
  status: z.string().default("draft"),
  data: z.array(bilanItemSchema),
  created_at: z.string(),
  updated_at: z.string(),
});

export type BilanItem = z.infer<typeof bilanItemSchema>;
export type BalanceSheetTemplate = z.infer<typeof balanceSheetTemplateSchema>;
export type BalanceSheetDraft = z.infer<typeof balanceSheetDraftSchema>;

export type BilanItemInput = Omit<BilanItem, "id" | "is_calculated"> & {
  is_calculated?: boolean;
};

export type BalanceSheetDraftCreate = Omit<
  BalanceSheetDraft,
  "id" | "status" | "created_at" | "updated_at"
>;

export type BalanceSheetDraftUpdate = Partial<BalanceSheetDraftCreate> & {
  status?: string;
};

export type BalanceSheetQuickCreate = {
  name: string;
  fiscal_year: number;
  template_id?: string;
};