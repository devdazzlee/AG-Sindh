import { z } from 'zod';
import { Role } from '../../generated/prisma';

// Role enum validation
export const RoleSchema = z.nativeEnum(Role);

// Authentication schemas
export const SignupSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  role: RoleSchema,
});

export const LoginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .max(50, 'Username must be less than 50 characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(100, 'Password must be less than 100 characters'),
});

export const RefreshSchema = z.object({
  refreshToken: z
    .string()
    .min(1, 'Refresh token is required'),
});

// Response schemas
export const UserResponseSchema = z.object({
  id: z.string(),
  username: z.string(),
  role: RoleSchema,
});

export const AuthResponseSchema = z.object({
  success: z.boolean(),
  accessToken: z.string(),
  refreshToken: z.string(),
  accessExpiresIn: z.number(),
  refreshExpiresIn: z.number(),
  user: UserResponseSchema,
});

export const RefreshResponseSchema = z.object({
  success: z.boolean(),
  accessToken: z.string(),
  refreshToken: z.string(),
  accessExpiresIn: z.number(),
  refreshExpiresIn: z.number(),
});

export const ErrorResponseSchema = z.object({
  success: z.boolean().optional(),
  error: z.string(),
});

// Type exports
export type SignupRequest = z.infer<typeof SignupSchema>;
export type LoginRequest = z.infer<typeof LoginSchema>;
export type RefreshRequest = z.infer<typeof RefreshSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type RefreshResponse = z.infer<typeof RefreshResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
