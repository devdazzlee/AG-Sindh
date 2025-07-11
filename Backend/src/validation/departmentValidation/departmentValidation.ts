import { z } from 'zod';

export const departmentCreateSchema = z.object({
  name: z.string().min(2, 'Department name is required'),
  code: z.string().min(2, 'Department code is required'),
  head: z.string().min(2, 'Head is required'),
  contact: z.string().min(2, 'Contact is required'),
  status: z.string().min(2, 'Status is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const departmentUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  code: z.string().min(2).optional(),
  head: z.string().min(2).optional(),
  contact: z.string().min(2).optional(),
  status: z.string().min(2).optional(),
  username: z.string().min(3).optional(),
  password: z.string().min(6).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

export const departmentStatusSchema = z.object({
  status: z.enum(['active', 'inactive'])
}); 