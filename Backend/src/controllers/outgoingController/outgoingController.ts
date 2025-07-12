import { Request, Response } from 'express';
import { OutgoingService } from '../../services/outgoingService/outgoingService';
import { validateOutgoingData } from '../../validation/outgoingValidation/outgoingValidation';
import { AuthenticatedRequest } from '../../middlewares/auth';
import cloudinary from '../../lib/cloudinary';
import fs from 'fs';

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

      const { from, to, priority, subject, qrCode } = req.body;
      let image = req.file;

      // If file is uploaded, upload to Cloudinary and delete local file
      if (image) {
        const originalPath = image.path; // Store original path before modifying
        console.log('📁 Processing file upload:', {
          originalPath,
          fileSize: image.size,
          mimetype: image.mimetype
        });

        try {
          console.log('☁️ Uploading to Cloudinary...');
          const result = await cloudinary.uploader.upload(image.path, {
            folder: 'outgoing_letters',
          });
          console.log('✅ Cloudinary upload successful:', result.secure_url);
          
          // Replace the file object with Cloudinary URL
          image = { ...image, path: result.secure_url } as any;
          
          // Delete local file using original path
          console.log('🗑️ Deleting local file:', originalPath);
          if (fs.existsSync(originalPath)) {
            fs.unlinkSync(originalPath);
            console.log('✅ Local file deleted successfully');
          } else {
            console.log('⚠️ Local file not found for deletion');
          }
        } catch (uploadError) {
          console.error('❌ Cloudinary upload failed:', uploadError);
          // If Cloudinary upload fails, delete local file and return error
          if (fs.existsSync(originalPath)) {
            console.log('🗑️ Deleting local file after failed upload:', originalPath);
            fs.unlinkSync(originalPath);
            console.log('✅ Local file deleted after failed upload');
          }
          throw new Error(`Failed to upload image to Cloudinary: ${uploadError}`);
        }
      }

      const outgoing = await OutgoingService.createOutgoing({
        from,
        to,
        priority,
        subject,
        qrCode,
        image,
      }, req.user?.id);

      res.status(201).json({
        success: true,
        message: 'Outgoing letter created successfully',
        data: outgoing,
      });
    } catch (error: any) {
      console.error('❌ Error in createOutgoing:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create outgoing letter',
        error: error.message,
      });
    }
  }

  static async getAllOutgoing(req: Request, res: Response) {
    try {
      const { limit = 30, offset = 0 } = req.query;
      const outgoing = await OutgoingService.getAllOutgoing(Number(limit), Number(offset));

      res.status(200).json({
        success: true,
        message: 'Outgoing letters fetched successfully',
        data: outgoing,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch outgoing letters',
        error: error.message,
      });
    }
  }

  static async getOutgoingById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const outgoing = await OutgoingService.getOutgoingById(id);

      res.status(200).json({
        success: true,
        message: 'Outgoing letter fetched successfully',
        data: outgoing,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: 'Outgoing letter not found',
        error: error.message,
      });
    }
  }

  static async getOutgoingByQR(req: Request, res: Response) {
    try {
      const { qrCode } = req.params;

      const outgoing = await OutgoingService.getOutgoingByQR(qrCode);

      res.status(200).json({
        success: true,
        message: 'Outgoing letter fetched successfully',
        data: outgoing,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: 'Outgoing letter not found',
        error: error.message,
      });
    }
  }

  static async updateOutgoing(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { from, to, priority, subject } = req.body;
      let image = req.file;

      // If file is uploaded, upload to Cloudinary and delete local file
      if (image) {
        const originalPath = image.path; // Store original path before modifying
        console.log('📁 Processing file update:', {
          originalPath,
          fileSize: image.size,
          mimetype: image.mimetype
        });

        try {
          console.log('☁️ Uploading to Cloudinary...');
          const result = await cloudinary.uploader.upload(image.path, {
            folder: 'outgoing_letters',
          });
          console.log('✅ Cloudinary upload successful:', result.secure_url);
          
          // Replace the file object with Cloudinary URL
          image = { ...image, path: result.secure_url } as any;
          
          // Delete local file using original path
          console.log('🗑️ Deleting local file:', originalPath);
          if (fs.existsSync(originalPath)) {
            fs.unlinkSync(originalPath);
            console.log('✅ Local file deleted successfully');
          } else {
            console.log('⚠️ Local file not found for deletion');
          }
        } catch (uploadError) {
          console.error('❌ Cloudinary upload failed:', uploadError);
          // If Cloudinary upload fails, delete local file and return error
          if (fs.existsSync(originalPath)) {
            console.log('🗑️ Deleting local file after failed upload:', originalPath);
            fs.unlinkSync(originalPath);
            console.log('✅ Local file deleted after failed upload');
          }
          throw new Error(`Failed to upload image to Cloudinary: ${uploadError}`);
        }
      }

      const updateData: any = {
        from,
        to,
        priority,
        subject,
      };

      if (image) {
        updateData.image = image;
      }

      const outgoing = await OutgoingService.updateOutgoing(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Outgoing letter updated successfully',
        data: outgoing,
      });
    } catch (error: any) {
      console.error('❌ Error in updateOutgoing:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update outgoing letter',
        error: error.message,
      });
    }
  }

  static async updateOutgoingStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, dispatchedDate, deliveredDate } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required',
        });
      }

      const validStatuses = ['PENDING_DISPATCH', 'DISPATCHED', 'DELIVERED', 'RETURNED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be one of: PENDING_DISPATCH, DISPATCHED, DELIVERED, RETURNED',
        });
      }

      const outgoing = await OutgoingService.updateOutgoingStatus(id, {
        status: status as any,
        dispatchedDate: dispatchedDate ? new Date(dispatchedDate) : undefined,
        deliveredDate: deliveredDate ? new Date(deliveredDate) : undefined,
      });

      res.status(200).json({
        success: true,
        message: 'Outgoing letter status updated successfully',
        data: outgoing,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update outgoing letter status',
        error: error.message,
      });
    }
  }

  static async deleteOutgoing(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await OutgoingService.deleteOutgoing(id);

      res.status(200).json({
        success: true,
        message: 'Outgoing letter deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete outgoing letter',
        error: error.message,
      });
    }
  }

  static async getOutgoingByDepartment(req: Request, res: Response) {
    try {
      const { departmentId } = req.params;

      const outgoing = await OutgoingService.getOutgoingByDepartment(departmentId);

      res.status(200).json({
        success: true,
        message: 'Outgoing letters fetched successfully',
        data: outgoing,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch outgoing letters',
        error: error.message,
      });
    }
  }

  static async getOutgoingStats(req: Request, res: Response) {
    try {
      const stats = await OutgoingService.getOutgoingStats();

      res.status(200).json({
        success: true,
        message: 'Outgoing statistics fetched successfully',
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch outgoing statistics',
        error: error.message,
      });
    }
  }

  static async scanOutgoingQR(req: Request, res: Response) {
    try {
      const { qrCode } = req.body;

      if (!qrCode) {
        return res.status(400).json({
          success: false,
          message: 'QR code is required',
        });
      }

      const outgoing = await OutgoingService.getOutgoingByQR(qrCode);

      res.status(200).json({
        success: true,
        message: 'QR code scanned successfully',
        data: outgoing,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: 'Outgoing letter not found',
        error: error.message,
      });
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