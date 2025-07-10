"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const authService_1 = require("../services/authService/authService");
function requireAuth(req, res, next) {
    try {
        const header = req.headers.authorization;
        if (!header?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or malformed Authorization header' });
        }
        const token = header.slice(7);
        req.user = authService_1.AuthService.verifyToken(token);
        next();
    }
    catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}
