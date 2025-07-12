"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Backend is working!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});
exports.default = router;
