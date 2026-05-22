import api from './client';
import { AuthResponse, User } from '../types';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data),

  register: (email: string, username: string, password: string) =>
    api.post<AuthResponse>('/auth/register', { email, username, password }).then((r) => r.data),

  getProfile: () => api.get<User>('/auth/profile').then((r) => r.data),
};
