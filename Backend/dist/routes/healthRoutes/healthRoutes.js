"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const healthController_1 = require("../../controllers/healthController/healthController");
const router = (0, express_1.Router)();
// Health check endpoint
router.get('/health', healthController_1.HealthController.healthCheck);
// Root endpoint
router.get('/', healthController_1.HealthController.root);
// Database test endpoint
router.get('/db-test', async (req, res) => {
    try {
        const { PrismaClient } = require('../../../generated/prisma');
        const prisma = new PrismaClient();
        // Test database connection
        await prisma.$connect();
        const result = await prisma.$queryRaw `SELECT 1 as test`;
        await prisma.$disconnect();
        res.json({
            success: true,
            message: 'Database connection successful',
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: error.message
        });
    }
});
// Cleanup duplicate notifications endpoint
router.post('/cleanup-notifications', async (req, res) => {
    try {
        const { PrismaClient } = require('../../../generated/prisma');
        const prisma = new PrismaClient();
        // Get all notifications grouped by incomingId and departmentId
        const notifications = await prisma.notification.findMany({
            include: {
                incoming: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
        // Group notifications by incomingId and departmentId
        const groupedNotifications = new Map();
        notifications.forEach((notification) => {
            const key = `${notification.incomingId}-${notification.departmentId || 'null'}`;
            if (!groupedNotifications.has(key)) {
                groupedNotifications.set(key, []);
            }
            groupedNotifications.get(key).push(notification);
        });
        // Keep only the first notification from each group and delete the rest
        let deletedCount = 0;
        for (const [key, notificationGroup] of groupedNotifications) {
            if (notificationGroup.length > 1) {
                // Keep the first one, delete the rest
                const toDelete = notificationGroup.slice(1);
                const idsToDelete = toDelete.map((n) => n.id);
                await prisma.notification.deleteMany({
                    where: {
                        id: {
                            in: idsToDelete
                        }
                    }
                });
                deletedCount += toDelete.length;
            }
        }
        // Also clean up any notifications that don't have the correct departmentId
        // This removes notifications that were created with the old logic
        const allNotifications = await prisma.notification.findMany({
            include: {
                incoming: {
                    include: {
                        department: true
                    }
                }
            }
        });
        let invalidNotifications = 0;
        for (const notification of allNotifications) {
            // If notification has departmentId but the incoming letter is for a different department
            // AND it's not a special identifier
            if (notification.departmentId &&
                notification.departmentId !== 'RD_DEPARTMENT' &&
                notification.departmentId !== 'SUPER_ADMIN' &&
                notification.incoming?.department?.id !== notification.departmentId) {
                await prisma.notification.delete({
                    where: { id: notification.id }
                });
                invalidNotifications++;
            }
        }
        // Also remove any notifications with special identifiers that might be causing issues
        let specialNotifications = 0;
        const specialNotificationsToDelete = await prisma.notification.findMany({
            where: {
                OR: [
                    { departmentId: 'RD_DEPARTMENT' },
                    { departmentId: 'SUPER_ADMIN' }
                ]
            }
        });
        for (const notification of specialNotificationsToDelete) {
            await prisma.notification.delete({
                where: { id: notification.id }
            });
            specialNotifications++;
        }
        await prisma.$disconnect();
        res.json({
            success: true,
            message: `Cleaned up ${deletedCount} duplicate notifications, ${invalidNotifications} invalid notifications, and ${specialNotifications} special notifications`,
            deletedCount,
            invalidNotifications,
            specialNotifications
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to cleanup notifications',
            error: error.message
        });
    }
});
exports.default = router;
