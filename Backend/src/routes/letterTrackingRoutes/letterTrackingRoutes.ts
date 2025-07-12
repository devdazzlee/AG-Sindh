import express from "express"
import { LetterTrackingController } from "../../controllers/letterTrackingController/letterTrackingController"
import { requireAuth } from "../../middlewares/auth"

const router = express.Router()
const letterTrackingController = new LetterTrackingController()

// Get all tracking records with pagination and filters
router.get("/", requireAuth, letterTrackingController.getAllTrackingRecords.bind(letterTrackingController))

// Update letter status
router.put("/status", requireAuth, letterTrackingController.updateLetterStatus.bind(letterTrackingController))

// Get tracking statistics - MUST come before parameterized routes
router.get("/stats/overview", requireAuth, letterTrackingController.getTrackingStats.bind(letterTrackingController))

// Get specific tracking record by ID - MUST come after specific routes
router.get("/:recordType/:recordId", requireAuth, letterTrackingController.getTrackingRecordById.bind(letterTrackingController))

export default router 