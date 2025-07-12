
import { PrismaClient, OutgoingStatus, Role } from '../../../generated/prisma';
import cloudinary from '../../lib/cloudinary';
import { NotificationService } from '../notificationService/notificationService';

const prisma = new PrismaClient();

export interface CreateOutgoingData {
  from: string;
  to: string;
  priority: string;
  subject?: string;
  qrCode: string;
  image?: Express.Multer.File | string; // Can be file object or Cloudinary URL
}

export interface UpdateOutgoingData {
  status?: 'PENDING_DISPATCH' | 'DISPATCHED' | 'DELIVERED' | 'RETURNED';
  dispatchedDate?: Date;
  deliveredDate?: Date;
}

export class OutgoingService {
  static async createOutgoing(data: CreateOutgoingData, creatorUserId?: string) {
    try {
      let imageUrl: string | undefined;

      if (data.image) {
        // If it's already a Cloudinary URL (string), use it directly
        if (typeof data.image === 'string') {
          imageUrl = data.image;
        } else {
          // If it's a file object, upload to Cloudinary
          const uploadResult = await cloudinary.uploader.upload(data.image.path, {
            folder: 'outgoing',
            resource_type: 'auto',
          });
          imageUrl = uploadResult.secure_url;
        }
      }

      const outgoing = await prisma.outgoing.create({
        data: {
          from: data.from,
          to: data.to,
          priority: data.priority,
          subject: data.subject,
          qrCode: data.qrCode,
          image: imageUrl,
          status: 'PENDING_DISPATCH',
        },
        include: {
          department: true,
        },
      });

      // Create notifications for the department
      await this.createNotificationsForOutgoing(outgoing, creatorUserId);

      return outgoing;
    } catch (error) {
      throw new Error(`Failed to create outgoing letter: ${error}`);
    }
  }

