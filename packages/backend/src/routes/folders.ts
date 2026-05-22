import { Router, Response } from 'express';
import { z } from 'zod';
import { FoldersService } from '../services/folders.service';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { AuthRequest } from '../types';

function getId(param: string | string[] | undefined): number {
  return parseInt(param as string, 10);
}

const router = Router();
const foldersService = new FoldersService();

const createFolderSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(50),
  color: z.string().optional(),
  icon: z.string().optional(),
  parentId: z.number().optional(),
});

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const folders = await foldersService.list(req.user!.userId);
    res.json(folders);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/tree', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tree = await foldersService.tree(req.user!.userId);
    res.json(tree);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const folder = await foldersService.getById(getId(req.params.id), req.user!.userId);
    res.json(folder);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post('/', authenticate, validate(createFolderSchema), async (req: AuthRequest, res: Response) => {
  try {
    const folder = await foldersService.create({ ...req.body, userId: req.user!.userId });
    res.status(201).json(folder);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.patch('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const folder = await foldersService.update(getId(req.params.id), req.user!.userId, req.body);
    res.json(folder);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await foldersService.delete(getId(req.params.id), req.user!.userId);
    res.json({ message: 'Carpeta eliminada' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
