import nodemailer from 'nodemailer';
import { prisma } from './prisma';

export class EmailService {
  async sendNotificationEmail(
    userId: number,
    to: string[],
    subject: string,
    html: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const config = await prisma.smtpConfig.findUnique({
        where: { userId },
      });

      if (!config || !config.isEnabled) {
        return { success: false, error: 'SMTP no configurado' };
      }

      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.username,
          pass: config.password,
        },
      });

      await transporter.sendMail({
        from: `"${config.fromName}" <${config.fromEmail}>`,
        to: to.join(', '),
        subject,
        html,
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async sendScriptFailureAlert(
    userId: number,
    notifyEmails: string[],
    scriptTitle: string,
    errorMessage: string,
    scriptUrl?: string
  ) {
    const subject = `❌ ScriptFlow - Error: "${scriptTitle}"`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1e1e2e; color: #cdd6f4; padding: 24px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="width: 48px; height: 48px; background: #ef4444; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 12px;">
            ✕
          </div>
          <h1 style="font-size: 20px; margin: 0; color: #fff;">Error en Ejecución</h1>
        </div>

        <div style="background: #181825; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
          <p style="margin: 0 0 8px; color: #a5b4fc; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Script</p>
          <p style="margin: 0; font-size: 16px; color: #fff; font-weight: 600;">${scriptTitle}</p>
        </div>

        <div style="background: #181825; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
          <p style="margin: 0 0 8px; color: #f87171; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Error</p>
          <pre style="margin: 0; font-family: 'Courier New', monospace; font-size: 13px; color: #fca5a5; white-space: pre-wrap; word-break: break-word;">${errorMessage}</pre>
        </div>

        ${scriptUrl ? `
        <div style="text-align: center; margin-top: 24px;">
          <a href="${scriptUrl}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: #fff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500;">
            Ver Script
          </a>
        </div>
        ` : ''}

        <hr style="border: none; border-top: 1px solid #313244; margin: 24px 0;" />

        <p style="text-align: center; color: #6c7086; font-size: 12px; margin: 0;">
          ScriptFlow - Plataforma de Gestión de Scripts
        </p>
      </div>
    `;

    return this.sendNotificationEmail(userId, notifyEmails, subject, html);
  }
}
