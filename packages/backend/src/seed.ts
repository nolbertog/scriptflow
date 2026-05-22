import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data in correct order
  await prisma.scriptVersion.deleteMany();
  await prisma.execution.deleteMany();
  await prisma.cronJob.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.secret.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.session.deleteMany();
  await prisma.script.deleteMany();
  await prisma.folder.deleteMany();

  // Create default admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@scriptflow.com' },
    update: {},
    create: {
      email: 'admin@scriptflow.com',
      username: 'admin',
      password: adminPassword,
      role: 'admin',
    },
  });

  const devPassword = await bcrypt.hash('dev123', 10);
  const developer = await prisma.user.upsert({
    where: { email: 'dev@scriptflow.com' },
    update: {},
    create: {
      email: 'dev@scriptflow.com',
      username: 'developer',
      password: devPassword,
      role: 'developer',
    },
  });

  // Create default folders
  const folders = [
    { name: 'Producción', color: '#ef4444', userId: admin.id },
    { name: 'Desarrollo', color: '#3b82f6', userId: admin.id },
    { name: 'Backups', color: '#10b981', userId: admin.id },
    { name: 'Automatización', color: '#f59e0b', userId: admin.id },
    { name: 'Bots', color: '#8b5cf6', userId: admin.id },
  ];

  // Clear existing folders and re-create
  await prisma.folder.deleteMany();
  for (const folder of folders) {
    await prisma.folder.create({ data: folder });
  }

  // Create sample scripts
  const autoFolder = await prisma.folder.findFirst({
    where: { name: 'Automatización', userId: admin.id },
  });

  const scripts = [
    {
      title: 'Backup Database',
      description: 'Realiza un backup automático de la base de datos',
      language: 'bash',
      content: `#!/bin/bash\n# Database Backup Script\nBACKUP_DIR="/backups"\nDATE=$(date +%Y%m%d_%H%M%S)\n\necho "Iniciando backup... $DATE"\nmkdir -p $BACKUP_DIR\necho "Backup completado: $BACKUP_DIR/backup_$DATE.sql"\necho "Todos los datos han sido respaldados correctamente."`,
      userId: admin.id,
      folderId: autoFolder?.id,
    },
    {
      title: 'Health Check',
      description: 'Verifica el estado de los servicios',
      language: 'bash',
      content: `#!/bin/bash\necho "=== Health Check Report ===\\n"\necho "Uptime: $(uptime -p)"\necho "Memory: $(free -h | grep Mem | awk '{print $3\"/\"$2}')"\necho "Disk: $(df -h / | tail -1 | awk '{print $3\"/\"$2\" (\"$5\")\"}')\\"\necho "\\nTodos los sistemas operativos."`,
      userId: admin.id,
      folderId: autoFolder?.id,
    },
    {
      title: 'Hello World',
      description: 'Script de prueba en Python',
      language: 'python',
      content: `#!/usr/bin/env python3\nprint("Hello from ScriptFlow! 🚀")\nprint(f"This script was executed at: {__import__('datetime').datetime.now()}")`,
      userId: admin.id,
    },
    {
      title: 'System Info',
      description: 'Muestra información del sistema en Node.js',
      language: 'javascript',
      content: `const os = require('os');\nconsole.log('=== System Information ===');\nconsole.log('Platform:', os.platform());\nconsole.log('CPU:', os.cpus().length, 'cores');\nconsole.log('Memory:', Math.round(os.totalmem() / 1024 / 1024 / 1024), 'GB');\nconsole.log('Hostname:', os.hostname());\nconsole.log('Uptime:', Math.round(os.uptime() / 3600), 'hours');`,
      userId: admin.id,
    },
  ];

  for (const script of scripts) {
    const created = await prisma.script.create({ data: script });
    await prisma.scriptVersion.create({
      data: {
        scriptId: created.id,
        content: script.content,
        version: 1,
        userId: admin.id,
      },
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log('📧 Admin: admin@scriptflow.com / admin123');
  console.log('📧 Dev: dev@scriptflow.com / dev123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
