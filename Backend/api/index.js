"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const errorHandler_1 = require("../src/middlewares/errorHandler");
const healthRoutes_1 = __importDefault(require("../src/routes/healthRoutes/healthRoutes"));
const authRoutes_1 = __importDefault(require("../src/routes/authRoutes/authRoutes"));
const departmentRoutes_1 = __importDefault(require("../src/routes/departmentRoutes/departmentRoutes"));
const courierRoutes_1 = __importDefault(require("../src/routes/courierRoutes/courierRoutes"));
const incomingRoutes_1 = __importDefault(require("../src/routes/IncomingRoutes/incomingRoutes"));
const outgoingRoutes_1 = __importDefault(require("../src/routes/outgoingRoutes/outgoingRoutes"));
const notificationRoutes_1 = __importDefault(require("../src/routes/notificationRoutes/notificationRoutes"));
const letterTrackingRoutes_1 = __importDefault(require("../src/routes/letterTrackingRoutes/letterTrackingRoutes"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
}));
// API Versioning
const API_VERSION = 'v1';
const API_PREFIX = `/api/${API_VERSION}`;
app.set('API_VERSION', API_VERSION);
// Mount health and root routes
app.use(API_PREFIX, healthRoutes_1.default);
app.use('/', healthRoutes_1.default);
// Mount authentication routes
app.use(`${API_PREFIX}/auth`, authRoutes_1.default);
app.use(`${API_PREFIX}/departments`, departmentRoutes_1.default);
app.use(`${API_PREFIX}/couriers`, courierRoutes_1.default);
app.use(`${API_PREFIX}/incoming`, incomingRoutes_1.default);
app.use(`${API_PREFIX}/outgoing`, outgoingRoutes_1.default);
app.use(`${API_PREFIX}/notifications`, notificationRoutes_1.default);
app.use(`${API_PREFIX}/tracking`, letterTrackingRoutes_1.default);
app.use(errorHandler_1.errorHandler);
// For Vercel serverless functions
exports.default = app;
