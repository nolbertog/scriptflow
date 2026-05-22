import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { AuthRequest } from '../types';
import { prisma } from '../services/prisma';
import { EmailService } from '../services/email.service';

const router = Router();
const emailService = new EmailService();

const smtpSchema = z.object({
  host: z.string().min(1, 'Host requerido'),
  port: z.number().min(1).max(65535),
  username: z.string().min(1, 'Usuario requerido'),
  password: z.string().optional(),
  fromEmail: z.string().email('Email remitente inválido'),
  fromName: z.string().optional(),
  secure: z.boolean().optional(),
  isEnabled: z.boolean().optional(),
});

// Get SMTP config
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const config = await prisma.smtpConfig.findUnique({
      where: { userId: req.user!.userId },
    });
    // Return config without password for security
    if (config) {
      const { password, ...safeConfig } = config;
      return res.json({ ...safeConfig, hasPassword: !!password });
    }
    res.json(null);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Upsert SMTP config (create or update)
router.put('/', authenticate, validate(smtpSchema), async (req: AuthRequest, res: Response) => {
  try {
    const config = await prisma.smtpConfig.upsert({
      where: { userId: req.user!.userId },
      update: {
        host: req.body.host,
        port: req.body.port,
        username: req.body.username,
        ...(req.body.password ? { password: req.body.password } : {}),
        fromEmail: req.body.fromEmail,
        fromName: req.body.fromName || 'ScriptFlow',
        secure: req.body.secure ?? false,
        isEnabled: req.body.isEnabled ?? true,
      },
      create: {
        userId: req.user!.userId,
        host: req.body.host,
        port: req.body.port,
        username: req.body.username,
        password: req.body.password || '',
        fromEmail: req.body.fromEmail,
        fromName: req.body.fromName || 'ScriptFlow',
        secure: req.body.secure ?? false,
        isEnabled: req.body.isEnabled ?? true,
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        action: 'update',
        entity: 'smtp',
        entityId: config.id,
        userId: req.user!.userId,
      },
    }).catch(() => {});

    const { password, ...safeConfig } = config;
    res.json({ ...safeConfig, hasPassword: !!password });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Test SMTP configuration
router.post('/test', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const config = await prisma.smtpConfig.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!config || !config.isEnabled) {
      return res.status(400).json({ error: 'SMTP no configurado' });
    }

    const result = await emailService.sendNotificationEmail(
      req.user!.userId,
      [req.user!.email],
      '✅ ScriptFlow - Prueba de configuración SMTP',
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1e1e2e; color: #cdd6f4; padding: 24px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="width: 48px; height: 48px; background: #22c55e; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 12px;">
            ✓
          </div>
          <h1 style="font-size: 20px; margin: 0; color: #fff;">¡Conexión Exitosa!</h1>
        </div>
        <p style="text-align: center; color: #a5b4fc; margin: 0;">Tu configuración SMTP funciona correctamente.</p>
        <p style="text-align: center; color: #6c7086; font-size: 12px; margin-top: 16px;">
          Recibirás notificaciones por email cuando un script falle.
        </p>
        <hr style="border: none; border-top: 1px solid #313244; margin: 24px 0;" />
        <p style="text-align: center; color: #6c7086; font-size: 12px; margin: 0;">
          ScriptFlow - Plataforma de Gestión de Scripts
        </p>
      </div>
      `
    );

    if (result.success) {
      res.json({ message: 'Email de prueba enviado correctamente' });
    } else {
      res.status(400).json({ error: result.error || 'Error al enviar email de prueba' });
    }
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
