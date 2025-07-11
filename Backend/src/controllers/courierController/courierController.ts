import { Request, Response } from 'express';
import { courierSchema } from '../../validation/courierValidation/courierValidation';
import { CourierService } from '../../services/courierService/courierService';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const statusSchema = z.object({ status: z.enum(['active', 'inactive']) });

export class CourierController {
  static async create(req: Request, res: Response) {
    try {
      const parsed = courierSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues.map(issue => issue.message).join(', ') });
      }
      const courier = await CourierService.createCourier(parsed.data);
      return res.status(201).json({ success: true, courier });
    } catch (err: any) {
      // Check for Prisma unique constraint error by code property
      if (err?.code === 'P2002') {
        return res.status(400).json({ success: false, error: 'Service Code already exists. Please use a unique code.' });
      }
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const couriers = await CourierService.getAllCouriers();
      return res.status(200).json({ success: true, couriers });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const courier = await CourierService.getCourierById(id);
      if (!courier) return res.status(404).json({ success: false, error: 'Courier not found' });
      return res.status(200).json({ success: true, courier });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  static async updateById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsed = courierSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues.map(issue => issue.message).join(', ') });
      }
      const updated = await CourierService.updateCourierById(id, parsed.data);
      return res.status(200).json({ success: true, courier: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  static async deleteById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await CourierService.deleteCourierById(id);
      return res.status(200).json({ success: true });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  static async setStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const parsed = statusSchema.safeParse({ status });
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues.map(issue => issue.message).join(', ') });
      }
      const updated = await CourierService.updateCourierById(id, { status });
      return res.status(200).json({ success: true, courier: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }
}
