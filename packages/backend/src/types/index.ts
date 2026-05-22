import { Request } from 'express';

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export type Role = 'admin' | 'developer' | 'viewer' | 'operator';

export const ROLE_HIERARCHY: Record<Role, number> = {
  admin: 100,
  developer: 60,
  operator: 40,
  viewer: 10,
};

export function hasMinRole(userRole: string, minRole: Role): boolean {
  const userLevel = ROLE_HIERARCHY[userRole as Role] ?? 0;
  return userLevel >= ROLE_HIERARCHY[minRole];
}
