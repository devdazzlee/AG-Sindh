"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const express_1 = require("express");
const outgoingController_1 = require("../../controllers/outgoingController/outgoingController");
const auth_1 = require("../../middlewares/auth");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
// Multer config for image upload (matching incoming pattern)
const storage = multer_1.default.memoryStorage();
exports.upload = (0, multer_1.default)({ storage });
// Apply authentication to all routes
router.use(auth_1.requireAuth);
// Create outgoing letter (with file upload)
router.post('/', exports.upload.single('image'), outgoingController_1.OutgoingController.createOutgoing);
// Get all outgoing letters
router.get('/', outgoingController_1.OutgoingController.getAll);
// Get courier tracking records
router.get('/courier/tracking', outgoingController_1.OutgoingController.getCourierTrackingRecords);
// Get outgoing statistics
router.get('/stats/overview', outgoingController_1.OutgoingController.getOutgoingStats);
// Get outgoing by QR code (must come before /:id)
router.get('/qr/:qrCode', outgoingController_1.OutgoingController.getByQRCode);
// Get outgoing letter by ID
router.get('/:id', outgoingController_1.OutgoingController.getOutgoingById);
// Update outgoing letter (with file upload)
router.put('/:id', exports.upload.single('image'), outgoingController_1.OutgoingController.updateOutgoing);
// Delete outgoing letter
router.delete('/:id', outgoingController_1.OutgoingController.deleteOutgoing);
// Update outgoing letter status
router.patch('/:id/status', outgoingController_1.OutgoingController.updateOutgoingStatus);
// Update status by QR code (courier tracking)
router.patch('/qr/:qrCode/status', outgoingController_1.OutgoingController.updateStatusByQRCode);
exports.default = router;
