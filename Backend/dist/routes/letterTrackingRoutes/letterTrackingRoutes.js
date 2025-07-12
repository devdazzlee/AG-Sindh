"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const letterTrackingController_1 = require("../../controllers/letterTrackingController/letterTrackingController");
const auth_1 = require("../../middlewares/auth");
const router = express_1.default.Router();
const letterTrackingController = new letterTrackingController_1.LetterTrackingController();
// Get all tracking records with pagination and filters
router.get("/", auth_1.requireAuth, letterTrackingController.getAllTrackingRecords.bind(letterTrackingController));
// Update letter status
router.put("/status", auth_1.requireAuth, letterTrackingController.updateLetterStatus.bind(letterTrackingController));
// Get tracking statistics - MUST come before parameterized routes
router.get("/stats/overview", auth_1.requireAuth, letterTrackingController.getTrackingStats.bind(letterTrackingController));
// Get specific tracking record by ID - MUST come after specific routes
router.get("/:recordType/:recordId", auth_1.requireAuth, letterTrackingController.getTrackingRecordById.bind(letterTrackingController));
exports.default = router;
