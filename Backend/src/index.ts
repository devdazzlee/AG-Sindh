import 'dotenv/config';
import express from 'express';
import { errorHandler } from './middlewares/errorHandler';
import healthRoutes from './routes/healthRoutes/healthRoutes';
import authRoutes from './routes/authRoutes/authRoutes';
import departmentRoutes from './routes/departmentRoutes/departmentRoutes';
import courierRoutes from './routes/courierRoutes/courierRoutes';
import incomingRoutes from './routes/IncomingRoutes/incomingRoutes';
import notificationRoutes from './routes/notificationRoutes/notificationRoutes';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(
    cors({
        origin: 'http://localhost:3001', 
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
app.use(`${API_PREFIX}/notifications`, notificationRoutes);

app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));