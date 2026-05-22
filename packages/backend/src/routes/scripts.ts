import { Router, Response } from 'express';
import { z } from 'zod';
import { ScriptsService } from '../services/scripts.service';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { AuthRequest } from '../types';

function getId(param: string | string[] | undefined): number {
  return parseInt(param as string, 10);
}

const router = Router();
const scriptsService = new ScriptsService();

const createScriptSchema = z.object({
  title: z.string().min(1, 'Título requerido').max(100),
  description: z.string().max(500).optional(),
  language: z.enum(['bash', 'python', 'javascript', 'powershell', 'php', 'go']).default('bash'),
  content: z.string().default(''),
  folderId: z.number().optional(),
  notifyEmails: z.string().optional(),
});

// List scripts
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const folderId = req.query.folderId ? parseInt(req.query.folderId as string) : undefined;
    const search = req.query.search as string | undefined;
    const scripts = await scriptsService.list(req.user!.userId, folderId, search);
    res.json(scripts);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get single script
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const script = await scriptsService.getById(getId(req.params.id), req.user!.userId);
    res.json(script);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

// Create script
router.post('/', authenticate, validate(createScriptSchema), async (req: AuthRequest, res: Response) => {
  try {
    const script = await scriptsService.create({ ...req.body, userId: req.user!.userId });
    res.status(201).json(script);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

const updateScriptSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  language: z.enum(['bash', 'python', 'javascript', 'powershell', 'php', 'go']).optional(),
  content: z.string().optional(),
  folderId: z.number().optional().nullable(),
  isLocked: z.boolean().optional(),
  isProtected: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
  tags: z.string().optional(),
  notifyEmails: z.string().optional(),
});

// Update script
router.patch('/:id', authenticate, validate(updateScriptSchema), async (req: AuthRequest, res: Response) => {
  try {
    const script = await scriptsService.update(getId(req.params.id), req.user!.userId, req.body);
    res.json(script);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete script
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await scriptsService.delete(getId(req.params.id), req.user!.userId);
    res.json({ message: 'Script eliminado' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Execute script
router.post('/:id/execute', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const execution = await scriptsService.execute(getId(req.params.id), req.user!.userId);
    res.json(execution);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get script executions
router.get('/:id/executions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const executions = await scriptsService.getExecutions(
      getId(req.params.id),
      req.user!.userId
    );
    res.json(executions);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
