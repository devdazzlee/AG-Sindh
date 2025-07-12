"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOutgoingStatusUpdate = exports.validateOutgoingData = exports.outgoingStatusSchema = void 0;
const zod_1 = require("zod");
const outgoingSchema = zod_1.z.object({
    from: zod_1.z.string().min(1, 'From department is required'),
    to: zod_1.z.string().min(1, 'To destination is required'),
    priority: zod_1.z.enum(['high', 'medium', 'low'], {
        errorMap: () => ({ message: 'Priority must be high, medium, or low' }),
    }),
    subject: zod_1.z.string().optional(),
    qrCode: zod_1.z.string().min(1, 'QR code is required'),
    courierServiceId: zod_1.z.string().optional(),
});
exports.outgoingStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['PENDING_DISPATCH', 'DISPATCHED', 'DELIVERED', 'RETURNED'], {
        errorMap: () => ({ message: 'Invalid status' }),
    }),
});
const validateOutgoingData = (data) => {
    try {
        const validatedData = outgoingSchema.parse(data);
        return {
            success: true,
            data: validatedData,
        };
    }
    catch (error) {
        return {
            success: false,
            error: error.errors,
        };
    }
};
exports.validateOutgoingData = validateOutgoingData;
const validateOutgoingStatusUpdate = (data) => {
    const statusUpdateSchema = zod_1.z.object({
        status: zod_1.z.enum(['PENDING_DISPATCH', 'DISPATCHED', 'DELIVERED', 'RETURNED'], {
            errorMap: () => ({ message: 'Invalid status' }),
        }),
        dispatchedDate: zod_1.z.string().optional(),
        deliveredDate: zod_1.z.string().optional(),
    });
    try {
        const validatedData = statusUpdateSchema.parse(data);
        return {
            success: true,
            data: validatedData,
        };
    }
    catch (error) {
        return {
            success: false,
            error: error.errors,
        };
    }
};
exports.validateOutgoingStatusUpdate = validateOutgoingStatusUpdate;
