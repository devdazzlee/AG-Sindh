import { Router } from 'express';
import { CourierController } from '../../controllers/courierController/courierController';

const router = Router();

router.post('/create', CourierController.create);
router.get('/', CourierController.getAll);
router.get('/:id', CourierController.getById);
router.put('/:id', CourierController.updateById);
router.delete('/:id', CourierController.deleteById);
router.patch('/:id/status', CourierController.setStatus);

export default router;
