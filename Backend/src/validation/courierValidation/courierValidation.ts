import { z } from 'zod';

export const courierSchema = z.object({
  serviceName: z.string().min(2, 'Service Name is required'),
  code: z.string().min(2, 'Code is required'),
  contactPerson: z.string().min(2, 'Contact Person is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(5, 'Phone is required'),
  address: z.string().min(2, 'Address is required'),
  status: z.enum(['active', 'inactive']),
});
