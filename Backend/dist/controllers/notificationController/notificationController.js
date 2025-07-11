"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notificationService_1 = require("../../services/notificationService/notificationService");
class NotificationController {
    static async getNotifications(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const offset = (page - 1) * limit;
            const result = await notificationService_1.NotificationService.getNotificationsByUser(userId, limit, offset);
            res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    static async getUnreadCount(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const count = await notificationService_1.NotificationService.getUnreadCount(userId);
            res.json({
                success: true,
                data: { unreadCount: count }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    static async markAsRead(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const { notificationId } = req.params;
            if (!notificationId) {
                return res.status(400).json({ error: 'Notification ID is required' });
            }
            await notificationService_1.NotificationService.markAsRead(notificationId, userId);
            res.json({
                success: true,
                message: 'Notification marked as read'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    static async markAllAsRead(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            await notificationService_1.NotificationService.markAllAsRead(userId);
            res.json({
                success: true,
                message: 'All notifications marked as read'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    static async deleteNotification(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const { notificationId } = req.params;
            if (!notificationId) {
                return res.status(400).json({ error: 'Notification ID is required' });
            }
            await notificationService_1.NotificationService.deleteNotification(notificationId, userId);
            res.json({
                success: true,
                message: 'Notification deleted successfully'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}
exports.NotificationController = NotificationController;
