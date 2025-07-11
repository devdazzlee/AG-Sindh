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
        departmentId: incoming.departmentId,
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
        console.log('🔔 Creator info:', {
          id: creator?.id,
          role: creator?.role,
          department: creator?.department?.name
        });
      }

      // Get all users
      const allUsers = await prisma.user.findMany({
        include: { department: true }
      });

      console.log('🔔 All users found:', allUsers.map(u => ({
        id: u.id,
        username: u.username,
        role: u.role,
        department: u.department?.name
      })));

      // Create notifications for relevant users only (excluding the creator)
      for (const user of allUsers) {
        // Skip the creator
        if (creatorUserId && user.id === creatorUserId) {
          console.log('🔔 Skipping creator:', user.username);
          continue;
        }

        let shouldNotify = false;
        let message = '';

        if (user.role === Role.super_admin) {
          // Super admin gets notified about all incoming letters (except when they create it)
          shouldNotify = true;
          message = `New incoming letter created: ${incoming.subject || 'No subject'} for ${incoming.department?.name || 'Unknown Department'} (QR: ${incoming.qrCode})`;
          console.log('🔔 Super admin will be notified:', user.username);
        } else if (user.role === Role.rd_department) {
          // RD department gets notified about all incoming letters (except when they create it)
          shouldNotify = true;
          message = `New incoming letter received: ${incoming.subject || 'No subject'} for ${incoming.department?.name || 'Unknown Department'} (QR: ${incoming.qrCode})`;
          console.log('🔔 RD department will be notified:', user.username);
        } else if (user.role === Role.other_department && user.department) {
          // Other departments only get notified if the letter is for their department (except when they create it)
          console.log('🔔 Checking department user:', {
            username: user.username,
            userDepartmentId: user.department.id,
            incomingTo: incoming.to,
            match: user.department.id === incoming.to
          });
          
          if (user.department.id === incoming.to) {
            shouldNotify = true;
            message = `New incoming letter received for your department: ${incoming.subject || 'No subject'} (QR: ${incoming.qrCode})`;
            console.log('🔔 Department user will be notified:', user.username);
          } else {
            console.log('🔔 Department user will NOT be notified (wrong department):', user.username);
          }
        }

        if (shouldNotify) {
          console.log('🔔 Creating notification for user:', user.username);
          await NotificationService.createNotification({
            message,
            incomingId: incoming.id,
            departmentId: incoming.to, // Use incoming.to as departmentId
            userId: user.id, // Add user ID to create individual notifications
            type: 'incoming'
          });
          console.log('🔔 Notification created successfully for:', user.username);
        }
      }
    } catch (error) {
      console.error('❌ Error creating notifications:', error);
      // Don't throw error to prevent incoming creation from failing
    }
  }

  static async getAllIncoming(limit: number = 30, offset: number = 0) {
    const [records, total] = await Promise.all([
      prisma.incoming.findMany({
        include: { department: true, notifications: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.incoming.count()
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

  static async createStatusUpdateNotification(incoming: any, newStatus: IncomingStatus) {
    try {
      const statusMessages = {
        'RECEIVED': 'Letter has been received',
        'TRANSFERRED': 'Letter has been transferred',
        'COLLECTED': 'Letter has been collected',
        'ARCHIVED': 'Letter has been archived'
      };

      // Get all users
      const allUsers = await prisma.user.findMany({
        include: { department: true }
      });

      // Create notifications for relevant users only
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
          await NotificationService.createNotification({
            message,
            incomingId: incoming.id,
            departmentId: incoming.to, // Use incoming.to as departmentId
            userId: user.id, // Add user ID to create individual notifications
            type: 'status_update'
          });
        }
      }
    } catch (error) {
      console.error('Error creating status update notification:', error);
    }
  }
} 