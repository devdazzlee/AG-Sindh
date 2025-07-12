import { Request, Response } from "express"
import { LetterTrackingService } from "../../services/letterTrackingService/letterTrackingService"
import { AuthenticatedRequest } from "../../middlewares/auth"
import { PrismaClient } from "../../../generated/prisma"

const letterTrackingService = new LetterTrackingService()
const prisma = new PrismaClient()

export class LetterTrackingController {
  async getAllTrackingRecords(req: AuthenticatedRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 30
      const statusFilter = req.query.status as string
      const typeFilter = req.query.type as string
      const priorityFilter = req.query.priority as string

      // Get user's department information if they are a department user
      let userWithDepartment: any = req.user;
      if (req.user && req.user.role === 'other_department') {
        const userWithDept = await prisma.user.findUnique({
          where: { id: req.user.id },
          include: { department: true }
        });
        userWithDepartment = userWithDept || req.user;
      }

      const result = await letterTrackingService.getAllTrackingRecords(
        page,
        limit,
        statusFilter,
        typeFilter,
        priorityFilter,
        userWithDepartment
      )

      res.status(200).json({
        success: true,
        message: "Tracking records fetched successfully",
        data: result,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch tracking records",
        error: error.message,
      })
    }
  }

  async updateLetterStatus(req: Request, res: Response) {
    try {
      const { recordId, recordType, newStatus } = req.body
      const userId = (req as any).user?.id

      if (!recordId || !recordType || !newStatus) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: recordId, recordType, newStatus",
        })
      }

      if (!["incoming", "outgoing"].includes(recordType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid record type. Must be 'incoming' or 'outgoing'",
        })
      }

      const validStatuses = {
        incoming: ["pending", "in progress", "collected", "archived"],
        outgoing: ["pending", "handled to courier", "delivered", "returned"],
      }

      if (!validStatuses[recordType as keyof typeof validStatuses].includes(newStatus.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: `Invalid status for ${recordType} record`,
        })
      }

      const updatedRecord = await letterTrackingService.updateLetterStatus(
        recordId,
        recordType as "incoming" | "outgoing",
        newStatus,
        userId
      )

      res.status(200).json({
        success: true,
        message: "Letter status updated successfully",
        data: updatedRecord,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to update letter status",
        error: error.message,
      })
    }
  }

  async getTrackingRecordById(req: Request, res: Response) {
    try {
      const { recordId, recordType } = req.params

      if (!recordId || !recordType) {
        return res.status(400).json({
          success: false,
          message: "Missing required parameters: recordId, recordType",
        })
      }

      if (!["incoming", "outgoing"].includes(recordType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid record type. Must be 'incoming' or 'outgoing'",
        })
      }

      const record = await letterTrackingService.getTrackingRecordById(
        recordId,
        recordType as "incoming" | "outgoing"
      )

      res.status(200).json({
        success: true,
        message: "Tracking record fetched successfully",
        data: record,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch tracking record",
        error: error.message,
      })
    }
  }

  async getTrackingStats(req: Request, res: Response) {
    try {
      const stats = await letterTrackingService.getTrackingStats()

      res.status(200).json({
        success: true,
        message: "Tracking statistics fetched successfully",
        data: stats,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch tracking statistics",
        error: error.message,
      })
    }
  }
} 