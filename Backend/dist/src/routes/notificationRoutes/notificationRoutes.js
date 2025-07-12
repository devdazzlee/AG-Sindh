"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationController_1 = require("../../controllers/notificationController/notificationController");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
// Get all notifications for the authenticated user
router.get('/', auth_1.requireAuth, notificationController_1.NotificationController.getNotifications);
// Get unread notification count
router.get('/unread-count', auth_1.requireAuth, notificationController_1.NotificationController.getUnreadCount);
// Mark a specific notification as read
router.patch('/:notificationId/read', auth_1.requireAuth, notificationController_1.NotificationController.markAsRead);
// Mark all notifications as read
router.patch('/mark-all-read', auth_1.requireAuth, notificationController_1.NotificationController.markAllAsRead);
// Delete a notification
router.delete('/:notificationId', auth_1.requireAuth, notificationController_1.NotificationController.deleteNotification);
exports.default = router;
