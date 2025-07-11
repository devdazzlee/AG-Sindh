"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncomingService = void 0;
const prisma_1 = require("../../../generated/prisma");
const notificationService_1 = require("../notificationService/notificationService");
const prisma = new prisma_1.PrismaClient();
class IncomingService {
    static async createIncoming(data) {
        // Create incoming record
        const createData = {
            ...data,
            status: data.status || 'RECEIVED',
        };
        if (data.receivedDate) {
            createData.receivedDate = new Date(data.receivedDate);
        }
        else {
            delete createData.receivedDate; // Let DB default
        }
        const incoming = await prisma.incoming.create({
            data: createData,
            include: {
                department: true
            }
        });
        // Create notifications for different user roles
        await this.createNotificationsForIncoming(incoming);
        return incoming;
    }
    static async createNotificationsForIncoming(incoming) {
        try {
            // 1. Notify the specific department that received the letter
            if (incoming.department) {
                await notificationService_1.NotificationService.createNotification({
                    message: `New incoming letter received for ${incoming.department.name}: ${incoming.subject || 'No subject'} (QR: ${incoming.qrCode})`,
                    incomingId: incoming.id,
                    departmentId: incoming.department.id,
                    type: 'incoming'
                });
            }
            // 2. Notify all RD department users
            const rdUsers = await prisma.user.findMany({
                where: { role: prisma_1.Role.rd_department },
                include: { department: true }
            });
            for (const rdUser of rdUsers) {
                await notificationService_1.NotificationService.createNotification({
                    message: `New incoming letter received: ${incoming.subject || 'No subject'} for ${incoming.department?.name || 'Unknown Department'} (QR: ${incoming.qrCode})`,
                    incomingId: incoming.id,
                    departmentId: null, // RD department sees all notifications
                    type: 'incoming'
                });
            }
            // 3. Notify all super admin users
            const superAdmins = await prisma.user.findMany({
                where: { role: prisma_1.Role.super_admin },
                include: { department: true }
            });
            for (const admin of superAdmins) {
                await notificationService_1.NotificationService.createNotification({
                    message: `New incoming letter created: ${incoming.subject || 'No subject'} for ${incoming.department?.name || 'Unknown Department'} (QR: ${incoming.qrCode})`,
                    incomingId: incoming.id,
                    departmentId: null, // Super admin sees all notifications
                    type: 'incoming'
                });
            }
        }
        catch (error) {
            console.error('Error creating notifications:', error);
            // Don't throw error to prevent incoming creation from failing
        }
    }
    static async getAllIncoming(limit = 30, offset = 0) {
        const [records, total] = await Promise.all([
            prisma.incoming.findMany({
                include: { department: true, notifications: true },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            prisma.incoming.count()
        ]);
        return {
            records,
            total,
            hasMore: offset + limit < total,
            currentPage: Math.floor(offset / limit) + 1,
            totalPages: Math.ceil(total / limit)
        };
    }
    static async getIncomingById(id) {
        return prisma.incoming.findUnique({
            where: { id },
            include: { department: true, notifications: true },
        });
    }
    static async updateIncoming(id, data) {
        return prisma.incoming.update({
            where: { id },
            data: {
                ...data,
                receivedDate: data.receivedDate ? new Date(data.receivedDate) : undefined,
            },
        });
    }
    static async deleteIncoming(id) {
        // First check if the record exists
        const existingRecord = await prisma.incoming.findUnique({
            where: { id }
        });
        if (!existingRecord) {
            throw new Error('Record not found');
        }
        // Delete notifications first (if any)
        await prisma.notification.deleteMany({ where: { incomingId: id } });
        // Delete incoming record
        return prisma.incoming.delete({ where: { id } });
    }
    static async updateStatus(id, status) {
        const updatedIncoming = await prisma.incoming.update({
            where: { id },
            data: { status },
            include: {
                department: true
            }
        });
        // Create notification for status update
        await this.createStatusUpdateNotification(updatedIncoming, status);
        return updatedIncoming;
    }
    static async createStatusUpdateNotification(incoming, newStatus) {
        try {
            const statusMessages = {
                'RECEIVED': 'Letter has been received',
                'TRANSFERRED': 'Letter has been transferred',
                'COLLECTED': 'Letter has been collected',
                'ARCHIVED': 'Letter has been archived'
            };
            const message = `${statusMessages[newStatus]}: ${incoming.subject || 'No subject'} (QR: ${incoming.qrCode})`;
            // Notify the department
            if (incoming.department) {
                await notificationService_1.NotificationService.createNotification({
                    message,
                    incomingId: incoming.id,
                    departmentId: incoming.department.id,
                    type: 'status_update'
                });
            }
            // Notify RD department and super admins
            const rdUsers = await prisma.user.findMany({
                where: { role: prisma_1.Role.rd_department },
                include: { department: true }
            });
            const superAdmins = await prisma.user.findMany({
                where: { role: prisma_1.Role.super_admin },
                include: { department: true }
            });
            const allAdmins = [...rdUsers, ...superAdmins];
            for (const admin of allAdmins) {
                await notificationService_1.NotificationService.createNotification({
                    message: `Status updated to ${newStatus}: ${incoming.subject || 'No subject'} for ${incoming.department?.name || 'Unknown Department'} (QR: ${incoming.qrCode})`,
                    incomingId: incoming.id,
                    departmentId: null,
                    type: 'status_update'
                });
            }
        }
        catch (error) {
            console.error('Error creating status update notification:', error);
        }
    }
}
exports.IncomingService = IncomingService;
