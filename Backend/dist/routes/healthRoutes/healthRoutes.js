"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const healthController_1 = require("../../controllers/healthController/healthController");
const router = (0, express_1.Router)();
// Versioned health check endpoint
router.get('/health', healthController_1.HealthController.healthCheck);
// Root endpoint
router.get('/', healthController_1.HealthController.root);
exports.default = router;
