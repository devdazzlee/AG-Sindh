import { PrismaClient, Role } from '../../../generated/prisma';

const prisma = new PrismaClient();

export class NotificationService {
  static async createNotification(data: {
    message: string;
    incomingId?: string;
    outgoingId?: string;
    departmentId?: string | null;
    userId?: string | null;
    type?: 'incoming' | 'outgoing' | 'status_update' | 'system';
  }) {
    return prisma.notification.create({
      data: {
        message: data.message,
        incomingId: data.incomingId || null,
        outgoingId: data.outgoingId || null,
        departmentId: data.departmentId || null,
        userId: data.userId || null,
      },
      include: {
        incoming: {
          include: {
            department: true
          }
        },
        outgoing: {
          include: {
            department: true
          }
        },
        department: true,
        user: true
      }
    });
  }

  static async getNotificationsByUser(userId: string, limit: number = 50, offset: number = 0) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { department: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get notifications specifically for this user
    const whereClause = { userId: userId };

    console.log(`🔍 User ${user.username} (${user.role}) - department: ${user.department?.name || 'none'}`);
    console.log(`🔍 Where clause:`, whereClause);

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        include: {
          incoming: {
            include: {
              department: true
            }
          },
          outgoing: {
            include: {
              department: true
            }
          },
          department: true,
          user: true
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({ where: whereClause })
    ]);

    console.log(`🔍 Found ${notifications.length} notifications for user ${user.username}`);

    return {
      notifications,
      total,
      hasMore: offset + limit < total,
      currentPage: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async markAsRead(notificationId: string, userId: string) {
    // User can only mark their own notifications as read
    return prisma.notification.update({
      where: { 
        id: notificationId,
        userId: userId
      },
      data: { isRead: true }
    });
  }

  static async markAllAsRead(userId: string) {
    // User can only mark their own notifications as read
    return prisma.notification.updateMany({
      where: { 
        isRead: false,
        userId: userId
      },
      data: { isRead: true }
    });
  }

  static async getUnreadCount(userId: string) {
    // User only sees their own unread notifications
    return prisma.notification.count({ 
      where: { 
        isRead: false,
        userId: userId
      } 
    });
  }

  static async deleteNotification(notificationId: string, userId: string) {
    // User can only delete their own notifications
    return prisma.notification.delete({
      where: {
        id: notificationId,
        userId: userId
      }
    });
  }
} 