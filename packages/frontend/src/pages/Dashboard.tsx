import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Code2,
  FolderTree,
  Activity,
  AlertCircle,
  Star,
  Clock,
  Terminal,
  Play,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import api from '../api/client';
import { DashboardData } from '../types';

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<DashboardData>('/dashboard')
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Scripts',
      value: data?.totalScripts ?? 0,
      icon: Code2,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      path: '/scripts',
    },
    {
      label: 'Carpetas',
      value: data?.totalFolders ?? 0,
      icon: FolderTree,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      path: '/folders',
    },
    {
      label: 'Favoritos',
      value: data?.favoriteScripts ?? 0,
      icon: Star,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
    },
    {
      label: 'Cron Jobs',
      value: data?.totalCronJobs ?? 0,
      icon: Terminal,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      label: 'Errores Recientes',
      value: data?.recentErrors ?? 0,
      icon: AlertCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={14} className="text-green-400" />;
      case 'failed': return <XCircle size={14} className="text-red-400" />;
      case 'running': return <Loader2 size={14} className="text-blue-400 animate-spin" />;
      default: return <Clock size={14} className="text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Resumen de tu plataforma de scripts</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              onClick={() => stat.path && navigate(stat.path)}
              className={`bg-surface-100 rounded-xl border border-white/5 p-5 hover:border-white/10 transition-all ${
                stat.path ? 'cursor-pointer hover:bg-surface-100/80' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon size={18} className={stat.color} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Scripts */}
        <div className="bg-surface-100 rounded-xl border border-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Scripts Recientes</h2>
            <button
              onClick={() => navigate('/scripts')}
              className="text-xs text-accent-light hover:text-accent-hover transition-colors"
            >
              Ver todos
            </button>
          </div>
          <div className="space-y-2">
            {data?.recentScripts?.length ? (
              data.recentScripts.map((script) => (
                <div
                  key={script.id}
                  onClick={() => navigate(`/scripts/${script.id}`)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <div className="p-1.5 rounded-lg bg-surface-200">
                    <Code2 size={14} className="text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{script.title}</p>
                    <p className="text-xs text-gray-500">{script.language}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(script.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No hay scripts aún</p>
            )}
          </div>
        </div>

        {/* Recent Executions */}
        <div className="bg-surface-100 rounded-xl border border-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Ejecuciones Recientes</h2>
          </div>
          <div className="space-y-2">
            {data?.recentExecutions?.length ? (
              data.recentExecutions.map((exec) => (
                <div
                  key={exec.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  {getStatusIcon(exec.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      {exec.script?.title || `Script #${exec.scriptId}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {exec.duration ? `${(exec.duration / 1000).toFixed(2)}s` : '...'}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(exec.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No hay ejecuciones aún</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
