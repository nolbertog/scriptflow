import { useEffect, useState } from 'react';
import {
  Activity,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Terminal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { executionsApi, ExecutionsResponse } from '../api/executions';
import { Execution } from '../types';
import TerminalModal from '../components/TerminalModal';

const STATUS_FILTERS = [
  { value: '', label: 'Todos', icon: Activity },
  { value: 'completed', label: 'Completados', icon: CheckCircle2 },
  { value: 'failed', label: 'Errores', icon: XCircle },
  { value: 'running', label: 'En ejecución', icon: Clock },
];

const STATUS_BADGES: Record<string, { bg: string; text: string; border: string }> = {
  completed: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
  failed: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  running: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  cancelled: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' },
};

export default function Executions() {
  const [data, setData] = useState<ExecutionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);
  const [showTerminal, setShowTerminal] = useState(false);
  const limit = 20;

  const loadExecutions = async () => {
    setLoading(true);
    try {
      const result = await executionsApi.list({
        status: statusFilter || undefined,
        search: search || undefined,
        limit,
        offset: page * limit,
      });
      setData(result);
    } catch {
      toast.error('Error al cargar ejecuciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExecutions();
  }, [statusFilter, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadExecutions();
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={14} className="text-green-400" />;
      case 'failed': return <XCircle size={14} className="text-red-400" />;
      case 'running': return <Loader2 size={14} className="text-blue-400 animate-spin" />;
      default: return <Clock size={14} className="text-gray-400" />;
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '—';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Ejecuciones</h1>
        <p className="text-gray-400 mt-1">
          {data ? `${data.total} ejecuciones en total` : 'Historial de ejecuciones'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {STATUS_FILTERS.map((f) => {
            const Icon = f.icon;
            const isActive = statusFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => { setStatusFilter(f.value); setPage(0); }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-accent/10 text-accent-light border border-accent/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon size={14} />
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xs">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por script..."
              className="w-full pl-9 pr-4 py-2 bg-surface-200 border border-white/5 rounded-lg text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-accent/50 transition-all"
            />
          </div>
        </form>
      </div>

      {/* Executions List */}
      <div className="bg-surface-100 rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Script</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Lenguaje</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Duración</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data?.executions.map((exec) => {
                const badge = STATUS_BADGES[exec.status] || STATUS_BADGES.pending;
                return (
                  <tr key={exec.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${badge.bg} ${badge.text} ${badge.border}`}>
                        {getStatusIcon(exec.status)}
                        {exec.status === 'completed' ? 'Completado' :
                         exec.status === 'failed' ? 'Error' :
                         exec.status === 'running' ? 'Ejecutando' :
                         exec.status === 'cancelled' ? 'Cancelado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-white font-medium">
                        {exec.script?.title || `Script #${exec.scriptId}`}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-400">{exec.script?.language || '—'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-400">{formatDuration(exec.duration)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-400">
                        {new Date(exec.createdAt).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedExecution(exec);
                          setShowTerminal(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent/10 text-accent-light hover:bg-accent/20 transition-colors"
                      >
                        <Terminal size={12} />
                        Ver salida
                      </button>
                    </td>
                  </tr>
                );
              })}
              {(!data?.executions || data.executions.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-500">
                    <Activity size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No hay ejecuciones</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Las ejecuciones aparecerán aquí cuando ejecutes scripts
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
            <span className="text-sm text-gray-500">
              Página {page + 1} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Terminal Modal */}
      <TerminalModal
        execution={selectedExecution}
        isOpen={showTerminal}
        onClose={() => setShowTerminal(false)}
        title={selectedExecution?.script?.title}
      />
    </div>
  );
}
