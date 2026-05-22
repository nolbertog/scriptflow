import { Router, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';
import { prisma } from '../services/prisma';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const [
      totalScripts,
      totalFolders,
      recentExecutions,
      recentScripts,
      recentErrors,
      favoriteScripts,
      totalCronJobs,
    ] = await Promise.all([
      prisma.script.count({ where: { userId } }),
      prisma.folder.count({ where: { userId } }),
      prisma.execution.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { script: { select: { title: true, language: true } } },
      }),
      prisma.script.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: { id: true, title: true, language: true, updatedAt: true },
      }),
      prisma.execution.count({
        where: { userId, status: 'failed' },
      }),
      prisma.script.count({ where: { userId, isFavorite: true } }),
      prisma.cronJob.count({ where: { userId, isActive: true } }),
    ]);

    res.json({
      totalScripts,
      totalFolders,
      recentExecutions,
      recentScripts,
      recentErrors,
      favoriteScripts,
      totalCronJobs,
      executionStats: {
        total: recentExecutions.length,
        recentErrors,
      },
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
