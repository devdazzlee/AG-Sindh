import { Request, Response } from 'express';
import { NotificationService } from '../../services/notificationService/notificationService';
import { AuthenticatedRequest } from '../../types';

export class NotificationController {
  static async getNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      const result = await NotificationService.getNotificationsByUser(userId, limit, offset);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.log('❌ Error in getNotifications:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async getUnreadCount(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const count = await NotificationService.getUnreadCount(userId);
      
      res.json({
        success: true,
        data: { unreadCount: count }
      });
    } catch (error: any) {
      console.log('❌ Error in getUnreadCount:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async markAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { notificationId } = req.params;
      if (!notificationId) {
        return res.status(400).json({ error: 'Notification ID is required' });
      }

      await NotificationService.markAsRead(notificationId, userId);
      
      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async markAllAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      await NotificationService.markAllAsRead(userId);
      
      res.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async deleteNotification(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { notificationId } = req.params;
      if (!notificationId) {
        return res.status(400).json({ error: 'Notification ID is required' });
      }

      await NotificationService.deleteNotification(notificationId, userId);
      
      res.json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
} 