import { Router, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../services/prisma';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { AuthRequest } from '../types';
import { config } from '../config';

function getId(param: string | string[] | undefined): number {
  return parseInt(param as string, 10);
}

const router = Router();

const updateUserSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'developer', 'viewer', 'operator']).optional(),
  isActive: z.boolean().optional(),
});

// List all users (admin only)
router.get('/', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            scripts: true,
            executions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update user (admin only)
router.patch('/:id', authenticate, requireRole('admin'), validate(updateUserSchema), async (req: AuthRequest, res: Response) => {
  try {
    const id = getId(req.params.id);
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: req.body,
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'update',
        entity: 'user',
        entityId: id,
        details: JSON.stringify({ changes: req.body }),
        userId: req.user!.userId,
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete user (admin only, cannot delete self)
router.delete('/:id', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const id = getId(req.params.id);
    if (id === req.user!.userId) {
      return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await prisma.user.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: 'delete',
        entity: 'user',
        entityId: id,
        details: JSON.stringify({ username: existing.username }),
        userId: req.user!.userId,
      },
    });

    res.json({ message: 'Usuario eliminado' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
