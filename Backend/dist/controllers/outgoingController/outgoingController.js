"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutgoingController = void 0;
exports.requireSuperAdmin = requireSuperAdmin;
const outgoingService_1 = require("../../services/outgoingService/outgoingService");
const outgoingValidation_1 = require("../../validation/outgoingValidation/outgoingValidation");
const cloudinary_1 = __importDefault(require("../../lib/cloudinary"));
const fs_1 = __importDefault(require("fs"));
const outgoingValidation_2 = require("../../validation/outgoingValidation/outgoingValidation");
const prisma_1 = require("../../../generated/prisma");
const prisma = new prisma_1.PrismaClient();
class OutgoingController {
    static async createOutgoing(req, res) {
        try {
            const validationResult = (0, outgoingValidation_1.validateOutgoingData)(req.body);
            if (!validationResult.success) {
                return res.status(400).json({
                    success: false,
                    error: validationResult.error,
                });
            }
            const { from, to, priority, subject, qrCode, courierServiceId } = req.body;
            let imageUrl;
            // If file is uploaded, upload to Cloudinary and delete local file
            if (req.file) {
                // Upload to Cloudinary
                const result = await cloudinary_1.default.uploader.upload(req.file.path, {
                    folder: 'outgoing_letters',
                });
                imageUrl = result.secure_url;
                // Delete local file
                fs_1.default.unlinkSync(req.file.path);
            }
            const outgoing = await outgoingService_1.OutgoingService.createOutgoing({
                from,
                to,
                priority,
                subject,
                qrCode,
                image: imageUrl,
                courierServiceId,
            }, req.user?.id);
            res.status(201).json({
                success: true,
                data: outgoing,
            });
        }
        catch (error) {
            console.error('Error creating outgoing:', error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
    static async getAll(req, res, next) {
        try {
            console.log('🔍 Outgoing getAll called with user:', req.user);
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 30;
            const offset = (page - 1) * limit;
            console.log('📄 Pagination params:', { page, limit, offset });
            // Get user's department information if they are a department user
            let userWithDepartment = req.user;
            if (req.user && req.user.role === 'other_department') {
                const userWithDept = await prisma.user.findUnique({
                    where: { id: req.user.id },
                    include: { department: true }
                });
                userWithDepartment = userWithDept || req.user;
                console.log('🏢 Department user with dept:', userWithDepartment);
            }
            else {
                console.log('👑 Admin/RD user:', userWithDepartment);
            }
            const result = await outgoingService_1.OutgoingService.getAllOutgoing(limit, offset, userWithDepartment);
            console.log('📊 Outgoing result:', {
                totalRecords: result.total,
                returnedRecords: result.records.length,
                hasMore: result.hasMore
            });
            res.json(result);
        }
        catch (err) {
            console.error('❌ Error in outgoing getAll:', err);
            next(err);
        }
    }
    static async getOutgoingById(req, res) {
        try {
            const { id } = req.params;
            const outgoing = await outgoingService_1.OutgoingService.getOutgoingById(id);
            if (!outgoing) {
                return res.status(404).json({
                    success: false,
                    error: 'Outgoing letter not found',
                });
            }
            res.json({
                success: true,
                data: outgoing,
            });
        }
        catch (error) {
            console.error('Error fetching outgoing by ID:', error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
    static async updateOutgoing(req, res) {
        try {
            const { id } = req.params;
            const { from, to, priority, subject } = req.body;
            let imageUrl;
            // If file is uploaded, upload to Cloudinary and delete local file
            if (req.file) {
                // Upload to Cloudinary
                const result = await cloudinary_1.default.uploader.upload(req.file.path, {
                    folder: 'outgoing_letters',
                });
                imageUrl = result.secure_url;
                // Delete local file
                fs_1.default.unlinkSync(req.file.path);
            }
            const updateData = {
                from,
                to,
                priority,
                subject,
            };
            if (imageUrl) {
                updateData.image = imageUrl;
            }
            const updated = await outgoingService_1.OutgoingService.updateOutgoing(id, updateData);
            res.json({
                success: true,
                data: updated,
            });
        }
        catch (error) {
            console.error('Error updating outgoing:', error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
    static async deleteOutgoing(req, res) {
        try {
            const { id } = req.params;
            await outgoingService_1.OutgoingService.deleteOutgoing(id);
            res.json({
                success: true,
                message: 'Outgoing letter deleted successfully',
            });
        }
        catch (error) {
            console.error('Error deleting outgoing:', error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
    static async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const updated = await outgoingService_1.OutgoingService.updateOutgoingStatus(id, { status });
            res.json({
                success: true,
                data: updated,
            });
        }
        catch (error) {
            console.error('Error updating outgoing status:', error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
    static async updateOutgoingStatus(req, res) {
        try {
            const { id } = req.params;
            const validationResult = (0, outgoingValidation_1.validateOutgoingStatusUpdate)(req.body);
            if (!validationResult.success) {
                return res.status(400).json({
                    success: false,
                    error: validationResult.error,
                });
            }
            const updated = await outgoingService_1.OutgoingService.updateOutgoingStatus(id, {
                ...validationResult.data,
                dispatchedDate: validationResult.data.dispatchedDate ? new Date(validationResult.data.dispatchedDate) : undefined,
                deliveredDate: validationResult.data.deliveredDate ? new Date(validationResult.data.deliveredDate) : undefined
            });
            res.json({
                success: true,
                data: updated,
            });
        }
        catch (error) {
            console.error('Error updating outgoing status:', error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
    static async getOutgoingStats(req, res) {
        try {
            const stats = await outgoingService_1.OutgoingService.getOutgoingStats();
            res.json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            console.error('Error fetching outgoing stats:', error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
    static async updateStatusByQRCode(req, res, next) {
        try {
            const { qrCode } = req.params;
            const parsed = outgoingValidation_2.outgoingStatusSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: parsed.error.errors });
            }
            const result = await outgoingService_1.OutgoingService.updateStatusByQRCode(qrCode, parsed.data.status);
            if (result.statusChanged) {
                res.json({
                    success: true,
                    message: result.message,
                    updated: result.updated,
                    statusChanged: true
                });
            }
            else {
                res.json({
                    success: true,
                    message: result.message,
                    updated: result.updated,
                    statusChanged: false
                });
            }
        }
        catch (err) {
            if (err.message === 'Outgoing letter not found with this QR code') {
                return res.status(404).json({
                    success: false,
                    error: 'Outgoing letter not found with this QR code'
                });
            }
            next(err);
        }
    }
    static async getByQRCode(req, res, next) {
        try {
            const { qrCode } = req.params;
            const record = await outgoingService_1.OutgoingService.getOutgoingByQRCode(qrCode);
            if (!record)
                return res.status(404).json({ error: 'Letter not found with this QR code' });
            res.json({ record });
        }
        catch (err) {
            next(err);
        }
    }
    static async getCourierTrackingRecords(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 30;
            const offset = (page - 1) * limit;
            // Get user's department information if they are a department user
            let userWithDepartment = req.user;
            if (req.user && req.user.role === 'other_department') {
                const userWithDept = await prisma.user.findUnique({
                    where: { id: req.user.id },
                    include: { department: true }
                });
                userWithDepartment = userWithDept || req.user;
            }
            const result = await outgoingService_1.OutgoingService.getCourierTrackingRecords(limit, offset, userWithDepartment);
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.OutgoingController = OutgoingController;
// Role-based authorization middleware
function requireSuperAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'super_admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Super admin privileges required.',
        });
    }
    next();
}
