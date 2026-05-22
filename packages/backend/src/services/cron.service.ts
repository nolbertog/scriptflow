import { prisma } from './prisma';

export class CronService {
  async list(userId: number) {
    return prisma.cronJob.findMany({
      where: { userId },
      include: {
        script: { select: { id: true, title: true, language: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: number, userId: number) {
    const job = await prisma.cronJob.findFirst({
      where: { id, userId },
      include: {
        script: { select: { id: true, title: true, language: true } },
      },
    });
    if (!job) throw new Error('Cron job no encontrado');
    return job;
  }

  async create(data: {
    scriptId: number;
    expression: string;
    description?: string;
    timezone?: string;
    retryCount?: number;
    userId: number;
  }) {
    // Validate the script belongs to the user
    const script = await prisma.script.findFirst({
      where: { id: data.scriptId, userId: data.userId },
    });
    if (!script) throw new Error('Script no encontrado');

    const job = await prisma.cronJob.create({
      data: {
        scriptId: data.scriptId,
        userId: data.userId,
        expression: data.expression,
        description: data.description,
        timezone: data.timezone || 'UTC',
        retryCount: data.retryCount ?? 0,
        isActive: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'create',
        entity: 'cron',
        entityId: job.id,
        details: JSON.stringify({ scriptId: data.scriptId, expression: data.expression }),
        userId: data.userId,
      },
    });

    return job;
  }

  async update(id: number, userId: number, data: {
    expression?: string;
    description?: string;
    timezone?: string;
    isActive?: boolean;
    retryCount?: number;
  }) {
    const job = await prisma.cronJob.findFirst({ where: { id, userId } });
    if (!job) throw new Error('Cron job no encontrado');

    const updated = await prisma.cronJob.update({
      where: { id },
      data,
    });

    await prisma.auditLog.create({
      data: {
        action: 'update',
        entity: 'cron',
        entityId: id,
        details: JSON.stringify(data),
        userId,
      },
    });

    return updated;
  }

  async delete(id: number, userId: number) {
    const job = await prisma.cronJob.findFirst({ where: { id, userId } });
    if (!job) throw new Error('Cron job no encontrado');

    await prisma.cronJob.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: 'delete',
        entity: 'cron',
        entityId: id,
        details: JSON.stringify({ expression: job.expression }),
        userId,
      },
    });
  }
}
