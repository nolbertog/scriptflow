import api from './client';
import { CronJob } from '../types';

export const cronApi = {
  list: () => api.get<CronJob[]>('/cron').then((r) => r.data),

  getById: (id: number) =>
    api.get<CronJob>(`/cron/${id}`).then((r) => r.data),

  create: (data: { scriptId: number; expression: string; description?: string; timezone?: string; retryCount?: number }) =>
    api.post<CronJob>('/cron', data).then((r) => r.data),

  update: (id: number, data: { expression?: string; description?: string; timezone?: string; isActive?: boolean; retryCount?: number }) =>
    api.patch<CronJob>(`/cron/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/cron/${id}`).then((r) => r.data),
};
