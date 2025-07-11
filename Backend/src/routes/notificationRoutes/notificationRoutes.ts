import { Router } from 'express';
import { NotificationController } from '../../controllers/notificationController/notificationController';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

// Get all notifications for the authenticated user
router.get('/', requireAuth, NotificationController.getNotifications);

// Get unread notification count
router.get('/unread-count', requireAuth, NotificationController.getUnreadCount);

// Mark a specific notification as read
router.patch('/:notificationId/read', requireAuth, NotificationController.markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', requireAuth, NotificationController.markAllAsRead);

// Delete a notification
router.delete('/:notificationId', requireAuth, NotificationController.deleteNotification);

export default router; 