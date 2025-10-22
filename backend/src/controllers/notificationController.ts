import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

export class NotificationController {
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any)?.user?.id as string | undefined;
      if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50
      });

      res.json({ success: true, data: notifications });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any)?.user?.id as string | undefined;
      const id = req.params.id as string;
      if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

      const notif = await prisma.notification.findUnique({ where: { id } });
      if (!notif || notif.userId !== userId) return res.status(404).json({ success: false, error: 'Notification not found' });

      await prisma.notification.update({ where: { id }, data: { isRead: true } });
      res.json({ success: true, message: 'Marked as read' });
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationController();
