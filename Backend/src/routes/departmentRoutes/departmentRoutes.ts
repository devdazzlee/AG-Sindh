import { Router } from 'express';
import { DepartmentController } from '../../controllers/departmentController/departmentController';
import { z } from 'zod';

const router = Router();

export const departmentStatusSchema = z.object({
  status: z.enum(['active', 'inactive'])
});

router.post('/create', DepartmentController.create);
router.get('/', DepartmentController.getAll);
router.get('/:id', DepartmentController.getById);
router.put('/:id', DepartmentController.updateById);
router.delete('/:id', DepartmentController.deleteById);
router.patch('/:id/status', DepartmentController.setStatus);

export default router; 