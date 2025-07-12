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
                incomingId: data.incomingId || null,
                outgoingId: data.outgoingId || null,
                departmentId: data.departmentId || null,
                userId: data.userId || null,
            },
            include: {
                incoming: {
                    include: {
                        department: true
                    }
                },
                outgoing: {
                    include: {
                        department: true
                    }
                },
                department: true,
                user: true
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
        // Get notifications specifically for this user
        const whereClause = { userId: userId };
        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where: whereClause,
                include: {
                    incoming: {
                        include: {
                            department: true
                        }
                    },
                    outgoing: {
                        include: {
                            department: true
                        }
                    },
                    department: true,
                    user: true
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
        // User can only mark their own notifications as read
        return prisma.notification.update({
            where: {
                id: notificationId,
                userId: userId
            },
            data: { isRead: true }
        });
    }
    static async markAllAsRead(userId) {
        // User can only mark their own notifications as read
        return prisma.notification.updateMany({
            where: {
                isRead: false,
                userId: userId
            },
            data: { isRead: true }
        });
    }
    static async getUnreadCount(userId) {
        // User only sees their own unread notifications
        return prisma.notification.count({
            where: {
                isRead: false,
                userId: userId
            }
        });
    }
    static async deleteNotification(notificationId, userId) {
        // User can only delete their own notifications
        return prisma.notification.delete({
            where: {
                id: notificationId,
                userId: userId
            }
        });
    }
}
exports.NotificationService = NotificationService;
