import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthRequest, JwtPayload, Role, hasMinRole } from '../types';

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

export const requireRole = (minRole: Role) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !hasMinRole(req.user.role, minRole)) {
      return res.status(403).json({ error: 'No tienes permisos suficientes' });
    }
    next();
  };
};
