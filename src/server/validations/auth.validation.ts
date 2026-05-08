import { z } from 'zod';
import { UserRole } from '@/types';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please provide a valid email address').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required').min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please provide a valid email address').trim().toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters').trim(),
});

export const createUserByAdminSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please provide a valid email address').trim().toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters').trim(),
  role: z.nativeEnum(UserRole, { errorMap: () => ({ message: 'Invalid role' }) }),
  companyName: z.string().max(200).trim().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateUserByAdminInput = z.infer<typeof createUserByAdminSchema>;
