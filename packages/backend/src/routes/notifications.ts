import { Router, Response } from 'express';
import { z } from 'zod';
import { NotificationService } from '../services/notifications.service';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { AuthRequest } from '../types';

function getId(param: string | string[] | undefined): number {
  return parseInt(param as string, 10);
}

const router = Router();
const notificationService = new NotificationService();

// List notifications for current user
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const offset = parseInt(req.query.offset as string) || 0;
    const result = await notificationService.list(req.user!.userId, limit, offset);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get unread count
router.get('/unread-count', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const count = await notificationService.getUnreadCount(req.user!.userId);
    res.json({ count });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Mark a single notification as read
router.patch('/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const notification = await notificationService.markAsRead(
      getId(req.params.id),
      req.user!.userId
    );
    res.json(notification);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

// Mark all notifications as read
router.post('/mark-all-read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await notificationService.markAllAsRead(req.user!.userId);
    res.json({ message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a notification
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await notificationService.delete(getId(req.params.id), req.user!.userId);
    res.json({ message: 'Notificación eliminada' });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

export default router;
