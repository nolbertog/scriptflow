import { Router, Response } from 'express';
import { z } from 'zod';
import { CronService } from '../services/cron.service';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { AuthRequest } from '../types';

function getId(param: string | string[] | undefined): number {
  return parseInt(param as string, 10);
}

const router = Router();
const cronService = new CronService();

const createSchema = z.object({
  scriptId: z.number(),
  expression: z.string().min(1, 'Expresión cron requerida'),
  description: z.string().max(500).optional(),
  timezone: z.string().optional(),
  retryCount: z.number().min(0).max(10).optional(),
});

const updateSchema = z.object({
  expression: z.string().optional(),
  description: z.string().max(500).optional(),
  timezone: z.string().optional(),
  isActive: z.boolean().optional(),
  retryCount: z.number().min(0).max(10).optional(),
});

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const jobs = await cronService.list(req.user!.userId);
    res.json(jobs);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const job = await cronService.getById(getId(req.params.id), req.user!.userId);
    res.json(job);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post('/', authenticate, validate(createSchema), async (req: AuthRequest, res: Response) => {
  try {
    const job = await cronService.create({ ...req.body, userId: req.user!.userId });
    res.status(201).json(job);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.patch('/:id', authenticate, validate(updateSchema), async (req: AuthRequest, res: Response) => {
  try {
    const job = await cronService.update(getId(req.params.id), req.user!.userId, req.body);
    res.json(job);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await cronService.delete(getId(req.params.id), req.user!.userId);
    res.json({ message: 'Cron job eliminado' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
