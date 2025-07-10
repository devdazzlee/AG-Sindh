import 'dotenv/config';
import express from 'express';
import { errorHandler } from './middlewares/errorHandler';
import healthRoutes from './routes/healthRoutes/healthRoutes';
import authRoutes from './routes/authRoutes/authRoutes';
import cors from 'cors';


const app = express();
app.use(express.json());
app.use(
    cors({
        origin: 'http://localhost:3001',  // front-end origin
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,                // if you need cookies/auth headers
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

app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));