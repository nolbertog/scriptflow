import { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCheck, Trash2, ArrowLeft, Filter, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationsApi } from '../api/notifications';
import type { Notification } from '../types';

const TYPE_STYLES: Record<string, string> = {
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  error: 'bg-red-500/10 text-red-400 border-red-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

const TYPE_LABELS: Record<string, string> = {
  success: 'Éxito',
  error: 'Error',
  warning: 'Advertencia',
  info: 'Información',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [page, setPage] = useState(0);
  const navigate = useNavigate();
  const limit = 30;

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await notificationsApi.list(limit, page * limit);
      const unreadResult = await notificationsApi.getUnreadCount();
      setNotifications(result.notifications);
      setTotal(result.total);
      setUnreadCount(unreadResult.count);
    } catch {
      // Silent fail
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleMarkRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationsApi.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setTotal((prev) => prev - 1);
      const deleted = notifications.find((n) => n.id === id);
      if (deleted && !deleted.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {}
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Ahora';
    if (mins < 60) return `Hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Hace ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `Hace ${days}d`;
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    });
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Notificaciones</h1>
            <p className="text-sm text-gray-400 mt-1">
              {unreadCount > 0
                ? `${unreadCount} sin leer de ${total} total`
                : `${total} notificaciones`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter */}
          <div className="flex items-center bg-surface-200 rounded-lg border border-white/5 p-0.5">
            <button
              onClick={() => { setFilter('all'); setPage(0); }}
              className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                filter === 'all'
                  ? 'bg-accent/20 text-accent-light font-medium'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => { setFilter('unread'); setPage(0); }}
              className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                filter === 'unread'
                  ? 'bg-accent/20 text-accent-light font-medium'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              No leídas {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-accent-light hover:bg-accent/10 transition-colors"
            >
              <CheckCheck size={14} />
              <span>Leer todas</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-surface-100/50 border border-white/5 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-500">
          <Bell size={48} className="mb-4 opacity-20" />
          <p className="text-lg font-medium">Sin notificaciones</p>
          <p className="text-sm mt-1">
            {filter === 'unread'
              ? 'No tienes notificaciones sin leer'
              : 'Las notificaciones aparecerán aquí cuando ejecutes scripts o crees cron jobs'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {filtered.map((n) => (
              <div
                key={n.id}
                className={`group relative rounded-xl border transition-all ${
                  !n.isRead
                    ? 'bg-accent/[0.03] border-accent/10 hover:border-accent/20'
                    : 'bg-surface-100/50 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-start gap-4 p-4">
                  {/* Type icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      n.type === 'success'
                        ? 'bg-emerald-500/10'
                        : n.type === 'error'
                        ? 'bg-red-500/10'
                        : n.type === 'warning'
                        ? 'bg-amber-500/10'
                        : 'bg-blue-500/10'
                    }`}
                  >
                    <Bell
                      size={18}
                      className={
                        n.type === 'success'
                          ? 'text-emerald-400'
                          : n.type === 'error'
                          ? 'text-red-400'
                          : n.type === 'warning'
                          ? 'text-amber-400'
                          : 'text-blue-400'
                      }
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-sm ${
                          !n.isRead ? 'text-white font-semibold' : 'text-gray-300'
                        }`}
                      >
                        {n.title}
                      </h3>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                      )}
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border ml-auto ${TYPE_STYLES[n.type]}`}
                      >
                        {TYPE_LABELS[n.type]}
                      </span>
                    </div>
                    {n.message && (
                      <p className="text-sm text-gray-500 mt-1">{n.message}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
                        <Clock size={12} />
                        <span>{timeAgo(n.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.isRead && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-accent-light hover:bg-accent/10 transition-colors"
                        title="Marcar como leída"
                      >
                        <CheckCheck size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-500">
                Página {page + 1} de {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
