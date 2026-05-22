import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth.service';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { AuthRequest } from '../types';

const router = Router();
const authService = new AuthService();

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  username: z.string().min(3, 'Username debe tener al menos 3 caracteres').max(30),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

router.post('/register', validate(registerSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { email, username, password } = req.body;
    const result = await authService.register(email, username, password);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', validate(loginSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip || req.socket.remoteAddress;
    const result = await authService.login(email, password, ip);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

router.get('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await authService.getProfile(req.user!.userId);
    res.json(user);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

export default router;
