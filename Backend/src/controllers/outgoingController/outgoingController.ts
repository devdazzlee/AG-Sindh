import { Request, Response, NextFunction } from 'express';
import { OutgoingService } from '../../services/outgoingService/outgoingService';
import { validateOutgoingData, validateOutgoingStatusUpdate } from '../../validation/outgoingValidation/outgoingValidation';
import { AuthenticatedRequest } from '../../middlewares/auth';
import cloudinary from '../../lib/cloudinary';
import fs from 'fs';
import { outgoingStatusSchema } from '../../validation/outgoingValidation/outgoingValidation';
import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

export class OutgoingController {
  static async createOutgoing(req: AuthenticatedRequest, res: Response) {
    try {
      const validationResult = validateOutgoingData(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: validationResult.error,
        });
      }

      const { from, to, priority, subject, qrCode, courierServiceId } = req.body;
      let imageUrl: string | undefined;

      // If file is uploaded, upload to Cloudinary and delete local file
      if (req.file) {
        const result = await new Promise<any>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'outgoing_letters' },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          stream.end(req.file!.buffer);
        });
        imageUrl = (result as any).secure_url;
      }

      const outgoing = await OutgoingService.createOutgoing({
        from,
        to,
        priority,
        subject,
        qrCode,
        image: imageUrl,
        courierServiceId,
      }, req.user?.id);

      res.status(201).json({
        success: true,
        data: outgoing,
      });
    } catch (error: any) {
      console.error('Error creating outgoing:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      console.log('🔍 Outgoing getAll called with user:', req.user);
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 30;
      const offset = (page - 1) * limit;
      
      console.log('📄 Pagination params:', { page, limit, offset });
      
      // Get user's department information if they are a department user
      let userWithDepartment: any = req.user;
      if (req.user && req.user.role === 'other_department') {
        const userWithDept = await prisma.user.findUnique({
          where: { id: req.user.id },
          include: { department: true }
        });
        userWithDepartment = userWithDept || req.user;
        console.log('🏢 Department user with dept:', userWithDepartment);
      } else {
        console.log('👑 Admin/RD user:', userWithDepartment);
      }
      
      const result = await OutgoingService.getAllOutgoing(limit, offset, userWithDepartment);
      console.log('📊 Outgoing result:', { 
        totalRecords: result.total, 
        returnedRecords: result.records.length,
        hasMore: result.hasMore 
      });
      
      res.json(result);
    } catch (err) {
      console.error('❌ Error in outgoing getAll:', err);
      next(err);
    }
  }

  static async getOutgoingById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const outgoing = await OutgoingService.getOutgoingById(id);

      if (!outgoing) {
        return res.status(404).json({
          success: false,
          error: 'Outgoing letter not found',
        });
      }

      res.json({
        success: true,
        data: outgoing,
      });
    } catch (error: any) {
      console.error('Error fetching outgoing by ID:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async updateOutgoing(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { from, to, priority, subject } = req.body;
      let imageUrl: string | undefined;

      // If file is uploaded, upload to Cloudinary and delete local file
      if (req.file) {
        const result = await new Promise<any>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'outgoing_letters' },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          stream.end(req.file!.buffer);
        });
        imageUrl = (result as any).secure_url;
      }

      const updateData: any = {
        from,
        to,
        priority,
        subject,
      };

      if (imageUrl) {
        updateData.image = imageUrl;
      }

      const updated = await OutgoingService.updateOutgoing(id, updateData);

      res.json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      console.error('Error updating outgoing:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async deleteOutgoing(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await OutgoingService.deleteOutgoing(id);

      res.json({
        success: true,
        message: 'Outgoing letter deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting outgoing:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async updateStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updated = await OutgoingService.updateOutgoingStatus(id, { status });

      res.json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      console.error('Error updating outgoing status:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async updateOutgoingStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const validationResult = validateOutgoingStatusUpdate(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: validationResult.error,
        });
      }

      const updated = await OutgoingService.updateOutgoingStatus(id, {
        ...validationResult.data!,
        dispatchedDate: validationResult.data!.dispatchedDate ? new Date(validationResult.data!.dispatchedDate) : undefined,
        deliveredDate: validationResult.data!.deliveredDate ? new Date(validationResult.data!.deliveredDate) : undefined
      });

      res.json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      console.error('Error updating outgoing status:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async getOutgoingStats(req: AuthenticatedRequest, res: Response) {
    try {
      const stats = await OutgoingService.getOutgoingStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('Error fetching outgoing stats:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async updateStatusByQRCode(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { qrCode } = req.params;
      const parsed = outgoingStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      
      const result = await OutgoingService.updateStatusByQRCode(qrCode, parsed.data.status);
      
      if (result.statusChanged) {
        res.json({ 
          success: true,
          message: result.message,
          updated: result.updated,
          statusChanged: true
        });
      } else {
        res.json({ 
          success: true,
          message: result.message,
          updated: result.updated,
          statusChanged: false
        });
      }
    } catch (err: any) {
      if (err.message === 'Outgoing letter not found with this QR code') {
        return res.status(404).json({ 
          success: false,
          error: 'Outgoing letter not found with this QR code' 
        });
      }
      next(err);
    }
  }

  static async getByQRCode(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { qrCode } = req.params;
      const record = await OutgoingService.getOutgoingByQRCode(qrCode);
      if (!record) return res.status(404).json({ error: 'Letter not found with this QR code' });
      res.json({ record });
    } catch (err) {
      next(err);
    }
  }

  static async getCourierTrackingRecords(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 30;
      const offset = (page - 1) * limit;
      
      // Get user's department information if they are a department user
      let userWithDepartment: any = req.user;
      if (req.user && req.user.role === 'other_department') {
        const userWithDept = await prisma.user.findUnique({
          where: { id: req.user.id },
          include: { department: true }
        });
        userWithDepartment = userWithDept || req.user;
      }
      
      const result = await OutgoingService.getCourierTrackingRecords(limit, offset, userWithDepartment);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

// Role-based authorization middleware
export function requireSuperAdmin(req: AuthenticatedRequest, res: Response, next: Function) {
  if (!req.user || req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin privileges required.',
    });
  }
  next();
} 