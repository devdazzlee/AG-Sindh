"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.courierSchema = void 0;
const zod_1 = require("zod");
exports.courierSchema = zod_1.z.object({
    serviceName: zod_1.z.string().min(2, 'Service Name is required'),
    code: zod_1.z.string().min(2, 'Code is required'),
    contactPerson: zod_1.z.string().min(2, 'Contact Person is required'),
    email: zod_1.z.string().email('Invalid email'),
    phone: zod_1.z.string().min(5, 'Phone is required'),
    address: zod_1.z.string().min(2, 'Address is required'),
    status: zod_1.z.enum(['active', 'inactive']),
});
