import { PrismaClient, IncomingStatus, Role } from '../../../generated/prisma';
import { NotificationService } from '../notificationService/notificationService';

const prisma = new PrismaClient();

export class IncomingService {
  static async createIncoming(data: any, creatorUserId?: string) {
    // Create incoming record
    const createData: any = {
      ...data,
      status: data.status || 'RECEIVED',
    };
    if (data.receivedDate) {
      createData.receivedDate = new Date(data.receivedDate);
    } else {
      delete createData.receivedDate; // Let DB default
    }
    const incoming = await prisma.incoming.create({
      data: createData,
      include: {
        department: true
      }
    });

    // Create notifications for relevant users (excluding the creator)
    await this.createNotificationsForIncoming(incoming, creatorUserId);

    return incoming;
  }

  static async createNotificationsForIncoming(incoming: any, creatorUserId?: string) {
    try {
      console.log('🔔 Creating notifications for incoming:', {
        incomingId: incoming.id,
        to: incoming.to,
        departmentName: incoming.department?.name,
        creatorUserId
      });

      // Get the creator's role to determine who should be notified
      let creatorRole: Role | null = null;
      if (creatorUserId) {
        const creator = await prisma.user.findUnique({
          where: { id: creatorUserId },
          include: { department: true }
        });
        creatorRole = creator?.role || null;
      }

      // Get all users in a single query
      const allUsers = await prisma.user.findMany({
        include: { department: true }
      });

      // Prepare batch notification data
      const notificationsToCreate: any[] = [];

      // Process users and prepare notification data
      for (const user of allUsers) {
        // Skip the creator
        if (creatorUserId && user.id === creatorUserId) {
          continue;
        }

        let shouldNotify = false;
        let message = '';

        if (user.role === Role.super_admin) {
          // Super admin gets notified about all incoming letters (except when they create it)
          shouldNotify = true;
          message = `New incoming letter created: ${incoming.subject || 'No subject'} for ${incoming.department?.name || 'Unknown Department'} (QR: ${incoming.qrCode})`;
        } else if (user.role === Role.rd_department) {
          // RD department gets notified about all incoming letters (except when they create it)
          shouldNotify = true;
          message = `New incoming letter received: ${incoming.subject || 'No subject'} for ${incoming.department?.name || 'Unknown Department'} (QR: ${incoming.qrCode})`;
        } else if (user.role === Role.other_department && user.department) {
          // Other departments only get notified if the letter is for their department (except when they create it)
          if (user.department.id === incoming.to) {
            shouldNotify = true;
            message = `New incoming letter received for your department: ${incoming.subject || 'No subject'} (QR: ${incoming.qrCode})`;
          }
        }

        if (shouldNotify) {
          notificationsToCreate.push({
            message,
            incomingId: incoming.id,
            departmentId: incoming.to,
            userId: user.id,
            type: 'incoming'
          });
        }
      }

      // Create all notifications in a single batch operation
      if (notificationsToCreate.length > 0) {
        await prisma.notification.createMany({
          data: notificationsToCreate.map(notification => ({
            message: notification.message,
            incomingId: notification.incomingId,
            departmentId: notification.departmentId,
            userId: notification.userId,
            isRead: false,
            createdAt: new Date()
          }))
        });
        
        console.log(`🔔 Successfully created ${notificationsToCreate.length} notifications in batch`);
      }

    } catch (error) {
      console.log('❌ Error creating notifications:', error);
      // Don't throw error to prevent incoming creation from failing
    }
  }

