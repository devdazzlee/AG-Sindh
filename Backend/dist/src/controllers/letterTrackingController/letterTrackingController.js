"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LetterTrackingController = void 0;
const letterTrackingService_1 = require("../../services/letterTrackingService/letterTrackingService");
const prisma_1 = require("../../../generated/prisma");
const letterTrackingService = new letterTrackingService_1.LetterTrackingService();
const prisma = new prisma_1.PrismaClient();
class LetterTrackingController {
    async getAllTrackingRecords(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 30;
            const statusFilter = req.query.status;
            const typeFilter = req.query.type;
            const priorityFilter = req.query.priority;
            // Get user's department information if they are a department user
            let userWithDepartment = req.user;
            if (req.user && req.user.role === 'other_department') {
                const userWithDept = await prisma.user.findUnique({
                    where: { id: req.user.id },
                    include: { department: true }
                });
                userWithDepartment = userWithDept || req.user;
            }
            const result = await letterTrackingService.getAllTrackingRecords(page, limit, statusFilter, typeFilter, priorityFilter, userWithDepartment);
            res.status(200).json({
                success: true,
                message: "Tracking records fetched successfully",
                data: result,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch tracking records",
                error: error.message,
            });
        }
    }
    async updateLetterStatus(req, res) {
        try {
            const { recordId, recordType, newStatus } = req.body;
            const userId = req.user?.id;
            if (!recordId || !recordType || !newStatus) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required fields: recordId, recordType, newStatus",
                });
            }
            if (!["incoming", "outgoing"].includes(recordType)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid record type. Must be 'incoming' or 'outgoing'",
                });
            }
            const validStatuses = {
                incoming: ["pending", "in progress", "collected", "archived"],
                outgoing: ["pending", "handled to courier", "delivered", "returned"],
            };
            if (!validStatuses[recordType].includes(newStatus.toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid status for ${recordType} record`,
                });
            }
            const updatedRecord = await letterTrackingService.updateLetterStatus(recordId, recordType, newStatus, userId);
            res.status(200).json({
                success: true,
                message: "Letter status updated successfully",
                data: updatedRecord,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to update letter status",
                error: error.message,
            });
        }
    }
    async getTrackingRecordById(req, res) {
        try {
            const { recordId, recordType } = req.params;
            if (!recordId || !recordType) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required parameters: recordId, recordType",
                });
            }
            if (!["incoming", "outgoing"].includes(recordType)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid record type. Must be 'incoming' or 'outgoing'",
                });
            }
            const record = await letterTrackingService.getTrackingRecordById(recordId, recordType);
            res.status(200).json({
                success: true,
                message: "Tracking record fetched successfully",
                data: record,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch tracking record",
                error: error.message,
            });
        }
    }
    async getTrackingStats(req, res) {
        try {
            const stats = await letterTrackingService.getTrackingStats();
            res.status(200).json({
                success: true,
                message: "Tracking statistics fetched successfully",
                data: stats,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch tracking statistics",
                error: error.message,
            });
        }
    }
}
exports.LetterTrackingController = LetterTrackingController;
