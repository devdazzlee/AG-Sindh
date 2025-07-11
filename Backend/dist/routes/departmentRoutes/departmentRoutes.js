"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentStatusSchema = void 0;
const express_1 = require("express");
const departmentController_1 = require("../../controllers/departmentController/departmentController");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
exports.departmentStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['active', 'inactive'])
});
router.post('/create', departmentController_1.DepartmentController.create);
router.get('/', departmentController_1.DepartmentController.getAll);
router.get('/:id', departmentController_1.DepartmentController.getById);
router.put('/:id', departmentController_1.DepartmentController.updateById);
router.delete('/:id', departmentController_1.DepartmentController.deleteById);
router.patch('/:id/status', departmentController_1.DepartmentController.setStatus);
exports.default = router;
