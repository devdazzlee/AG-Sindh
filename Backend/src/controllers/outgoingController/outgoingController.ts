import { Request, Response } from 'express';
import { OutgoingService } from '../../services/outgoingService/outgoingService';
import { validateOutgoingData } from '../../validation/outgoingValidation/outgoingValidation';
import { AuthenticatedRequest } from '../../middlewares/auth';

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
      const image = req.file;

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
      const image = req.file;

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
        message: 'Department outgoing letters fetched successfully',
        data: {
          records: outgoing,
          total: outgoing.length,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch department outgoing letters',
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
        message: 'Invalid QR code or outgoing letter not found',
        error: error.message,
      });
    }
  }
}

// Super admin middleware
export function requireSuperAdmin(req: AuthenticatedRequest, res: Response, next: Function) {
  if (req.user?.role !== 'super_admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Forbidden: Only super admin can perform this action.' 
    });
  }
  next();
} 