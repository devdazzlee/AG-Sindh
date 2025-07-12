"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../../services/authService/authService");
const authValidation_1 = require("../../validation/authValidation/authValidation");
function validateRole(role) {
    return ['super_admin', 'rd_department', 'other_department'].includes(role);
}
class AuthController {
    static async signup(req, res) {
        try {
            const parsed = authValidation_1.signupSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: parsed.error.issues.map((issue) => issue.message).join(', ') });
            }
            const { username, password, role } = parsed.data;
            const user = await authService_1.AuthService.signup(username, password, role);
            return res.status(201).json({ user });
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async login(req, res) {
        try {
            const parsed = authValidation_1.loginSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: parsed.error.issues.map((issue) => issue.message).join(', ') });
            }
            const { username, password } = parsed.data;
            const data = await authService_1.AuthService.login(username, password);
            return res.status(200).json({ success: true, ...data });
        }
        catch (err) {
            return res.status(400).json({ success: false, error: err.message });
        }
    }
    static async refresh(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(400).json({ error: 'refreshToken is required' });
            }
            const tokens = await authService_1.AuthService.refresh(refreshToken);
            return res.status(200).json({ success: true, ...tokens });
        }
        catch (err) {
            return res.status(401).json({ success: false, error: err.message });
        }
    }
}
exports.AuthController = AuthController;
