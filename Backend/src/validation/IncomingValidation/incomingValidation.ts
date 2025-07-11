import { z } from 'zod';

export const incomingCreateSchema = z.object({
  image: z.string().optional(), // URL or base64 string
  from: z.string().min(1, 'From is required'),
  to: z.string().min(1, 'To (department) is required'),
  priority: z.enum(['high', 'medium', 'low'], { required_error: 'Priority is required' }),
  subject: z.string().optional(),
  description: z.string().optional(),
  filing: z.string().optional(),
  qrCode: z.string().min(1, 'QR code is required'),
  status: z.enum(['RECEIVED', 'TRANSFERRED', 'COLLECTED', 'ARCHIVED']).optional(),
  receivedDate: z.string().or(z.date()).optional(),
});

export const incomingUpdateSchema = z.object({
  image: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  subject: z.string().optional(),
  description: z.string().optional(),
  filing: z.string().optional(),
  status: z.enum(['RECEIVED', 'TRANSFERRED', 'COLLECTED', 'ARCHIVED']).optional(),
  receivedDate: z.string().or(z.date()).optional(),
});

export const incomingStatusSchema = z.object({
  status: z.enum(['RECEIVED', 'TRANSFERRED', 'COLLECTED', 'ARCHIVED']),
}); 