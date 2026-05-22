export interface User {
  id: number;
  email: string;
  username: string;
  role: 'admin' | 'developer' | 'viewer' | 'operator';
  avatar?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Script {
  id: number;
  title: string;
  description?: string;
  language: string;
  content: string;
  folderId?: number | null;
  userId: number;
  isLocked: boolean;
  isProtected: boolean;
  isFavorite: boolean;
  tags: string;
  createdAt: string;
  updatedAt: string;
  folder?: { id: number; name: string; color: string } | null;
  versions?: ScriptVersion[];
}

export interface ScriptVersion {
  id: number;
  scriptId: number;
  content: string;
  version: number;
  userId: number;
  createdAt: string;
}

export interface Folder {
  id: number;
  name: string;
  color: string;
  icon: string;
  parentId?: number | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
  _count?: { scripts: number; children: number };
  scripts?: { id: number; title: string; language: string; updatedAt: string }[];
  children?: Folder[];
}

export interface Execution {
  id: number;
  scriptId: number;
  userId: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  output: string;
  error: string;
  duration?: number;
  startedAt: string;
  finishedAt?: string;
  createdAt: string;
  script?: { title: string; language: string };
}

export interface DashboardData {
  totalScripts: number;
  totalFolders: number;
  recentExecutions: Execution[];
  recentScripts: Script[];
  recentErrors: number;
  favoriteScripts: number;
  totalCronJobs: number;
  executionStats: {
    total: number;
    recentErrors: number;
  };
}

export interface AuditLog {
  id: number;
  action: string;
  entity: string;
  entityId?: number;
  details?: string;
  ipAddress?: string;
  userId: number;
  createdAt: string;
}
