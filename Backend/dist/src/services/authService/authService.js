"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const prisma_1 = require("../../../generated/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../config/config");
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
        const signOpts = {
            issuer: config_1.JWT.ISSUER,
            expiresIn: config_1.JWT.ACCESS_EXPIRES_IN,
        };
        const refreshOpts = {
            issuer: config_1.JWT.ISSUER,
            expiresIn: config_1.JWT.REFRESH_EXPIRES_IN,
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, config_1.JWT.SECRET, signOpts);
        const refreshToken = jsonwebtoken_1.default.sign(payload, config_1.JWT.SECRET, refreshOpts);
        return {
            accessToken,
            refreshToken,
            accessExpiresIn: config_1.JWT.ACCESS_EXPIRES_IN,
            refreshExpiresIn: config_1.JWT.REFRESH_EXPIRES_IN,
            user: { id: user.id, username: user.username, role: user.role },
        };
    }
    static verifyToken(token) {
        return jsonwebtoken_1.default.verify(token, config_1.JWT.SECRET, { issuer: config_1.JWT.ISSUER });
    }
    static async refresh(refreshToken) {
        const decoded = this.verifyToken(refreshToken);
        const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
        if (!user)
            throw new Error('User not found');
        const payload = { sub: user.id, username: user.username, role: user.role };
        const newAccess = jsonwebtoken_1.default.sign(payload, config_1.JWT.SECRET, {
            issuer: config_1.JWT.ISSUER,
            expiresIn: config_1.JWT.ACCESS_EXPIRES_IN,
        });
        const newRefresh = jsonwebtoken_1.default.sign(payload, config_1.JWT.SECRET, {
            issuer: config_1.JWT.ISSUER,
            expiresIn: config_1.JWT.REFRESH_EXPIRES_IN,
        });
        return {
            accessToken: newAccess,
            refreshToken: newRefresh,
            accessExpiresIn: config_1.JWT.ACCESS_EXPIRES_IN,
            refreshExpiresIn: config_1.JWT.REFRESH_EXPIRES_IN,
        };
    }
}
exports.AuthService = AuthService;
