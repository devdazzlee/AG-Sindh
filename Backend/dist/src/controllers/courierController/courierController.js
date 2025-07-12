"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourierController = void 0;
const courierValidation_1 = require("../../validation/courierValidation/courierValidation");
const courierService_1 = require("../../services/courierService/courierService");
const zod_1 = require("zod");
const statusSchema = zod_1.z.object({ status: zod_1.z.enum(['active', 'inactive']) });
class CourierController {
    static async create(req, res) {
        try {
            const parsed = courierValidation_1.courierSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: parsed.error.issues.map(issue => issue.message).join(', ') });
            }
            const courier = await courierService_1.CourierService.createCourier(parsed.data);
            return res.status(201).json({ success: true, courier });
        }
        catch (err) {
            // Check for Prisma unique constraint error by code property
            if (err?.code === 'P2002') {
                return res.status(400).json({ success: false, error: 'Service Code already exists. Please use a unique code.' });
            }
            return res.status(400).json({ success: false, error: err.message });
        }
    }
    static async getAll(req, res) {
        try {
            const couriers = await courierService_1.CourierService.getAllCouriers();
            return res.status(200).json({ success: true, couriers });
        }
        catch (err) {
            return res.status(400).json({ success: false, error: err.message });
        }
    }
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const courier = await courierService_1.CourierService.getCourierById(id);
            if (!courier)
                return res.status(404).json({ success: false, error: 'Courier not found' });
            return res.status(200).json({ success: true, courier });
        }
        catch (err) {
            return res.status(400).json({ success: false, error: err.message });
        }
    }
    static async updateById(req, res) {
        try {
            const { id } = req.params;
            const parsed = courierValidation_1.courierSchema.partial().safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: parsed.error.issues.map(issue => issue.message).join(', ') });
            }
            const updated = await courierService_1.CourierService.updateCourierById(id, parsed.data);
            return res.status(200).json({ success: true, courier: updated });
        }
        catch (err) {
            return res.status(400).json({ success: false, error: err.message });
        }
    }
    static async deleteById(req, res) {
        try {
            const { id } = req.params;
            await courierService_1.CourierService.deleteCourierById(id);
            return res.status(200).json({ success: true });
        }
        catch (err) {
            return res.status(400).json({ success: false, error: err.message });
        }
    }
    static async setStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const parsed = statusSchema.safeParse({ status });
            if (!parsed.success) {
                return res.status(400).json({ error: parsed.error.issues.map(issue => issue.message).join(', ') });
            }
            const updated = await courierService_1.CourierService.updateCourierById(id, { status });
            return res.status(200).json({ success: true, courier: updated });
        }
        catch (err) {
            return res.status(400).json({ success: false, error: err.message });
        }
    }
}
exports.CourierController = CourierController;
