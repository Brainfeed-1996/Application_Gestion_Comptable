import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
  twoFactorCode: z.string().optional(),
});

export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Au moins 8 caractères'),
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
});

export const transactionSchema = z.object({
  date: z.string().min(1, 'Date requise'),
  description: z.string().min(1, 'Description requise'),
  reference: z.string().optional(),
  amount: z.number().positive('Montant doit être positif'),
  currency: z.string().length(3),
  type: z.enum(['income', 'expense', 'transfer', 'adjustment']),
  accountId: z.string().min(1, 'Compte requis'),
  counterpartyId: z.string().optional(),
  counterpartyName: z.string().optional(),
  categoryId: z.string().optional(),
  taxRate: z.number().optional(),
  notes: z.string().optional(),
});

export const invoiceSchema = z.object({
  clientId: z.string().min(1, 'Client requis'),
  date: z.string().min(1, 'Date requise'),
  dueDate: z.string().min(1, 'Date d\'échéance requise'),
  currency: z.string().length(3),
  lines: z.array(z.object({
    description: z.string().min(1, 'Description requise'),
    quantity: z.number().positive('Quantité doit être positive'),
    unitPrice: z.number().positive('Prix unitaire doit être positif'),
    taxRate: z.number().min(0),
    discount: z.number().min(0).optional(),
  })).min(1, 'Au moins une ligne'),
  notes: z.string().optional(),
  terms: z.string().optional(),
  discountTotal: z.number().min(0).optional(),
});

export const accountSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  code: z.string().min(1, 'Code requis'),
  type: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']),
  category: z.string().min(1, 'Catégorie requise'),
  parentId: z.string().optional(),
  currency: z.string().length(3).optional(),
  description: z.string().optional(),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z.string().min(8, 'Au moins 8 caractères'),
  confirmPassword: z.string().min(1, 'Confirmation requise'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});
