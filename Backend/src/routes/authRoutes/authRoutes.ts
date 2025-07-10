import { Router } from 'express';
import { AuthController } from '../../controllers/authController/authController';

const router = Router();

router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refresh);  

export default router; 