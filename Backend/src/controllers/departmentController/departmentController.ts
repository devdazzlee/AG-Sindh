import { Request, Response } from 'express';
import { departmentCreateSchema } from '../../validation/departmentValidation/departmentValidation';
import { DepartmentService } from '../../services/departmentService/departmentService';
import { departmentUpdateSchema } from '../../validation/departmentValidation/departmentValidation';
import { departmentStatusSchema } from '../../validation/departmentValidation/departmentValidation';

export class DepartmentController {
  static async create(req: Request, res: Response) {
    try {
      const parsed = departmentCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues.map(issue => issue.message).join(', ') });
      }
      const data = parsed.data;
      // Only allow creation of 'other_department' role
      const result = await DepartmentService.createDepartmentWithAccount(data);
      return res.status(201).json({ success: true, ...result });
    } catch (err: any) {
      // Check for Prisma unique constraint error by code property
      if (err?.code === 'P2002') {
        return res.status(400).json({ success: false, error: 'Department code already exists. Please use a unique code.' });
      }
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const departments = await DepartmentService.getAllDepartments();
      return res.status(200).json({ success: true, departments });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const department = await DepartmentService.getDepartmentById(id);
      if (!department) return res.status(404).json({ success: false, error: 'Department not found' });
      return res.status(200).json({ success: true, department });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  static async updateById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsed = departmentUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues.map(issue => issue.message).join(', ') });
      }
      const updated = await DepartmentService.updateDepartmentById(id, parsed.data);
      return res.status(200).json({ success: true, department: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  static async deleteById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await DepartmentService.deleteDepartmentById(id);
      return res.status(200).json({ success: true });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  static async setStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const parsed = departmentStatusSchema.safeParse({ status });
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues.map(issue => issue.message).join(', ') });
      }
      const updated = await DepartmentService.setDepartmentStatus(id, status);
      return res.status(200).json({ success: true, department: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }
} 