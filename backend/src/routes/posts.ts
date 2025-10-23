import { Router } from 'express';
import { PostController } from '../controllers/postController';
import { validateRequest, validateQuery } from '../middleware/validation';
import { authenticate, optionalAuth } from '../middleware/auth';
import { createPostRateLimit } from '../middleware/rateLimit';
import { createPostSchema, paginationSchema } from '../utils/validation';

const router = Router();
const postController = new PostController();

// Public routes
router.get('/', 
  optionalAuth,
  validateQuery(paginationSchema),
  postController.getPosts
);

router.get('/trending', 
  postController.getTrendingPosts
);

router.get('/:id', 
  optionalAuth,
  postController.getPostById
);

// Protected routes
router.post('/', 
  authenticate,
  createPostRateLimit,
  validateRequest(createPostSchema),
  postController.createPost
);

router.put('/:id', 
  authenticate,
  postController.updatePost
);

router.delete('/:id', 
  authenticate,
  postController.deletePost
);

router.post('/:id/like', 
  authenticate,
  postController.likePost
);

export default router;