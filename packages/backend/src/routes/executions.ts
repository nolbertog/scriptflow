import { Router, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';
import { prisma } from '../services/prisma';

function getId(param: string | string[] | undefined): number {
  return parseInt(param as string, 10);
}

const router = Router();

// List all executions for the current user
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const offset = parseInt(req.query.offset as string) || 0;

    const where: any = { userId };

    if (status && ['pending', 'running', 'completed', 'failed', 'cancelled'].includes(status)) {
      where.status = status;
    }

    if (search) {
      where.script = {
        title: { contains: search },
      };
    }

    const [executions, total] = await Promise.all([
      prisma.execution.findMany({
        where,
        include: {
          script: { select: { id: true, title: true, language: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.execution.count({ where }),
    ]);

    res.json({ executions, total, limit, offset });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get a single execution by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const execution = await prisma.execution.findFirst({
      where: { id: getId(req.params.id), userId: req.user!.userId },
      include: {
        script: { select: { id: true, title: true, language: true } },
      },
    });
    if (!execution) {
      return res.status(404).json({ error: 'Ejecución no encontrada' });
    }
    res.json(execution);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
