import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JwtPayload } from '../types';
import { prisma } from './prisma';

export class AuthService {
  async register(email: string, username: string, password: string) {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      throw new Error('El email o username ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(password, config.bcryptRounds);
    const user = await prisma.user.create({
      data: { email, username, password: hashedPassword },
    });

    await prisma.auditLog.create({
      data: {
        action: 'register',
        entity: 'user',
        entityId: user.id,
        details: JSON.stringify({ email: user.email }),
        userId: user.id,
      },
    });

    return this.generateTokens(user);
  }

  async login(email: string, password: string, ipAddress?: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      throw new Error('Credenciales inválidas');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('Credenciales inválidas');
    }

    await prisma.auditLog.create({
      data: {
        action: 'login',
        entity: 'user',
        entityId: user.id,
        details: JSON.stringify({ email: user.email }),
        ipAddress,
        userId: user.id,
      },
    });

    return this.generateTokens(user);
  }

  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
      },
    });
    if (!user) throw new Error('Usuario no encontrado');
    return user;
  }

  private generateTokens(user: { id: number; email: string; role: string; username: string }) {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }
}
