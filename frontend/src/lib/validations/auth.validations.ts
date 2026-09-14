import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export function validateLogin(data: LoginInput): z.ZodError | null {
  const result = loginSchema.safeParse(data);
  return result.success ? null : result.error;
}

export function validateRegister(data: RegisterInput): z.ZodError | null {
  const result = registerSchema.safeParse(data);
  return result.success ? null : result.error;
}