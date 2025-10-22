import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiResponse } from '../types';

export class ChatController {
  async getUserChatRooms(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

      const rooms = await prisma.chatRoom.findMany({
        where: {
          members: {
            some: { userId }
          }
        },
        include: {
          members: { include: { user: { select: { id: true, username: true, avatar: true } } } },
          messages: { orderBy: { createdAt: 'desc' }, take: 20 }
        }
      });

      const response: ApiResponse = { success: true, data: rooms };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getChatMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const roomId = req.params.id;
      if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

      // Проверить, что пользователь является членом комнаты
      const membership = await prisma.chatRoomMember.findFirst({ where: { chatRoomId: roomId, userId } });
      if (!membership) return res.status(403).json({ success: false, error: 'Access denied to this chat' });

      const messages = await prisma.chatMessage.findMany({
        where: { chatRoomId: roomId },
        include: { sender: { select: { id: true, username: true, avatar: true } } },
        orderBy: { createdAt: 'asc' }
      });

      res.json({ success: true, data: messages });
    } catch (error) {
      next(error);
    }
  }

  async createChatRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

      const { name, type = 'DIRECT', memberIds = [], heroId } = req.body;

      const room = await prisma.chatRoom.create({
        data: {
          name,
          type,
          heroId: heroId || null,
          isPrivate: true,
          members: {
            create: [
              { userId },
              ...memberIds.filter((id: string) => id !== userId).map((id: string) => ({ userId: id }))
            ]
          }
        },
        include: { members: true }
      });

      res.status(201).json({ success: true, data: room });
    } catch (error) {
      next(error);
    }
  }
}

export default new ChatController();
