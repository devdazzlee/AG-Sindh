import { PrismaClient } from "../../../generated/prisma"
import cloudinary from "../../lib/cloudinary"

const prisma = new PrismaClient()

export interface LetterTrackingRecord {
  id: string
  qrCode: string
  type: "incoming" | "outgoing"
  from: string
  to: string
  subject?: string
  priority: string
  status: string
  createdAt: string
  assignedDate: string
  collectedDate?: string
  dispatchedDate?: string
  deliveredDate?: string
  image?: string
  department?: {
    id: string
    name: string
    code: string
  }
}

export class LetterTrackingService {

  async getAllTrackingRecords(
    page: number = 1,
    limit: number = 30,
    statusFilter?: string,
    typeFilter?: string,
    priorityFilter?: string
  ) {
    try {
      const offset = (page - 1) * limit

      // Build where conditions for incoming records
      const incomingWhere: any = {}
      if (statusFilter && statusFilter !== "all") {
        // Map frontend status to database enum
        const mappedStatus = this.mapStatusToIncoming(statusFilter)
        incomingWhere.status = mappedStatus
      }
      if (priorityFilter && priorityFilter !== "all") {
        incomingWhere.priority = priorityFilter.toUpperCase()
      }

      // Build where conditions for outgoing records
      const outgoingWhere: any = {}
      if (statusFilter && statusFilter !== "all") {
        // Map frontend status to database enum
        const mappedStatus = this.mapStatusToOutgoing(statusFilter)
        outgoingWhere.status = mappedStatus
      }
      if (priorityFilter && priorityFilter !== "all") {
        outgoingWhere.priority = priorityFilter.toUpperCase()
      }

      // Fetch incoming records
      const incomingRecords = await prisma.incoming.findMany({
        where: incomingWhere,
        include: {
          department: true,
        },
        skip: offset,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      })

      // Fetch outgoing records
      const outgoingRecords = await prisma.outgoing.findMany({
        where: outgoingWhere,
        include: {
          department: true,
        },
        skip: offset,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      })

      // Transform incoming records
      const transformedIncoming = incomingRecords.map((record) => ({
        id: record.id,
        qrCode: record.qrCode,
        type: "incoming" as const,
        from: record.from,
        to: record.department?.name || "Unknown Department",
        subject: record.subject,
        priority: record.priority,
        status: this.mapIncomingStatus(record.status),
        createdAt: record.createdAt.toISOString(),
        assignedDate: record.receivedDate.toISOString(),
        collectedDate: record.status === "COLLECTED" ? record.createdAt.toISOString() : undefined,
        image: record.image,
        department: record.department,
      }))

      // Transform outgoing records
      const transformedOutgoing = outgoingRecords.map((record) => ({
        id: record.id,
        qrCode: record.qrCode,
        type: "outgoing" as const,
        from: record.department?.name || "Unknown Department",
        to: record.to,
        subject: record.subject,
        priority: record.priority,
        status: this.mapOutgoingStatus(record.status),
        createdAt: record.createdAt.toISOString(),
        assignedDate: record.createdAt.toISOString(),
        dispatchedDate: record.dispatchedDate?.toISOString(),
        deliveredDate: record.deliveredDate?.toISOString(),
        image: record.image,
        department: record.department,
      }))

      // Combine and sort by creation date
      let combinedRecords = [...transformedIncoming, ...transformedOutgoing]
      
      // Apply type filter if specified
      if (typeFilter && typeFilter !== "all") {
        combinedRecords = combinedRecords.filter(record => record.type === typeFilter)
      }

      // Sort by creation date (newest first)
      combinedRecords.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      // Get total counts for pagination
      const totalIncoming = await prisma.incoming.count({ where: incomingWhere })
      const totalOutgoing = await prisma.outgoing.count({ where: outgoingWhere })
      const total = totalIncoming + totalOutgoing

      return {
        records: combinedRecords,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          total,
          hasMore: page * limit < total,
        },
      }
    } catch (error) {
      throw new Error(`Failed to fetch tracking records: ${error}`)
    }
  }

  async updateLetterStatus(
    recordId: string,
    recordType: "incoming" | "outgoing",
    newStatus: string,
    userId?: string
  ) {
    try {
      let updatedRecord

      if (recordType === "incoming") {
        const mappedStatus = this.mapStatusToIncoming(newStatus)
        updatedRecord = await prisma.incoming.update({
          where: { id: recordId },
          data: {
            status: mappedStatus as any,
          },
          include: {
            department: true,
          },
        })

        // Create batch notification for status update
        await this.createBatchStatusNotification(updatedRecord, 'incoming', mappedStatus, userId)
      } else {
        const mappedStatus = this.mapStatusToOutgoing(newStatus)
        const updateData: any = {
          status: mappedStatus,
        }

        // Update specific dates based on status
        if (mappedStatus === "DISPATCHED") {
          updateData.dispatchedDate = new Date()
        } else if (mappedStatus === "DELIVERED") {
          updateData.deliveredDate = new Date()
        }

        updatedRecord = await prisma.outgoing.update({
          where: { id: recordId },
          data: updateData,
          include: {
            department: true,
          },
        })

        // Create batch notification for status update
        await this.createBatchStatusNotification(updatedRecord, 'outgoing', mappedStatus, userId)
      }

      return updatedRecord
    } catch (error) {
      throw new Error(`Failed to update letter status: ${error}`)
    }
  }

  async getTrackingRecordById(recordId: string, recordType: "incoming" | "outgoing") {
    try {
      if (recordType === "incoming") {
        const record = await prisma.incoming.findUnique({
          where: { id: recordId },
          include: {
            department: true,
          },
        })

        if (!record) {
          throw new Error("Incoming record not found")
        }

        return {
          id: record.id,
          qrCode: record.qrCode,
          type: "incoming" as const,
          from: record.from,
          to: record.department?.name || "Unknown Department",
          subject: record.subject,
          description: record.description,
          filing: record.filing,
          priority: record.priority,
          status: this.mapIncomingStatus(record.status),
          createdAt: record.createdAt.toISOString(),
          assignedDate: record.receivedDate.toISOString(),
          collectedDate: record.status === "COLLECTED" ? record.createdAt.toISOString() : undefined,
          image: record.image,
          department: record.department,
        }
      } else {
        const record = await prisma.outgoing.findUnique({
          where: { id: recordId },
          include: {
            department: true,
          },
        })

        if (!record) {
          throw new Error("Outgoing record not found")
        }

        return {
          id: record.id,
          qrCode: record.qrCode,
          type: "outgoing" as const,
          from: record.department?.name || "Unknown Department",
          to: record.to,
          subject: record.subject,
          priority: record.priority,
          status: this.mapOutgoingStatus(record.status),
          createdAt: record.createdAt.toISOString(),
          assignedDate: record.createdAt.toISOString(),
          dispatchedDate: record.dispatchedDate?.toISOString(),
          deliveredDate: record.deliveredDate?.toISOString(),
          image: record.image,
          department: record.department,
        }
      }
    } catch (error) {
      throw new Error(`Failed to fetch tracking record: ${error}`)
    }
  }

  async getTrackingStats() {
    try {
      // Get counts for different statuses
      const incomingStats = await Promise.all([
        prisma.incoming.count({ where: { status: "RECEIVED" } }),
        prisma.incoming.count({ where: { status: "TRANSFERRED" } }),
        prisma.incoming.count({ where: { status: "COLLECTED" } }),
        prisma.incoming.count({ where: { status: "ARCHIVED" } }),
      ])

      const outgoingStats = await Promise.all([
        prisma.outgoing.count({ where: { status: "PENDING_DISPATCH" } }),
        prisma.outgoing.count({ where: { status: "DISPATCHED" } }),
        prisma.outgoing.count({ where: { status: "DELIVERED" } }),
        prisma.outgoing.count({ where: { status: "RETURNED" } }),
      ])

      return {
        incoming: {
          pending: incomingStats[0],
          inProgress: incomingStats[1],
          collected: incomingStats[2],
          archived: incomingStats[3],
          total: incomingStats.reduce((a, b) => a + b, 0),
        },
        outgoing: {
          pending: outgoingStats[0],
          handledToCourier: outgoingStats[1],
          delivered: outgoingStats[2],
          returned: outgoingStats[3],
          total: outgoingStats.reduce((a, b) => a + b, 0),
        },
        total: incomingStats.reduce((a, b) => a + b, 0) + outgoingStats.reduce((a, b) => a + b, 0),
      }
    } catch (error) {
      throw new Error(`Failed to fetch tracking statistics: ${error}`)
    }
  }

  private mapIncomingStatus(status: string): string {
    switch (status) {
      case "RECEIVED":
        return "Pending"
      case "TRANSFERRED":
        return "In Progress"
      case "COLLECTED":
        return "Collected"
      case "ARCHIVED":
        return "Archived"
      default:
        return status
    }
  }

  private mapOutgoingStatus(status: string): string {
    switch (status) {
      case "PENDING_DISPATCH":
        return "Pending"
      case "DISPATCHED":
        return "Handled to Courier"
      case "DELIVERED":
        return "Delivered"
      case "RETURNED":
        return "Returned"
      default:
        return status
    }
  }

  private mapStatusToIncoming(status: string): string {
    switch (status.toLowerCase()) {
      case "pending":
        return "RECEIVED"
      case "in progress":
        return "TRANSFERRED"
      case "collected":
        return "COLLECTED"
      case "archived":
        return "ARCHIVED"
      default:
        return status.toUpperCase()
    }
  }

  private mapStatusToOutgoing(status: string): string {
    switch (status.toLowerCase()) {
      case "pending":
        return "PENDING_DISPATCH"
      case "handled to courier":
        return "DISPATCHED"
      case "delivered":
        return "DELIVERED"
      case "returned":
        return "RETURNED"
      default:
        return status.toUpperCase()
    }
  }

  private async createBatchStatusNotification(
    record: any,
    recordType: 'incoming' | 'outgoing',
    newStatus: string,
    userId?: string
  ) {
    try {
      // Get all users in a single query
      const allUsers = await prisma.user.findMany({
        include: { department: true }
      })

      // Prepare batch notification data
      const notificationsToCreate: any[] = []

      // Process users and prepare notification data
      for (const user of allUsers) {
        let shouldNotify = false
        let message = ''

        if (user.role === 'super_admin') {
          shouldNotify = true
          message = `${recordType === 'incoming' ? 'Incoming' : 'Outgoing'} letter ${record.qrCode} status updated to ${newStatus}`
        } else if (user.role === 'rd_department') {
          shouldNotify = true
          message = `${recordType === 'incoming' ? 'Incoming' : 'Outgoing'} letter ${record.qrCode} status updated to ${newStatus}`
        } else if (user.role === 'other_department' && user.department) {
          const departmentField = recordType === 'incoming' ? record.to : record.from
          if (user.department.id === departmentField) {
            shouldNotify = true
            message = `${recordType === 'incoming' ? 'Incoming' : 'Outgoing'} letter ${record.qrCode} status updated to ${newStatus}`
          }
        }

        if (shouldNotify) {
          notificationsToCreate.push({
            message,
            [recordType === 'incoming' ? 'incomingId' : 'outgoingId']: record.id,
            departmentId: recordType === 'incoming' ? record.to : record.from,
            userId: user.id,
            isRead: false,
            createdAt: new Date()
          })
        }
      }

      // Create all notifications in a single batch operation
      if (notificationsToCreate.length > 0) {
        await prisma.notification.createMany({
          data: notificationsToCreate
        })
      }
    } catch (error) {
      console.error('Failed to create batch status notification:', error)
    }
  }
} 