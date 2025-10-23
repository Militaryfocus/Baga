import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validateRequest } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { authRateLimit } from '../middleware/rateLimit';
import { registerSchema, loginSchema } from '../utils/validation';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', 
  authRateLimit,
  validateRequest(registerSchema),
  authController.register
);

router.post('/login', 
  authRateLimit,
  validateRequest(loginSchema),
  authController.login
);

// Protected routes
router.get('/profile', 
  authenticate,
  authController.getProfile
);

router.put('/profile', 
  authenticate,
  authController.updateProfile
);

router.put('/change-password', 
  authenticate,
  authController.changePassword
);

router.post('/logout', 
  authenticate,
  authController.logout
);

export default router;