  static async createNotificationsForOutgoing(outgoing: any, creatorUserId?: string) {
    try {
      console.log('🔔 Creating notifications for outgoing:', {
        outgoingId: outgoing.id,
        from: outgoing.from,
        to: outgoing.to,
        departmentName: outgoing.department?.name,
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
          // Super admin gets notified about all outgoing letters (except when they create it)
          shouldNotify = true;
          message = `New outgoing letter created: ${outgoing.subject || 'No subject'} from ${outgoing.department?.name || 'Unknown Department'} to ${outgoing.to} (QR: ${outgoing.qrCode})`;
        } else if (user.role === Role.rd_department) {
          // RD department gets notified about all outgoing letters (except when they create it)
          shouldNotify = true;
          message = `New outgoing letter dispatched: ${outgoing.subject || 'No subject'} from ${outgoing.department?.name || 'Unknown Department'} to ${outgoing.to} (QR: ${outgoing.qrCode})`;
        } else if (user.role === Role.other_department && user.department) {
          // Other departments only get notified if the letter is from their department (except when they create it)
          if (user.department.id === outgoing.from) {
            shouldNotify = true;
            message = `New outgoing letter created from your department: ${outgoing.subject || 'No subject'} to ${outgoing.to} (QR: ${outgoing.qrCode})`;
          }
        }

        if (shouldNotify) {
          notificationsToCreate.push({
            message,
            outgoingId: outgoing.id,
            departmentId: outgoing.from,
            userId: user.id,
            type: 'outgoing'
          });
        }
      }

      // Create all notifications in a single batch operation
      if (notificationsToCreate.length > 0) {
        await prisma.notification.createMany({
          data: notificationsToCreate.map(notification => ({
            message: notification.message,
            outgoingId: notification.outgoingId,
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
      // Don't throw error to prevent outgoing creation from failing
    }
  }

  static async getAllOutgoing(limit: number = 30, offset: number = 0) {
    try {
      const [records, total] = await Promise.all([
        prisma.outgoing.findMany({
          include: {
            department: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: limit,
          skip: offset,
        }),
        prisma.outgoing.count()
      ]);

      return {
        records,
        total,
        hasMore: offset + limit < total,
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new Error(`Failed to fetch outgoing letters: ${error}`);
    }
  }

  static async getOutgoingById(id: string) {
    try {
      const outgoing = await prisma.outgoing.findUnique({
        where: { id },
        include: {
          department: true,
        },
      });

      if (!outgoing) {
        throw new Error('Outgoing letter not found');
      }

      return outgoing;
    } catch (error) {
      throw new Error(`Failed to fetch outgoing letter: ${error}`);
    }
  }

  static async updateOutgoing(id: string, data: any) {
    try {
      let imageUrl: string | undefined;

      if (data.image) {
        // If it's already a Cloudinary URL (string), use it directly
        if (typeof data.image === 'string') {
          imageUrl = data.image;
        } else if (data.image.path && data.image.path.startsWith('http')) {
          // If it's a Cloudinary URL in the path property
          imageUrl = data.image.path;
        } else {
          // If it's a file object, upload to Cloudinary
          const uploadResult = await cloudinary.uploader.upload(data.image.path, {
            folder: 'outgoing',
            resource_type: 'auto',
          });
          imageUrl = uploadResult.secure_url;
        }
      }

      const updateData: any = {
        from: data.from,
        to: data.to,
        priority: data.priority,
        subject: data.subject,
      };

      if (imageUrl) {
        updateData.image = imageUrl;
      }

      const outgoing = await prisma.outgoing.update({
        where: { id },
        data: updateData,
        include: {
          department: true,
        },
      });

      return outgoing;
    } catch (error) {
      throw new Error(`Failed to update outgoing letter: ${error}`);
    }
  }

  static async updateOutgoingStatus(id: string, data: UpdateOutgoingData) {
    try {
      const outgoing = await prisma.outgoing.update({
        where: { id },
        data: {
          status: data.status,
          dispatchedDate: data.dispatchedDate,
          deliveredDate: data.deliveredDate,
        },
        include: {
          department: true,
        },
      });

      // Create notification for status update
      await this.createStatusUpdateNotification(outgoing, data.status || 'UNKNOWN');

      return outgoing;
    } catch (error) {
      throw new Error(`Failed to update outgoing letter status: ${error}`);
    }
  }

  static async createStatusUpdateNotification(outgoing: any, newStatus: string) {
    try {
      const statusMessages = {
        'PENDING_DISPATCH': 'pending dispatch',
        'DISPATCHED': 'dispatched',
        'DELIVERED': 'delivered',
        'RETURNED': 'returned',
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
          message = `Outgoing letter ${outgoing.qrCode} has been ${statusMessages[newStatus as keyof typeof statusMessages] || newStatus.toLowerCase()}`;
        } else if (user.role === Role.rd_department) {
          // RD department gets notified about all status updates
          shouldNotify = true;
          message = `Outgoing letter ${outgoing.qrCode} has been ${statusMessages[newStatus as keyof typeof statusMessages] || newStatus.toLowerCase()}`;
        } else if (user.role === Role.other_department && user.department) {
          // Other departments only get notified if the letter is from their department
          if (user.department.id === outgoing.from) {
            shouldNotify = true;
            message = `Outgoing letter ${outgoing.qrCode} has been ${statusMessages[newStatus as keyof typeof statusMessages] || newStatus.toLowerCase()}`;
          }
        }

        if (shouldNotify) {
          notificationsToCreate.push({
            message,
            outgoingId: outgoing.id,
            departmentId: outgoing.from,
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
            outgoingId: notification.outgoingId,
            departmentId: notification.departmentId,
            userId: notification.userId,
            isRead: false,
            createdAt: new Date()
          }))
        });
      }
    } catch (error) {
      console.error('Failed to create status update notification:', error);
    }
  }

  static async deleteOutgoing(id: string) {
    try {
      const outgoing = await prisma.outgoing.findUnique({
        where: { id },
        include: {
          department: true,
        },
      });

      if (!outgoing) {
        throw new Error('Outgoing letter not found');
      }

      // Delete from database
      await prisma.outgoing.delete({
        where: { id },
      });

      return outgoing;
    } catch (error) {
      throw new Error(`Failed to delete outgoing letter: ${error}`);
    }
  }

  static async getOutgoingByDepartment(departmentId: string) {
    try {
      const outgoing = await prisma.outgoing.findMany({
        where: {
          from: departmentId,
        },
        include: {
          department: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return outgoing;
    } catch (error) {
      throw new Error(`Failed to fetch department outgoing letters: ${error}`);
    }
  }

  static async getOutgoingByQR(qrCode: string) {
    try {
      const outgoing = await prisma.outgoing.findUnique({
        where: { qrCode },
        include: {
          department: true,
        },
      });

      if (!outgoing) {
        throw new Error('Outgoing letter not found');
      }

      return outgoing;
    } catch (error) {
      throw new Error(`Failed to fetch outgoing letter by QR: ${error}`);
    }
  }

  static async getOutgoingStats() {
    try {
      const [total, pending, dispatched, delivered, returned] = await Promise.all([
        prisma.outgoing.count(),
        prisma.outgoing.count({ where: { status: 'PENDING_DISPATCH' } }),
        prisma.outgoing.count({ where: { status: 'DISPATCHED' } }),
        prisma.outgoing.count({ where: { status: 'DELIVERED' } }),
        prisma.outgoing.count({ where: { status: 'RETURNED' } }),
      ]);

      return {
        total,
        pending,
        dispatched,
        delivered,
        returned,
      };
    } catch (error) {
      throw new Error(`Failed to fetch outgoing statistics: ${error}`);
    }
  }
} 