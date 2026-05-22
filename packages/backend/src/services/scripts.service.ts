import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import os from 'os';

import { prisma } from './prisma';
import { NotificationService } from './notifications.service';
import { EmailService } from './email.service';

const notificationService = new NotificationService();
const emailService = new EmailService();
const execAsync = promisify(exec);

const TEMP_SCRIPTS_DIR = path.join(os.tmpdir(), 'scriptflow-executions');

if (!fs.existsSync(TEMP_SCRIPTS_DIR)) {
  fs.mkdirSync(TEMP_SCRIPTS_DIR, { recursive: true });
}

export class ScriptsService {
  async list(userId: number, folderId?: number, search?: string) {
    const where: any = { userId };
    if (folderId) where.folderId = folderId;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }
    return prisma.script.findMany({
      where,
      include: { folder: { select: { id: true, name: true, color: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getById(id: number, userId: number) {
    const script = await prisma.script.findFirst({
      where: { id, userId },
      include: {
        folder: { select: { id: true, name: true, color: true } },
        versions: { orderBy: { version: 'desc' }, take: 5 },
      },
    });
    if (!script) throw new Error('Script no encontrado');
    return script;
  }

  async create(data: {
    title: string;
    description?: string;
    language: string;
    content: string;
    folderId?: number;
    notifyEmails?: string;
    userId: number;
  }) {
    const script = await prisma.script.create({
      data: {
        title: data.title,
        description: data.description,
        language: data.language,
        content: data.content,
        folderId: data.folderId,
        userId: data.userId,
        notifyEmails: data.notifyEmails,
      },
    });

    // Create initial version
    await prisma.scriptVersion.create({
      data: {
        scriptId: script.id,
        content: data.content,
        version: 1,
        userId: data.userId,
      },
    });

    await this.logAudit('create', 'script', script.id, data.userId);
    return script;
  }

  async update(id: number, userId: number, data: {
    title?: string;
    description?: string;
    language?: string;
    content?: string;
    folderId?: number | null;
    isLocked?: boolean;
    isProtected?: boolean;
    isFavorite?: boolean;
    tags?: string;
    notifyEmails?: string;
  }) {
    const script = await prisma.script.findFirst({ where: { id, userId } });
    if (!script) throw new Error('Script no encontrado');
    if (script.isLocked) throw new Error('El script está bloqueado');

    const updated = await prisma.script.update({
      where: { id },
      data,
    });

    // If content changed, create new version
    if (data.content && data.content !== script.content) {
      const latestVersion = await prisma.scriptVersion.findFirst({
        where: { scriptId: id },
        orderBy: { version: 'desc' },
      });
      await prisma.scriptVersion.create({
        data: {
          scriptId: id,
          content: data.content,
          version: (latestVersion?.version ?? 0) + 1,
          userId,
        },
      });
    }

    await this.logAudit('update', 'script', id, userId);
    return updated;
  }

  async delete(id: number, userId: number) {
    const script = await prisma.script.findFirst({ where: { id, userId } });
    if (!script) throw new Error('Script no encontrado');
    if (script.isProtected) throw new Error('El script está protegido');

    await prisma.script.delete({ where: { id } });
    await this.logAudit('delete', 'script', id, userId);
  }

  async execute(id: number, userId: number) {
    const script = await prisma.script.findFirst({ where: { id, userId } });
    if (!script) throw new Error('Script no encontrado');

    const execution = await prisma.execution.create({
      data: {
        scriptId: id,
        userId,
        status: 'running',
        startedAt: new Date(),
      },
    });

    const sanitizedTitle = script.title.replace(/[^a-zA-Z0-9_-]/g, '_');
    const ext = this.getExtension(script.language);
    const filePath = path.join(TEMP_SCRIPTS_DIR, `${sanitizedTitle}_${execution.id}${ext}`);

    try {
      fs.writeFileSync(filePath, script.content);
      const startTime = Date.now();

      const shellCmd = this.getShellCommand(script.language, filePath);
      const { stdout, stderr } = await execAsync(shellCmd, {
        timeout: 30000,
        cwd: TEMP_SCRIPTS_DIR,
      });

      const duration = Date.now() - startTime;
      const output = stdout || stderr;

      await prisma.execution.update({
        where: { id: execution.id },
        data: {
          status: stderr && !stdout ? 'failed' : 'completed',
          output: output.slice(0, 10000),
          error: stderr?.slice(0, 1000) || '',
          duration,
          finishedAt: new Date(),
        },
      });

      await this.logAudit('execute', 'script', id, userId);

      // Create notification for successful execution
      await notificationService.create({
        userId,
        type: 'success',
        title: 'Script ejecutado',
        message: `"${script.title}" se ejecutó correctamente (${duration}ms)`,
      }).catch(() => {});
    } catch (error: any) {
      const duration = Date.now() - (execution.startedAt?.getTime() || Date.now());
      await prisma.execution.update({
        where: { id: execution.id },
        data: {
          status: 'failed',
          output: error.stdout || '',
          error: (error.stderr || error.message || '').slice(0, 1000),
          duration,
          finishedAt: new Date(),
        },
      });      // Create notification for failed execution
      await notificationService.create({
        userId,
        type: 'error',
        title: 'Error en ejecución',
        message: `"${script.title}" falló: ${(error.message || '').slice(0, 100)}`,
      }).catch(() => {});

      // Send email notification if configured
      if (script.notifyEmails) {
        const emails = script.notifyEmails
          .split(',')
          .map((e: string) => e.trim())
          .filter((e: string) => e.includes('@'));

        if (emails.length > 0) {
          const userRecord = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true },
          });

          emailService.sendScriptFailureAlert(
            userId,
            emails,
            script.title,
            (error.message || error.stderr || '').slice(0, 500),
            undefined
          ).catch(() => {});
        }
      }
    } finally {
      try { fs.unlinkSync(filePath); } catch {}
    }

    return prisma.execution.findUnique({ where: { id: execution.id } });
  }

  async getExecutions(scriptId: number, userId: number) {
    return prisma.execution.findMany({
      where: { scriptId, userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  private getExtension(language: string): string {
    const map: Record<string, string> = {
      bash: '.sh',
      python: '.py',
      javascript: '.js',
      powershell: '.ps1',
      php: '.php',
      go: '.go',
    };
    return map[language] || '.sh';
  }

  private getShellCommand(language: string, filePath: string): string {
    const map: Record<string, string> = {
      bash: `bash ${filePath}`,
      python: `python3 ${filePath}`,
      javascript: `node ${filePath}`,
      powershell: `pwsh ${filePath}`,
      php: `php ${filePath}`,
      go: `go run ${filePath}`,
    };
    return map[language] || `bash ${filePath}`;
  }

  private async logAudit(action: string, entity: string, entityId: number, userId: number) {
    await prisma.auditLog.create({
      data: { action, entity, entityId, userId },
    }).catch(() => {}); // Don't fail if audit log fails
  }
}
