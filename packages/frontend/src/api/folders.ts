import api from './client';
import { Folder } from '../types';

export const foldersApi = {
  list: () => api.get<Folder[]>('/folders').then((r) => r.data),

  tree: () => api.get<Folder[]>('/folders/tree').then((r) => r.data),

  getById: (id: number) =>
    api.get<Folder>(`/folders/${id}`).then((r) => r.data),

  create: (data: Partial<Folder>) =>
    api.post<Folder>('/folders', data).then((r) => r.data),

  update: (id: number, data: Partial<Folder>) =>
    api.patch<Folder>(`/folders/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/folders/${id}`).then((r) => r.data),
};
