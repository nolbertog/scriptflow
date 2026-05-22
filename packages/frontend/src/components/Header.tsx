import { useState, useEffect, useRef, useCallback } from 'react';
import { Menu, LogOut, Search, Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUiStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { notificationsApi } from '../api/notifications';
import type { Notification } from '../types';

const TYPE_STYLES: Record<string, string> = {
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  error: 'bg-red-500/10 text-red-400 border-red-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

export default function Header() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const searchQuery = useUiStore((s) => s.searchQuery);
  const setSearchQuery = useUiStore((s) => s.setSearchQuery);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const loadNotifications = useCallback(async () => {
    try {
      const [listResult, unreadResult] = await Promise.all([
        notificationsApi.list(10, 0),
        notificationsApi.getUnreadCount(),
      ]);
      setNotifications(listResult.notifications);
      setUnreadCount(unreadResult.count);
    } catch {
      // Silent fail
    }
  }, []);

  // Load on mount and poll every 30s
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      const deleted = notifications.find((n) => n.id === id);
      if (deleted && !deleted.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {}
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'ahora';
    if (mins < 60) return `hace ${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `hace ${days}d`;
  };

  return (
    <header className="h-16 bg-surface-100 border-b border-white/5 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar scripts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-80 pl-9 pr-4 py-2 bg-surface-200 border border-white/5 rounded-lg text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-fadeIn">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-96 bg-surface-200 border border-white/10 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50 animate-fadeIn">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <h3 className="text-sm font-semibold text-white">Notificaciones</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="flex items-center gap-1.5 text-xs text-accent-light hover:text-white transition-colors"
                    >
                      <CheckCheck size={14} />
                      <span>Leer todas</span>
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/notifications')}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Ver todas
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Bell size={32} className="mb-2 opacity-30" />
                    <p className="text-sm">Sin notificaciones</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`group relative px-4 py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer ${
                        !n.isRead ? 'bg-accent/[0.03]' : ''
                      }`}
                      onClick={() => {
                        if (!n.isRead) handleMarkRead(n.id);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Type indicator */}
                        <span
                          className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                            n.type === 'success'
                              ? 'bg-emerald-400'
                              : n.type === 'error'
                              ? 'bg-red-400'
                              : n.type === 'warning'
                              ? 'bg-amber-400'
                              : 'bg-blue-400'
                          }`}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p
                              className={`text-sm truncate ${
                                !n.isRead ? 'text-white font-medium' : 'text-gray-300'
                              }`}
                            >
                              {n.title}
                            </p>
                            {!n.isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                            )}
                          </div>
                          {n.message && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                              {n.message}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] text-gray-600">{timeAgo(n.createdAt)}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded border ${TYPE_STYLES[n.type] || ''}`}
                            >
                              {n.type}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(n.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
}
