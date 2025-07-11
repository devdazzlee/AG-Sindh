"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const prisma_1 = require("../../../generated/prisma");
const prisma = new prisma_1.PrismaClient();
class NotificationService {
    static async createNotification(data) {
        return prisma.notification.create({
            data: {
                message: data.message,
                incomingId: data.incomingId,
                departmentId: data.departmentId || null,
            },
            include: {
                incoming: {
                    include: {
                        department: true
                    }
                },
                department: true
            }
        });
    }
    static async getNotificationsByUser(userId, limit = 50, offset = 0) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { department: true }
        });
        if (!user) {
            throw new Error('User not found');
        }
        let whereClause = {};
        // Filter notifications based on user role
        if (user.role === prisma_1.Role.super_admin || user.role === prisma_1.Role.rd_department) {
            // Super admin and RD department see all notifications
            whereClause = {};
        }
        else if (user.role === prisma_1.Role.other_department && user.department) {
            // Other departments only see notifications for their department
            whereClause = {
                OR: [
                    { departmentId: user.department.id },
                    { departmentId: null } // System notifications
                ]
            };
        }
        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where: whereClause,
                include: {
                    incoming: {
                        include: {
                            department: true
                        }
                    },
                    department: true
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            prisma.notification.count({ where: whereClause })
        ]);
        return {
            notifications,
            total,
            hasMore: offset + limit < total,
            currentPage: Math.floor(offset / limit) + 1,
            totalPages: Math.ceil(total / limit)
        };
    }
    static async markAsRead(notificationId, userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { department: true }
        });
        if (!user) {
            throw new Error('User not found');
        }
        let whereClause = { id: notificationId };
        // Ensure user can only mark their own notifications as read
        if (user.role === prisma_1.Role.other_department && user.department) {
            whereClause = {
                id: notificationId,
                OR: [
                    { departmentId: user.department.id },
                    { departmentId: null }
                ]
            };
        }
        return prisma.notification.update({
            where: whereClause,
            data: { isRead: true }
        });
    }
    static async markAllAsRead(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { department: true }
        });
        if (!user) {
            throw new Error('User not found');
        }
        let whereClause = { isRead: false };
        if (user.role === prisma_1.Role.other_department && user.department) {
            whereClause = {
                isRead: false,
                OR: [
                    { departmentId: user.department.id },
                    { departmentId: null }
                ]
            };
        }
        return prisma.notification.updateMany({
            where: whereClause,
            data: { isRead: true }
        });
    }
    static async getUnreadCount(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { department: true }
        });
        if (!user) {
            throw new Error('User not found');
        }
        let whereClause = { isRead: false };
        if (user.role === prisma_1.Role.other_department && user.department) {
            whereClause = {
                isRead: false,
                OR: [
                    { departmentId: user.department.id },
                    { departmentId: null }
                ]
            };
        }
        return prisma.notification.count({ where: whereClause });
    }
    static async deleteNotification(notificationId, userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { department: true }
        });
        if (!user) {
            throw new Error('User not found');
        }
        let whereClause = { id: notificationId };
        if (user.role === prisma_1.Role.other_department && user.department) {
            whereClause = {
                id: notificationId,
                OR: [
                    { departmentId: user.department.id },
                    { departmentId: null }
                ]
            };
        }
        return prisma.notification.delete({
            where: whereClause
        });
    }
}
exports.NotificationService = NotificationService;
