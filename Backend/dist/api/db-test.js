"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../generated/prisma");
const router = express_1.default.Router();
const prisma = new prisma_1.PrismaClient();
router.get('/db-test', async (req, res) => {
    try {
        // Test database connection
        await prisma.$connect();
        // Try a simple query
        const userCount = await prisma.user.count();
        res.json({
            success: true,
            message: 'Database connection successful!',
            userCount,
            timestamp: new Date().toISOString(),
            databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
        });
    }
    catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString(),
            databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
        });
    }
    finally {
        await prisma.$disconnect();
    }
});
exports.default = router;
