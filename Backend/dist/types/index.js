"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorResponseSchema = exports.RefreshResponseSchema = exports.AuthResponseSchema = exports.UserResponseSchema = exports.RefreshSchema = exports.LoginSchema = exports.SignupSchema = exports.RoleSchema = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../../generated/prisma");
// Role enum validation
exports.RoleSchema = zod_1.z.nativeEnum(prisma_1.Role);
// Authentication schemas
exports.SignupSchema = zod_1.z.object({
    username: zod_1.z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(50, 'Username must be less than 50 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    password: zod_1.z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password must be less than 100 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    role: exports.RoleSchema,
});
exports.LoginSchema = zod_1.z.object({
    username: zod_1.z
        .string()
        .min(1, 'Username is required')
        .max(50, 'Username must be less than 50 characters'),
    password: zod_1.z
        .string()
        .min(1, 'Password is required')
        .max(100, 'Password must be less than 100 characters'),
});
exports.RefreshSchema = zod_1.z.object({
    refreshToken: zod_1.z
        .string()
        .min(1, 'Refresh token is required'),
});
// Response schemas
exports.UserResponseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    username: zod_1.z.string(),
    role: exports.RoleSchema,
});
exports.AuthResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    accessToken: zod_1.z.string(),
    refreshToken: zod_1.z.string(),
    accessExpiresIn: zod_1.z.number(),
    refreshExpiresIn: zod_1.z.number(),
    user: exports.UserResponseSchema,
});
exports.RefreshResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    accessToken: zod_1.z.string(),
    refreshToken: zod_1.z.string(),
    accessExpiresIn: zod_1.z.number(),
    refreshExpiresIn: zod_1.z.number(),
});
exports.ErrorResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean().optional(),
    error: zod_1.z.string(),
});
