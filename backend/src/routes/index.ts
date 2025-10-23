import { Router } from 'express';
import authRoutes from './auth';
import postRoutes from './posts';
import heroRoutes from './heroes';
import chatRoutes from './chats';
import notificationRoutes from './notifications';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
router.use('/heroes', heroRoutes);
router.use('/chats', chatRoutes);
router.use('/notifications', notificationRoutes);

export default router;