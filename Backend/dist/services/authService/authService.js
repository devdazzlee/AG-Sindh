"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = exports.JWT = void 0;
// src/services/auth.service.ts
const prisma_1 = require("../../../generated/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.JWT = {
    SECRET: process.env.JWT_SECRET || "sdfdsfds",
    ISSUER: process.env.JWT_ISSUER || 'your-app-name',
    ACCESS_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    REFRESH_EXPIRES_IN: process.env.REFRESH_EXPIRES_IN || '7d',
};
const prisma = new prisma_1.PrismaClient();
class AuthService {
    static async signup(username, password, role) {
        if (await prisma.user.findUnique({ where: { username } })) {
            throw new Error('Username already exists');
        }
        const hashed = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma.user.create({
            data: { username, password: hashed, role },
        });
        return { id: user.id, username: user.username, role: user.role };
    }
    static async login(username, password) {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
            throw new Error('Invalid username or password');
        }
        const payload = { sub: user.id, username: user.username, role: user.role };
        const accessToken = jsonwebtoken_1.default.sign(payload, exports.JWT.SECRET, {
            issuer: exports.JWT.ISSUER,
            expiresIn: exports.JWT.ACCESS_EXPIRES_IN,
        });
        return {
            accessToken,
            expiresIn: exports.JWT.ACCESS_EXPIRES_IN,
            user: { id: user.id, username: user.username, role: user.role },
        };
    }
    static verifyToken(token) {
        return jsonwebtoken_1.default.verify(token, exports.JWT.SECRET, { issuer: exports.JWT.ISSUER });
    }
}
exports.AuthService = AuthService;
