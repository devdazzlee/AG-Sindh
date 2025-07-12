"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSuperAdmin = exports.IncomingController = exports.upload = void 0;
const incomingService_1 = require("../../services/IncomingService/incomingService");
const incomingValidation_1 = require("../../validation/IncomingValidation/incomingValidation");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const cloudinary_1 = __importDefault(require("../../lib/cloudinary"));
const fs_1 = __importDefault(require("fs"));
const prisma_1 = require("../../../generated/prisma");
const prisma = new prisma_1.PrismaClient();
// Role-based authorization middleware
const requireSuperAdmin = (req, res, next) => {
    console.log('Authorization check:', {
        hasUser: !!req.user,
        userRole: req.user?.role,
        expectedRole: 'super_admin',
        isMatch: req.user?.role === 'super_admin'
    });
    if (!req.user || req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Access denied. Super admin privileges required.' });
    }
    next();
};
exports.requireSuperAdmin = requireSuperAdmin;
// Multer config for image upload
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.join(__dirname, '../../../uploads/incoming'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});
exports.upload = (0, multer_1.default)({ storage });
class IncomingController {
    static async create(req, res, next) {
        try {
            const mReq = req;
            const data = { ...req.body };
            // Only update image if a new file is uploaded
            if (mReq.file) {
                // Upload to Cloudinary
                const result = await cloudinary_1.default.uploader.upload(mReq.file.path, {
                    folder: 'incoming_letters',
                });
                data.image = result.secure_url;
                // Delete local file
                fs_1.default.unlinkSync(mReq.file.path);
            }
            // If no new file, don't include image in the update data (preserve existing)
            const parsed = incomingValidation_1.incomingCreateSchema.safeParse(data);
            if (!parsed.success) {
                return res.status(400).json({ error: parsed.error.errors });
            }
            // Pass the creator's user ID to exclude them from notifications
            const creatorUserId = req.user?.id;
            const incoming = await incomingService_1.IncomingService.createIncoming(parsed.data, creatorUserId);
            res.status(201).json({ incoming });
        }
        catch (err) {
            next(err);
        }
    }
    static async getAll(req, res, next) {
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
            const result = await incomingService_1.IncomingService.getAllIncoming(limit, offset, userWithDepartment);
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    }
    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const record = await incomingService_1.IncomingService.getIncomingById(id);
            if (!record)
                return res.status(404).json({ error: 'Not found' });
            res.json({ record });
        }
        catch (err) {
            next(err);
        }
    }
    static async getByQRCode(req, res, next) {
        try {
            const { qrCode } = req.params;
            const record = await incomingService_1.IncomingService.getIncomingByQRCode(qrCode);
            if (!record)
                return res.status(404).json({ error: 'Letter not found with this QR code' });
            res.json({ record });
        }
        catch (err) {
            next(err);
        }
    }
    static async update(req, res, next) {
        try {
            const mReq = req;
            const data = { ...req.body };
            // Only update image if a new file is uploaded
            if (mReq.file) {
                // Upload to Cloudinary
                const result = await cloudinary_1.default.uploader.upload(mReq.file.path, {
                    folder: 'incoming_letters',
                });
                data.image = result.secure_url;
                // Delete local file
                fs_1.default.unlinkSync(mReq.file.path);
            }
            // If no new file, don't include image in the update data (preserve existing)
            const parsed = incomingValidation_1.incomingUpdateSchema.safeParse(data);
            if (!parsed.success) {
                return res.status(400).json({ error: parsed.error.errors });
            }
            const { id } = req.params;
            const updated = await incomingService_1.IncomingService.updateIncoming(id, parsed.data);
            res.json({ updated });
        }
        catch (err) {
            next(err);
        }
    }
    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            try {
                await incomingService_1.IncomingService.deleteIncoming(id);
                res.status(204).send();
            }
            catch (error) {
                if (error.message === 'Record not found') {
                    return res.status(404).json({ error: 'Record not found' });
                }
                throw error;
            }
        }
        catch (err) {
            next(err);
        }
    }
    static async updateStatus(req, res, next) {
        try {
            const { id } = req.params;
            const parsed = incomingValidation_1.incomingStatusSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: parsed.error.errors });
            }
            const updated = await incomingService_1.IncomingService.updateStatus(id, parsed.data.status);
            res.json({ updated });
        }
        catch (err) {
            next(err);
        }
    }
    static async updateStatusByQRCode(req, res, next) {
        try {
            const { qrCode } = req.params;
            const parsed = incomingValidation_1.incomingStatusSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: parsed.error.errors });
            }
            const result = await incomingService_1.IncomingService.updateStatusByQRCode(qrCode, parsed.data.status);
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
            if (err.message === 'Incoming letter not found with this QR code') {
                return res.status(404).json({
                    success: false,
                    error: 'Incoming letter not found with this QR code'
                });
            }
            next(err);
        }
    }
}
exports.IncomingController = IncomingController;
