
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
  image?: Express.Multer.File;
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
        const uploadResult = await cloudinary.uploader.upload(data.image.path, {
          folder: 'outgoing',
          resource_type: 'auto',
        });
        imageUrl = uploadResult.secure_url;
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
          // Super admin gets notified about all outgoing letters (except when they create it)
          shouldNotify = true;
          message = `New outgoing letter created: ${outgoing.subject || 'No subject'} from ${outgoing.department?.name || 'Unknown Department'} to ${outgoing.to} (QR: ${outgoing.qrCode})`;
          console.log('🔔 Super admin will be notified:', user.username);
        } else if (user.role === Role.rd_department) {
          // RD department gets notified about all outgoing letters (except when they create it)
          shouldNotify = true;
          message = `New outgoing letter dispatched: ${outgoing.subject || 'No subject'} from ${outgoing.department?.name || 'Unknown Department'} to ${outgoing.to} (QR: ${outgoing.qrCode})`;
          console.log('🔔 RD department will be notified:', user.username);
        } else if (user.role === Role.other_department && user.department) {
          // Other departments only get notified if the letter is from their department (except when they create it)
          console.log('🔔 Checking department user:', {
            username: user.username,
            userDepartmentId: user.department.id,
            outgoingFrom: outgoing.from,
            match: user.department.id === outgoing.from
          });
          
          if (user.department.id === outgoing.from) {
            shouldNotify = true;
            message = `New outgoing letter created from your department: ${outgoing.subject || 'No subject'} to ${outgoing.to} (QR: ${outgoing.qrCode})`;
            console.log('🔔 Department user will be notified:', user.username);
          } else {
            console.log('🔔 Department user will NOT be notified (wrong department):', user.username);
          }
        }

        if (shouldNotify) {
          console.log('🔔 Creating notification for user:', user.username);
          await NotificationService.createNotification({
            message,
            outgoingId: outgoing.id,
            departmentId: outgoing.from, // Use outgoing.from as departmentId
            userId: user.id, // Add user ID to create individual notifications
            type: 'outgoing'
          });
          console.log('🔔 Notification created successfully for:', user.username);
        }
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
      throw new Error(`Failed to fetch outgoing letter: ${error}`);
    }
  }

  static async updateOutgoing(id: string, data: any) {
    try {
      if (!id) {
        throw new Error('ID is required for update');
      }

      let imageUrl: string | undefined;

      if (data.image) {
        const uploadResult = await cloudinary.uploader.upload(data.image.path, {
          folder: 'outgoing',
          resource_type: 'auto',
        });
        imageUrl = uploadResult.secure_url;
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
      const updateData: any = {
        status: data.status,
      };

      if (data.status === 'DISPATCHED' && !data.dispatchedDate) {
        updateData.dispatchedDate = new Date();
      }

      if (data.status === 'DELIVERED' && !data.deliveredDate) {
        updateData.deliveredDate = new Date();
      }

      if (data.dispatchedDate) {
        updateData.dispatchedDate = data.dispatchedDate;
      }

      if (data.deliveredDate) {
        updateData.deliveredDate = data.deliveredDate;
      }

      const outgoing = await prisma.outgoing.update({
        where: { id },
        data: updateData,
        include: {
          department: true,
        },
      });

      // Create notification for status change
      if (data.status) {
        await this.createStatusUpdateNotification(outgoing, data.status);
      }

      return outgoing;
    } catch (error) {
      throw new Error(`Failed to update outgoing letter: ${error}`);
    }
  }

  static async createStatusUpdateNotification(outgoing: any, newStatus: string) {
    try {
      const statusMessages = {
        'DISPATCHED': 'Letter has been dispatched',
        'DELIVERED': 'Letter has been delivered',
        'RETURNED': 'Letter has been returned',
      };

      if (statusMessages[newStatus as keyof typeof statusMessages]) {
        await NotificationService.createNotification({
          message: `Outgoing letter ${outgoing.qrCode}: ${statusMessages[newStatus as keyof typeof statusMessages]}`,
          outgoingId: outgoing.id,
          departmentId: outgoing.from,
          type: 'outgoing'
        });
      }
    } catch (error) {
      console.log('❌ Error creating status update notification:', error);
      // Don't throw error to prevent status update from failing
    }
  }

  static async deleteOutgoing(id: string) {
    try {
      // First check if the record exists
      const existingRecord = await prisma.outgoing.findUnique({
        where: { id }
      });

      if (!existingRecord) {
        throw new Error('Record not found');
      }

      // Delete notifications first (if any)
      await prisma.notification.deleteMany({ where: { outgoingId: id } });
      
      // Delete outgoing record
      const outgoing = await prisma.outgoing.delete({
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
        where: { from: departmentId },
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

  static async getOutgoingStats() {
    try {
      const stats = await prisma.outgoing.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      });

      return stats;
    } catch (error) {
      throw new Error(`Failed to fetch outgoing stats: ${error}`);
    }
  }
} 