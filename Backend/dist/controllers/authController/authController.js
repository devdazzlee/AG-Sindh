"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../../services/authService/authService");
function validateRole(role) {
    return ['super_admin', 'rd_department', 'other_department'].includes(role);
}
class AuthController {
    static async signup(req, res) {
        try {
            const { username, password, role } = req.body;
            if (!username || !password || !role) {
                return res.status(400).json({ error: 'username, password & role are required' });
            }
            if (!validateRole(role)) {
                return res.status(400).json({ error: 'Invalid role provided' });
            }
            const user = await authService_1.AuthService.signup(username, password, role);
            return res.status(201).json({ user });
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async login(req, res) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({ error: 'username & password are required' });
            }
            const data = await authService_1.AuthService.login(username, password);
            return res.status(200).json({ success: true, ...data });
        }
        catch (err) {
            return res.status(400).json({ success: false, error: err.message });
        }
    }
}
exports.AuthController = AuthController;