  static async getAllIncoming(limit: number = 30, offset: number = 0, user?: { id: string; username: string; role: string; department?: { id: string } }) {
    // Build where clause based on user role
    let whereClause: any = {};
    
    if (user && user.role === 'other_department' && user.department) {
      // Department users only see letters where 'to' matches their department
      whereClause.to = user.department.id;
    }
    // super_admin and rd_department can see all letters (no where clause needed)
    
    const [records, total] = await Promise.all([
      prisma.incoming.findMany({
        where: whereClause,
        include: { department: true, notifications: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.incoming.count({ where: whereClause })
    ]);
    
    return {
      records,
      total,
      hasMore: offset + limit < total,
      currentPage: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getIncomingById(id: string) {
    return prisma.incoming.findUnique({
      where: { id },
      include: { department: true, notifications: true },
    });
  }

  static async getIncomingByQRCode(qrCode: string) {
    return prisma.incoming.findFirst({
      where: { qrCode },
      include: { department: true },
    });
  }

  static async updateIncoming(id: string, data: any) {
    return prisma.incoming.update({
      where: { id },
      data: {
        ...data,
        receivedDate: data.receivedDate ? new Date(data.receivedDate) : undefined,
      },
    });
  }

  static async deleteIncoming(id: string) {
    // First check if the record exists
    const existingRecord = await prisma.incoming.findUnique({
      where: { id }
    });

    if (!existingRecord) {
      throw new Error('Record not found');
    }

    // Delete notifications first (if any)
    await prisma.notification.deleteMany({ where: { incomingId: id } });
    // Delete incoming record
    return prisma.incoming.delete({ where: { id } });
  }

  static async updateStatus(id: string, status: IncomingStatus) {
    const updatedIncoming = await prisma.incoming.update({
      where: { id },
      data: { status },
      include: {
        department: true
      }
    });

    // Create notification for status update
    await this.createStatusUpdateNotification(updatedIncoming, status);

    return updatedIncoming;
  }

  static async updateStatusByQRCode(qrCode: string, status: IncomingStatus) {
    // Find the incoming letter by QR code first
    const incoming = await prisma.incoming.findFirst({
      where: { qrCode },
      include: {
        department: true
      }
    });

    if (!incoming) {
      throw new Error('Incoming letter not found with this QR code');
    }

    // Check if status is already the same
    if (incoming.status === status) {
      return {
        updated: incoming,
        statusChanged: false,
        message: `Status is already ${status}`
      };
    }

    // Update the status
    const updatedIncoming = await prisma.incoming.update({
      where: { id: incoming.id },
      data: { status },
      include: {
        department: true
      }
    });

    // Create notification for status update only if status actually changed
    await this.createStatusUpdateNotification(updatedIncoming, status);

    return {
      updated: updatedIncoming,
      statusChanged: true,
      message: `Status updated successfully to ${status}`
    };
  }

  static async createStatusUpdateNotification(incoming: any, newStatus: IncomingStatus) {
    try {
      const statusMessages = {
        'RECEIVED': 'Letter has been received',
        'TRANSFERRED': 'Letter has been transferred',
        'COLLECTED': 'Letter has been collected',
        'ARCHIVED': 'Letter has been archived'
      };

      // Get all users in a single query
      const allUsers = await prisma.user.findMany({
        include: { department: true }
      });

      // Prepare batch notification data
      const notificationsToCreate: any[] = [];

      // Process users and prepare notification data
      for (const user of allUsers) {
        let shouldNotify = false;
        let message = '';

        if (user.role === Role.super_admin) {
          // Super admin gets notified about all status updates
          shouldNotify = true;
          message = `Status updated to ${newStatus}: ${incoming.subject || 'No subject'} for ${incoming.department?.name || 'Unknown Department'} (QR: ${incoming.qrCode})`;
        } else if (user.role === Role.rd_department) {
          // RD department gets notified about all status updates
          shouldNotify = true;
          message = `Status updated to ${newStatus}: ${incoming.subject || 'No subject'} for ${incoming.department?.name || 'Unknown Department'} (QR: ${incoming.qrCode})`;
        } else if (user.role === Role.other_department && user.department) {
          // Other departments only get notified if the letter is for their department
          if (user.department.id === incoming.to) {
            shouldNotify = true;
            message = `${statusMessages[newStatus]}: ${incoming.subject || 'No subject'} (QR: ${incoming.qrCode})`;
          }
        }

        if (shouldNotify) {
          notificationsToCreate.push({
            message,
            incomingId: incoming.id,
            departmentId: incoming.to,
            userId: user.id,
            type: 'status_update'
          });
        }
      }

      // Create all notifications in a single batch operation
      if (notificationsToCreate.length > 0) {
        await prisma.notification.createMany({
          data: notificationsToCreate.map(notification => ({
            message: notification.message,
            incomingId: notification.incomingId,
            departmentId: notification.departmentId,
            userId: notification.userId,
            isRead: false,
            createdAt: new Date()
          }))
        });
      }
    } catch (error) {
      console.log('Error creating status update notification:', error);
    }
  }
} 