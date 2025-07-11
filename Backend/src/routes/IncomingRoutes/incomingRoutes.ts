import { Router } from 'express';
import { IncomingController, upload, requireSuperAdmin } from '../../controllers/IncomingController/incomingController';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

// Apply authentication to all routes
router.use(requireAuth);

// Create incoming (with image upload)
router.post('/', upload.single('image'), IncomingController.create);
// Get all incoming
router.get('/', IncomingController.getAll);
// Get incoming by id
router.get('/:id', IncomingController.getById);
// Update incoming (with image upload) - Super admin only
router.put('/:id', requireSuperAdmin, upload.single('image'), IncomingController.update);
// Delete incoming - Super admin only
router.delete('/:id', requireSuperAdmin, IncomingController.delete);
// Update status
router.patch('/:id/status', IncomingController.updateStatus);

export default router; 