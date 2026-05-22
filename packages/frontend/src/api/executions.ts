import api from './client';
import { Execution } from '../types';

export interface ExecutionsResponse {
  executions: Execution[];
  total: number;
  limit: number;
  offset: number;
}

export const executionsApi = {
  list: (params?: { status?: string; search?: string; limit?: number; offset?: number }) =>
    api.get<ExecutionsResponse>('/executions', { params }).then((r) => r.data),

  getById: (id: number) =>
    api.get<Execution>(`/executions/${id}`).then((r) => r.data),
};
