import api from './client';
import type { SmtpConfig } from '../types';

export const smtpApi = {
  get: () =>
    api.get<SmtpConfig | null>('/smtp').then((r) => r.data),

  upsert: (data: {
    host: string;
    port: number;
    username: string;
    password: string;
    fromEmail: string;
    fromName?: string;
    secure?: boolean;
    isEnabled?: boolean;
  }) =>
    api.put<SmtpConfig & { hasPassword: boolean }>('/smtp', data).then((r) => r.data),

  test: () =>
    api.post<{ message: string }>('/smtp/test').then((r) => r.data),
};
