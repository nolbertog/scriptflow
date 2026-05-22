import api from './client';
import { AdminUser } from '../types';

export const usersApi = {
  list: () => api.get<AdminUser[]>('/users').then((r) => r.data),

  update: (id: number, data: { username?: string; email?: string; role?: string; isActive?: boolean }) =>
    api.patch<AdminUser>(`/users/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/users/${id}`).then((r) => r.data),
};
