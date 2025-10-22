import { Router } from 'express';
import chatController from '../controllers/chatController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, chatController.getUserChatRooms);
router.get('/:id/messages', authenticate, chatController.getChatMessages);
router.post('/', authenticate, chatController.createChatRoom);

export default router;
