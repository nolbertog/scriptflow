import { prisma } from './prisma';

export class NotificationService {
  async list(userId: number, limit = 50, offset = 0) {
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    return { notifications, total, unreadCount };
  }

  async create(data: {
    userId: number;
    type: string;
    title: string;
    message?: string;
  }) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
      },
    });
  }

  async markAsRead(id: number, userId: number) {
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) throw new Error('Notificación no encontrada');

    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: number) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async delete(id: number, userId: number) {
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) throw new Error('Notificación no encontrada');

    await prisma.notification.delete({ where: { id } });
  }

  async getUnreadCount(userId: number) {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  }
}
