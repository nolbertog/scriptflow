import api from './client';
import type { NotificationsResponse, Notification } from '../types';

export const notificationsApi = {
  list: (limit = 50, offset = 0) =>
    api.get<NotificationsResponse>('/notifications', { params: { limit, offset } }).then((r) => r.data),

  getUnreadCount: () =>
    api.get<{ count: number }>('/notifications/unread-count').then((r) => r.data),

  markAsRead: (id: number) =>
    api.patch<Notification>(`/notifications/${id}/read`).then((r) => r.data),

  markAllAsRead: () =>
    api.post<{ message: string }>('/notifications/mark-all-read').then((r) => r.data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/notifications/${id}`).then((r) => r.data),
};
