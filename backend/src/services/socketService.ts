import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifyToken } from '../utils/jwt';
import prisma from '../config/database';
import { UserProfile } from '../types';

export class SocketService {
  private io: Server;

  constructor(server: HTTPServer) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const payload = verifyToken(token);
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            avatar: true,
            isActive: true
          }
        });

        if (!user || !user.isActive) {
          return next(new Error('User not found or inactive'));
        }

        socket.data.user = user as UserProfile;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const user = socket.data.user;
      
      // Присоединяем пользователя к его персональной комнате
      socket.join(`user:${user.id}`);

      // Чат
      socket.on('chat:join', (roomId: string) => {
        socket.join(`chat:${roomId}`);
      });

      socket.on('chat:leave', (roomId: string) => {
        socket.leave(`chat:${roomId}`);
      });

      socket.on('chat:message', async (data: {
        roomId: string;
        message: string;
      }) => {
        const message = await prisma.chatMessage.create({
          data: {
            content: data.message,
            chatRoomId: data.roomId,
            senderId: user.id
          },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          }
        });

        this.io.to(`chat:${data.roomId}`).emit('chat:message', message);
        // Отправить уведомления всем участникам комнаты, кроме отправителя
        const members = await prisma.chatRoomMember.findMany({ where: { chatRoomId: data.roomId } });
        for (const m of members) {
          if (m.userId === user.id) continue;
          await this.sendChatNotification(m.userId, data.roomId, {
            senderId: user.id,
            senderName: user.username,
            content: data.message
          });
        }
      });

      // Уведомления
      socket.on('notifications:read', async (notificationId: string) => {
        await prisma.notification.update({
          where: { id: notificationId },
          data: { isRead: true }
        });
      });

      // Статус онлайн/оффлайн
      socket.on('presence:update', async (status: 'online' | 'away' | 'offline') => {
        const mapped = status.toUpperCase(); // ONLINE | AWAY | OFFLINE
        await prisma.user.update({
          where: { id: user.id },
          data: { presenceStatus: mapped as any }
        });
        
        this.io.emit('presence:updated', {
          userId: user.id,
          status: mapped
        });
      });

      socket.on('disconnect', async () => {
        await prisma.user.update({
          where: { id: user.id },
          data: { presenceStatus: 'OFFLINE' }
        });
        
        this.io.emit('presence:updated', {
          userId: user.id,
          status: 'OFFLINE'
        });
      });
    });
  }

  // Методы для отправки уведомлений
  public async sendNotification(userId: string, notification: {
    title: string;
    message: string;
    type: string;
    data?: any;
  }) {
    const newNotification = await prisma.notification.create({
      data: {
        userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        data: notification.data || {}
      }
    });

    this.io.to(`user:${userId}`).emit('notification:new', newNotification);
  }

  public async sendChatNotification(userId: string, chatRoomId: string, message: {
    senderId: string;
    senderName: string;
    content: string;
  }) {
    await this.sendNotification(userId, {
      title: 'Новое сообщение',
      message: `${message.senderName}: ${message.content}`,
      type: 'CHAT',
      data: {
        chatRoomId,
        senderId: message.senderId
      }
    });
  }

  // Методы для трансляции событий
  public broadcastPostUpdate(postId: string, data: any) {
    this.io.emit('post:updated', { postId, ...data });
  }

  public broadcastCommentUpdate(postId: string, data: any) {
    this.io.emit('comment:updated', { postId, ...data });
  }

  public broadcastHeroUpdate(heroId: string, data: any) {
    this.io.emit('hero:updated', { heroId, ...data });
  }
}