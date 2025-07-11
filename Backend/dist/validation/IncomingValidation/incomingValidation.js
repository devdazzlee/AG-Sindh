"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incomingStatusSchema = exports.incomingUpdateSchema = exports.incomingCreateSchema = void 0;
const zod_1 = require("zod");
exports.incomingCreateSchema = zod_1.z.object({
    image: zod_1.z.string().optional(), // URL or base64 string
    from: zod_1.z.string().min(1, 'From is required'),
    to: zod_1.z.string().min(1, 'To (department) is required'),
    priority: zod_1.z.enum(['high', 'medium', 'low'], { required_error: 'Priority is required' }),
    subject: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    filing: zod_1.z.string().optional(),
    qrCode: zod_1.z.string().min(1, 'QR code is required'),
    status: zod_1.z.enum(['RECEIVED', 'TRANSFERRED', 'COLLECTED', 'ARCHIVED']).optional(),
    receivedDate: zod_1.z.string().or(zod_1.z.date()).optional(),
});
exports.incomingUpdateSchema = zod_1.z.object({
    image: zod_1.z.string().optional(),
    from: zod_1.z.string().optional(),
    to: zod_1.z.string().optional(),
    priority: zod_1.z.enum(['high', 'medium', 'low']).optional(),
    subject: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    filing: zod_1.z.string().optional(),
    status: zod_1.z.enum(['RECEIVED', 'TRANSFERRED', 'COLLECTED', 'ARCHIVED']).optional(),
    receivedDate: zod_1.z.string().or(zod_1.z.date()).optional(),
});
exports.incomingStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['RECEIVED', 'TRANSFERRED', 'COLLECTED', 'ARCHIVED']),
});
