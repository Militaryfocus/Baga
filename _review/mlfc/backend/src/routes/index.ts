import { Router } from 'express';
import authRoutes from './auth';
import postRoutes from './posts';
import heroRoutes from './heroes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
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

export default router;