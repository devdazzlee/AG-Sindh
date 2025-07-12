import 'dotenv/config';
import express from 'express';
import { errorHandler } from '../src/middlewares/errorHandler';
import healthRoutes from '../src/routes/healthRoutes/healthRoutes';
import authRoutes from '../src/routes/authRoutes/authRoutes';
import departmentRoutes from '../src/routes/departmentRoutes/departmentRoutes';
import courierRoutes from '../src/routes/courierRoutes/courierRoutes';
import incomingRoutes from '../src/routes/IncomingRoutes/incomingRoutes';
import outgoingRoutes from '../src/routes/outgoingRoutes/outgoingRoutes';
import notificationRoutes from '../src/routes/notificationRoutes/notificationRoutes';
import letterTrackingRoutes from '../src/routes/letterTrackingRoutes/letterTrackingRoutes';
import testRoutes from './test';
import dbTestRoutes from './db-test';
import cors from 'cors';

const app = express();

// Middleware
app.use(express.json());
app.use(
    cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3001', 
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        credentials: true,                
    })
);

// API Versioning
const API_VERSION = 'v1';
const API_PREFIX = `/api/${API_VERSION}`;
app.set('API_VERSION', API_VERSION);

// Mount health and root routes
app.use(API_PREFIX, healthRoutes);
app.use('/', healthRoutes);

// Mount authentication routes
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/departments`, departmentRoutes);
app.use(`${API_PREFIX}/couriers`, courierRoutes);
app.use(`${API_PREFIX}/incoming`, incomingRoutes);
app.use(`${API_PREFIX}/outgoing`, outgoingRoutes);
app.use(`${API_PREFIX}/notifications`, notificationRoutes);
app.use(`${API_PREFIX}/tracking`, letterTrackingRoutes);
app.use('/test', testRoutes);
app.use('/db-test', dbTestRoutes);

app.use(errorHandler);

// For Vercel serverless functions
export default app; 