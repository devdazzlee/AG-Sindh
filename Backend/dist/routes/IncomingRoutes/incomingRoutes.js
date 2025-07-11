"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const incomingController_1 = require("../../controllers/IncomingController/incomingController");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
// Apply authentication to all routes
router.use(auth_1.requireAuth);
// Create incoming (with image upload)
router.post('/', incomingController_1.upload.single('image'), incomingController_1.IncomingController.create);
// Get all incoming
router.get('/', incomingController_1.IncomingController.getAll);
// Get incoming by id
router.get('/:id', incomingController_1.IncomingController.getById);
// Update incoming (with image upload) - Super admin only
router.put('/:id', incomingController_1.requireSuperAdmin, incomingController_1.upload.single('image'), incomingController_1.IncomingController.update);
// Delete incoming - Super admin only
router.delete('/:id', incomingController_1.requireSuperAdmin, incomingController_1.IncomingController.delete);
// Update status
router.patch('/:id/status', incomingController_1.IncomingController.updateStatus);
exports.default = router;
