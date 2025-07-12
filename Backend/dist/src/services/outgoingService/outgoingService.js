"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutgoingService = void 0;
const prisma_1 = require("../../../generated/prisma");
const prisma = new prisma_1.PrismaClient();
class OutgoingService {
    static async createOutgoing(data, creatorUserId) {
        try {
            const outgoing = await prisma.outgoing.create({
                data: {
                    from: data.from,
                    to: data.to,
                    priority: data.priority,
                    subject: data.subject,
                    qrCode: data.qrCode,
                    image: data.image, // Direct Cloudinary URL from controller
                    status: 'PENDING_DISPATCH',
                    courierServiceId: data.courierServiceId,
                },
                include: {
                    department: true,
                    courierService: true,
                },
            });
            // Create notifications for the department
            await this.createNotificationsForOutgoing(outgoing, creatorUserId);
            return outgoing;
        }
        catch (error) {
            throw new Error(`Failed to create outgoing letter: ${error}`);
        }
    }
    static async createNotificationsForOutgoing(outgoing, creatorUserId) {
        try {
            console.log('🔔 Creating notifications for outgoing:', {
                outgoingId: outgoing.id,
                from: outgoing.from,
                to: outgoing.to,
                departmentName: outgoing.department?.name,
                creatorUserId
            });
            // Get the creator's role to determine who should be notified
            let creatorRole = null;
            if (creatorUserId) {
                const creator = await prisma.user.findUnique({
                    where: { id: creatorUserId },
                    include: { department: true }
                });
                creatorRole = creator?.role || null;
            }
            // Get all users in a single query
            const allUsers = await prisma.user.findMany({
                include: { department: true }
            });
            // Prepare batch notification data
            const notificationsToCreate = [];
            // Process users and prepare notification data
            for (const user of allUsers) {
                // Skip the creator
                if (creatorUserId && user.id === creatorUserId) {
                    continue;
                }
                let shouldNotify = false;
                let message = '';
                if (user.role === prisma_1.Role.super_admin) {
                    // Super admin gets notified about all outgoing letters (except when they create it)
                    shouldNotify = true;
                    message = `New outgoing letter created: ${outgoing.subject || 'No subject'} from ${outgoing.department?.name || 'Unknown Department'} to ${outgoing.to} (QR: ${outgoing.qrCode})`;
                }
                else if (user.role === prisma_1.Role.rd_department) {
                    // RD department gets notified about all outgoing letters (except when they create it)
                    shouldNotify = true;
                    message = `New outgoing letter dispatched: ${outgoing.subject || 'No subject'} from ${outgoing.department?.name || 'Unknown Department'} to ${outgoing.to} (QR: ${outgoing.qrCode})`;
                }
                else if (user.role === prisma_1.Role.other_department && user.department) {
                    // Other departments only get notified if the letter is from their department (except when they create it)
                    if (user.department.id === outgoing.from) {
                        shouldNotify = true;
                        message = `New outgoing letter created from your department: ${outgoing.subject || 'No subject'} to ${outgoing.to} (QR: ${outgoing.qrCode})`;
                    }
                }
                if (shouldNotify) {
                    notificationsToCreate.push({
                        message,
                        outgoingId: outgoing.id,
                        departmentId: outgoing.from,
                        userId: user.id,
                        type: 'outgoing'
                    });
                }
            }
            // Create all notifications in a single batch operation
            if (notificationsToCreate.length > 0) {
                await prisma.notification.createMany({
                    data: notificationsToCreate.map(notification => ({
                        message: notification.message,
                        outgoingId: notification.outgoingId,
                        departmentId: notification.departmentId,
                        userId: notification.userId,
                        isRead: false,
                        createdAt: new Date()
                    }))
                });
                console.log(`🔔 Successfully created ${notificationsToCreate.length} notifications in batch`);
            }
        }
        catch (error) {
            console.log('❌ Error creating notifications:', error);
            // Don't throw error to prevent outgoing creation from failing
        }
    }
    static async getAllOutgoing(limit = 30, offset = 0, user) {
        try {
            console.log('🔍 OutgoingService.getAllOutgoing called with:', { limit, offset, user });
            // Build where clause based on user role
            let whereClause = {};
            if (user && user.role === 'other_department' && user.department) {
                // Department users only see letters where 'from' matches their department
                whereClause.from = user.department.id;
                console.log('🏢 Department filter applied:', whereClause);
            }
            else {
                console.log('👑 No filter applied - showing all records');
            }
            // super_admin and rd_department can see all letters (no where clause needed)
            const [records, total] = await Promise.all([
                prisma.outgoing.findMany({
                    where: whereClause,
                    include: {
                        department: true,
                        courierService: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: limit,
                    skip: offset,
                }),
                prisma.outgoing.count({ where: whereClause })
            ]);
            console.log('📊 Database query results:', {
                totalRecords: total,
                returnedRecords: records.length,
                whereClause
            });
            return {
                records,
                total,
                hasMore: offset + limit < total,
                currentPage: Math.floor(offset / limit) + 1,
                totalPages: Math.ceil(total / limit)
            };
        }
        catch (error) {
            console.error('❌ Error in OutgoingService.getAllOutgoing:', error);
            throw new Error(`Failed to fetch outgoing letters: ${error}`);
        }
    }
    static async getOutgoingById(id) {
        try {
            const outgoing = await prisma.outgoing.findUnique({
                where: { id },
                include: {
                    department: true,
                    courierService: true,
                },
            });
            if (!outgoing) {
                throw new Error('Outgoing letter not found');
            }
            return outgoing;
        }
        catch (error) {
            throw new Error(`Failed to fetch outgoing letter: ${error}`);
        }
    }
    static async updateOutgoing(id, data) {
        try {
            const updateData = {
                from: data.from,
                to: data.to,
                priority: data.priority,
                subject: data.subject,
            };
            if (data.image) {
                updateData.image = data.image; // Direct Cloudinary URL from controller
            }
            const outgoing = await prisma.outgoing.update({
                where: { id },
                data: updateData,
                include: {
                    department: true,
                },
            });
            return outgoing;
        }
        catch (error) {
            throw new Error(`Failed to update outgoing letter: ${error}`);
        }
    }
    static async updateOutgoingStatus(id, data) {
        try {
            const outgoing = await prisma.outgoing.update({
                where: { id },
                data: {
                    status: data.status,
                    dispatchedDate: data.dispatchedDate,
                    deliveredDate: data.deliveredDate,
                },
                include: {
                    department: true,
                },
            });
            // Create notification for status update
            await this.createStatusUpdateNotification(outgoing, data.status || 'UNKNOWN');
            return outgoing;
        }
        catch (error) {
            throw new Error(`Failed to update outgoing letter status: ${error}`);
        }
    }
    static async createStatusUpdateNotification(outgoing, newStatus) {
        try {
            const statusMessages = {
                'PENDING_DISPATCH': 'pending dispatch',
                'DISPATCHED': 'handed to courier service',
                'DELIVERED': 'delivered to recipient',
                'RETURNED': 'returned',
            };
            // Get all users in a single query
            const allUsers = await prisma.user.findMany({
                include: { department: true }
            });
            // Prepare batch notification data
            const notificationsToCreate = [];
            // Process users and prepare notification data
            for (const user of allUsers) {
                let shouldNotify = false;
                let message = '';
                if (user.role === prisma_1.Role.super_admin) {
                    // Super admin gets notified about all status updates
                    shouldNotify = true;
                    if (newStatus === 'DISPATCHED') {
                        message = `Letter ${outgoing.qrCode} (${outgoing.subject || 'No subject'}) from ${outgoing.department?.name || 'Unknown Department'} has been handed to courier service for delivery to ${outgoing.to}`;
                    }
                    else {
                        message = `Outgoing letter ${outgoing.qrCode} has been ${statusMessages[newStatus] || newStatus.toLowerCase()}`;
                    }
                }
                else if (user.role === prisma_1.Role.rd_department) {
                    // RD department gets notified about all status updates
                    shouldNotify = true;
                    if (newStatus === 'DISPATCHED') {
                        message = `Letter ${outgoing.qrCode} (${outgoing.subject || 'No subject'}) from ${outgoing.department?.name || 'Unknown Department'} has been handed to courier service for delivery to ${outgoing.to}`;
                    }
                    else {
                        message = `Outgoing letter ${outgoing.qrCode} has been ${statusMessages[newStatus] || newStatus.toLowerCase()}`;
                    }
                }
                else if (user.role === prisma_1.Role.other_department && user.department) {
                    // Other departments only get notified if the letter is from their department
                    if (user.department.id === outgoing.from) {
                        shouldNotify = true;
                        if (newStatus === 'DISPATCHED') {
                            message = `Your letter ${outgoing.qrCode} (${outgoing.subject || 'No subject'}) has been handed to courier service for delivery to ${outgoing.to}`;
                        }
                        else {
                            message = `Your outgoing letter ${outgoing.qrCode} has been ${statusMessages[newStatus] || newStatus.toLowerCase()}`;
                        }
                    }
                }
                if (shouldNotify) {
                    notificationsToCreate.push({
                        message,
                        outgoingId: outgoing.id,
                        departmentId: outgoing.from,
                        userId: user.id,
                        type: 'status_update'
                    });
                }
            }
            // Create all notifications in a single batch operation
            if (notificationsToCreate.length > 0) {
                await prisma.notification.createMany({
                    data: notificationsToCreate.map(notification => ({
                        message: notification.message,
                        outgoingId: notification.outgoingId,
                        departmentId: notification.departmentId,
                        userId: notification.userId,
                        isRead: false,
                        createdAt: new Date()
                    }))
                });
                console.log(`🔔 Created ${notificationsToCreate.length} notifications for ${newStatus} status update`);
            }
        }
        catch (error) {
            console.error('Failed to create status update notification:', error);
        }
    }
    static async deleteOutgoing(id) {
        try {
            const outgoing = await prisma.outgoing.findUnique({
                where: { id },
                include: {
                    department: true,
                },
            });
            if (!outgoing) {
                throw new Error('Outgoing letter not found');
            }
            // Delete from database
            await prisma.outgoing.delete({
                where: { id },
            });
            return outgoing;
        }
        catch (error) {
            throw new Error(`Failed to delete outgoing letter: ${error}`);
        }
    }
    static async getOutgoingByDepartment(departmentId) {
        try {
            const outgoing = await prisma.outgoing.findMany({
                where: {
                    from: departmentId,
                },
                include: {
                    department: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            return outgoing;
        }
        catch (error) {
            throw new Error(`Failed to fetch department outgoing letters: ${error}`);
        }
    }
    static async getOutgoingByQR(qrCode) {
        try {
            const outgoing = await prisma.outgoing.findUnique({
                where: { qrCode },
                include: {
                    department: true,
                },
            });
            if (!outgoing) {
                throw new Error('Outgoing letter not found');
            }
            return outgoing;
        }
        catch (error) {
            throw new Error(`Failed to fetch outgoing letter by QR: ${error}`);
        }
    }
    static async getOutgoingStats() {
        try {
            const [total, pending, dispatched, delivered, returned] = await Promise.all([
                prisma.outgoing.count(),
                prisma.outgoing.count({ where: { status: 'PENDING_DISPATCH' } }),
                prisma.outgoing.count({ where: { status: 'DISPATCHED' } }),
                prisma.outgoing.count({ where: { status: 'DELIVERED' } }),
                prisma.outgoing.count({ where: { status: 'RETURNED' } }),
            ]);
            return {
                total,
                pending,
                dispatched,
                delivered,
                returned,
            };
        }
        catch (error) {
            throw new Error(`Failed to fetch outgoing statistics: ${error}`);
        }
    }
    static async updateStatusByQRCode(qrCode, status) {
        // Find the outgoing letter by QR code first
        const outgoing = await prisma.outgoing.findFirst({
            where: { qrCode },
            include: {
                department: true
            }
        });
        if (!outgoing) {
            throw new Error('Outgoing letter not found with this QR code');
        }
        // Check if status is already the same
        if (outgoing.status === status) {
            return {
                updated: outgoing,
                statusChanged: false,
                message: `Status is already ${status}`
            };
        }
        // Update the status
        const updatedOutgoing = await prisma.outgoing.update({
            where: { id: outgoing.id },
            data: {
                status,
                // Update relevant dates based on status
                ...(status === 'DISPATCHED' && { dispatchedDate: new Date() }),
                ...(status === 'DELIVERED' && { deliveredDate: new Date() })
            },
            include: {
                department: true
            }
        });
        // Create notification for status update only if status actually changed
        await this.createStatusUpdateNotification(updatedOutgoing, status);
        return {
            updated: updatedOutgoing,
            statusChanged: true,
            message: `Status updated successfully to ${status}`
        };
    }
    static async getOutgoingByQRCode(qrCode) {
        return prisma.outgoing.findFirst({
            where: { qrCode },
            include: { department: true },
        });
    }
    static async getCourierTrackingRecords(limit = 30, offset = 0, user) {
        // Build where clause based on user role
        let whereClause = {};
        if (user && user.role === 'other_department' && user.department) {
            // Department users only see letters where 'from' matches their department
            whereClause.from = user.department.id;
        }
        // super_admin and rd_department can see all letters (no where clause needed)
        const [records, total] = await Promise.all([
            prisma.outgoing.findMany({
                where: whereClause,
                include: { department: true },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            prisma.outgoing.count({ where: whereClause })
        ]);
        return {
            records,
            total,
            hasMore: offset + limit < total,
            currentPage: Math.floor(offset / limit) + 1,
            totalPages: Math.ceil(total / limit)
        };
    }
}
exports.OutgoingService = OutgoingService;
