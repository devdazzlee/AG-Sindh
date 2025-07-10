import { Router } from 'express';
import { HealthController } from '../../controllers/healthController/healthController';

const router = Router();

// Versioned health check endpoint
router.get('/health', HealthController.healthCheck);

// Root endpoint
router.get('/', HealthController.root);

export default router; 