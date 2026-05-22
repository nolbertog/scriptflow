import api from './client';
import { Script, Execution } from '../types';

export const scriptsApi = {
  list: (params?: { folderId?: number; search?: string }) =>
    api.get<Script[]>('/scripts', { params }).then((r) => r.data),

  getById: (id: number) =>
    api.get<Script>(`/scripts/${id}`).then((r) => r.data),

  create: (data: Partial<Script>) =>
    api.post<Script>('/scripts', data).then((r) => r.data),

  update: (id: number, data: Partial<Script>) =>
    api.patch<Script>(`/scripts/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/scripts/${id}`).then((r) => r.data),

  execute: (id: number) =>
    api.post<Execution>(`/scripts/${id}/execute`).then((r) => r.data),

  getExecutions: (id: number) =>
    api.get<Execution[]>(`/scripts/${id}/executions`).then((r) => r.data),
};
