"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentStatusSchema = exports.departmentUpdateSchema = exports.departmentCreateSchema = void 0;
const zod_1 = require("zod");
exports.departmentCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Department name is required'),
    code: zod_1.z.string().min(2, 'Department code is required'),
    head: zod_1.z.string().min(2, 'Head is required'),
    contact: zod_1.z.string().min(2, 'Contact is required'),
    status: zod_1.z.string().min(2, 'Status is required'),
    username: zod_1.z.string().min(3, 'Username must be at least 3 characters'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
exports.departmentUpdateSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    code: zod_1.z.string().min(2).optional(),
    head: zod_1.z.string().min(2).optional(),
    contact: zod_1.z.string().min(2).optional(),
    status: zod_1.z.string().min(2).optional(),
    username: zod_1.z.string().min(3).optional(),
    password: zod_1.z.string().min(6).optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
});
exports.departmentStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['active', 'inactive'])
});
