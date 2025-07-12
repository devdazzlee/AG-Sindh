import { Request, Response, NextFunction } from 'express';
import { IncomingService } from '../../services/IncomingService/incomingService';
import { incomingCreateSchema, incomingUpdateSchema, incomingStatusSchema } from '../../validation/IncomingValidation/incomingValidation';
import multer, { StorageEngine } from 'multer';
import path from 'path';
import cloudinary from '../../lib/cloudinary';
import fs from 'fs';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

// Extend Express Request type to include file
interface MulterRequest extends AuthenticatedRequest {
  file?: Express.Multer.File;
}

// Role-based authorization middleware
const requireSuperAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  console.log('Authorization check:', {
    hasUser: !!req.user,
    userRole: req.user?.role,
    expectedRole: 'super_admin',
    isMatch: req.user?.role === 'super_admin'
  });
  
  if (!req.user || req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Access denied. Super admin privileges required.' });
  }
  next();
};

// Multer config for image upload
const storage: StorageEngine = multer.memoryStorage();
export const upload = multer({ storage });

export class IncomingController {
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const mReq = req as MulterRequest;
      const data = { ...req.body };
      
      // Only update image if a new file is uploaded
      if (mReq.file) {
        const result = await new Promise<any>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'incoming_letters' }, // or 'outgoing_letters'
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          stream.end(mReq.file!.buffer); // non-null assertion
        });
        data.image = (result as any).secure_url;
      }
      // If no new file, don't include image in the update data (preserve existing)
      
      const parsed = incomingCreateSchema.safeParse(data);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      
      // Pass the creator's user ID to exclude them from notifications
      const creatorUserId = req.user?.id;
      const incoming = await IncomingService.createIncoming(parsed.data, creatorUserId);
      res.status(201).json({ incoming });
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
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
      
      const result = await IncomingService.getAllIncoming(limit, offset, userWithDepartment);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const record = await IncomingService.getIncomingById(id);
      if (!record) return res.status(404).json({ error: 'Not found' });
      res.json({ record });
    } catch (err) {
      next(err);
    }
  }

  static async getByQRCode(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { qrCode } = req.params;
      const record = await IncomingService.getIncomingByQRCode(qrCode);
      if (!record) return res.status(404).json({ error: 'Letter not found with this QR code' });
      res.json({ record });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const mReq = req as MulterRequest;
      const data = { ...req.body };
      
      // Only update image if a new file is uploaded
      if (mReq.file) {
        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'incoming_letters' }, // or 'outgoing_letters'
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          stream.end(mReq.file.buffer);
        });
        data.image = result.secure_url;
      }
      // If no new file, don't include image in the update data (preserve existing)
      
      const parsed = incomingUpdateSchema.safeParse(data);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const { id } = req.params;
      const updated = await IncomingService.updateIncoming(id, parsed.data);
      res.json({ updated });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      try {
        await IncomingService.deleteIncoming(id);
        res.status(204).send();
      } catch (error: any) {
        if (error.message === 'Record not found') {
          return res.status(404).json({ error: 'Record not found' });
        }
        throw error;
      }
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parsed = incomingStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const updated = await IncomingService.updateStatus(id, parsed.data.status);
      res.json({ updated });
    } catch (err) {
      next(err);
    }
  }

  static async updateStatusByQRCode(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { qrCode } = req.params;
      const parsed = incomingStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      
      const result = await IncomingService.updateStatusByQRCode(qrCode, parsed.data.status);
      
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
      if (err.message === 'Incoming letter not found with this QR code') {
        return res.status(404).json({ 
          success: false,
          error: 'Incoming letter not found with this QR code' 
        });
      }
      next(err);
    }
  }
}

// Export the authorization middleware
export { requireSuperAdmin }; 