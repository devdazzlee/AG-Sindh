"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentController = void 0;
const departmentValidation_1 = require("../../validation/departmentValidation/departmentValidation");
const departmentService_1 = require("../../services/departmentService/departmentService");
const departmentValidation_2 = require("../../validation/departmentValidation/departmentValidation");
const departmentValidation_3 = require("../../validation/departmentValidation/departmentValidation");
class DepartmentController {
    static async create(req, res) {
        try {
            const parsed = departmentValidation_1.departmentCreateSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: parsed.error.issues.map(issue => issue.message).join(', ') });
            }
            const data = parsed.data;
            // Only allow creation of 'other_department' role
            const result = await departmentService_1.DepartmentService.createDepartmentWithAccount(data);
            return res.status(201).json({ success: true, ...result });
        }
        catch (err) {
            // Check for Prisma unique constraint error by code property
            if (err?.code === 'P2002') {
                return res.status(400).json({ success: false, error: 'Department code already exists. Please use a unique code.' });
            }
            return res.status(400).json({ success: false, error: err.message });
        }
    }
    static async getAll(req, res) {
        try {
            const departments = await departmentService_1.DepartmentService.getAllDepartments();
            return res.status(200).json({ success: true, departments });
        }
        catch (err) {
            return res.status(400).json({ success: false, error: err.message });
        }
    }
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const department = await departmentService_1.DepartmentService.getDepartmentById(id);
            if (!department)
                return res.status(404).json({ success: false, error: 'Department not found' });
            return res.status(200).json({ success: true, department });
        }
        catch (err) {
            return res.status(400).json({ success: false, error: err.message });
        }
    }
    static async updateById(req, res) {
        try {
            const { id } = req.params;
            const parsed = departmentValidation_2.departmentUpdateSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: parsed.error.issues.map(issue => issue.message).join(', ') });
            }
            const updated = await departmentService_1.DepartmentService.updateDepartmentById(id, parsed.data);
            return res.status(200).json({ success: true, department: updated });
        }
        catch (err) {
            return res.status(400).json({ success: false, error: err.message });
        }
    }
    static async deleteById(req, res) {
        try {
            const { id } = req.params;
            await departmentService_1.DepartmentService.deleteDepartmentById(id);
            return res.status(200).json({ success: true });
        }
        catch (err) {
            return res.status(400).json({ success: false, error: err.message });
        }
    }
    static async setStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const parsed = departmentValidation_3.departmentStatusSchema.safeParse({ status });
            if (!parsed.success) {
                return res.status(400).json({ error: parsed.error.issues.map(issue => issue.message).join(', ') });
            }
            const updated = await departmentService_1.DepartmentService.setDepartmentStatus(id, status);
            return res.status(200).json({ success: true, department: updated });
        }
        catch (err) {
            return res.status(400).json({ success: false, error: err.message });
        }
    }
}
exports.DepartmentController = DepartmentController;
