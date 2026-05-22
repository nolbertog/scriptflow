import express from 'express';
import cors from 'cors';
import { config } from './config';
import authRoutes from './routes/auth';
import scriptsRoutes from './routes/scripts';
import foldersRoutes from './routes/folders';
import dashboardRoutes from './routes/dashboard';
import executionsRoutes from './routes/executions';
import cronRoutes from './routes/cron';
import usersRoutes from './routes/users';
import notificationsRoutes from './routes/notifications';
import smtpRoutes from './routes/smtp';

const app = express();

app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/scripts', scriptsRoutes);
app.use('/api/folders', foldersRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/executions', executionsRoutes);
app.use('/api/cron', cronRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/smtp', smtpRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(config.port, () => {
  console.log(`🚀 ScriptFlow API running on http://localhost:${config.port}`);
});

export default app;
