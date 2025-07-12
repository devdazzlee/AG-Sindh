import { z } from 'zod';

const outgoingSchema = z.object({
  from: z.string().min(1, 'From department is required'),
  to: z.string().min(1, 'To destination is required'),
  priority: z.enum(['high', 'medium', 'low'], {
    errorMap: () => ({ message: 'Priority must be high, medium, or low' }),
  }),
  subject: z.string().optional(),
  qrCode: z.string().min(1, 'QR code is required'),
  courierServiceId: z.string().optional(),
});

export const outgoingStatusSchema = z.object({
  status: z.enum(['PENDING_DISPATCH', 'DISPATCHED', 'DELIVERED', 'RETURNED'], {
    errorMap: () => ({ message: 'Invalid status' }),
  }),
});

export const validateOutgoingData = (data: any) => {
  try {
    const validatedData = outgoingSchema.parse(data);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.errors,
    };
  }
};

export const validateOutgoingStatusUpdate = (data: any) => {
  const statusUpdateSchema = z.object({
    status: z.enum(['PENDING_DISPATCH', 'DISPATCHED', 'DELIVERED', 'RETURNED'], {
      errorMap: () => ({ message: 'Invalid status' }),
    }),
    dispatchedDate: z.string().optional(),
    deliveredDate: z.string().optional(),
  });

  try {
    const validatedData = statusUpdateSchema.parse(data);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.errors,
    };
  }
}; 