import path from 'path';

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'scriptflow-dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  bcryptRounds: 10,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  dbPath: path.join(__dirname, '..', 'prisma', 'dev.db'),
};
