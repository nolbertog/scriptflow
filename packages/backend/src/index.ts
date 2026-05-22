import express from 'express';
import cors from 'cors';
import { config } from './config';
import authRoutes from './routes/auth';
import scriptsRoutes from './routes/scripts';
import foldersRoutes from './routes/folders';
import dashboardRoutes from './routes/dashboard';

const app = express();

app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/scripts', scriptsRoutes);
app.use('/api/folders', foldersRoutes);
app.use('/api/dashboard', dashboardRoutes);

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
