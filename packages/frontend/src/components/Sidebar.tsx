import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Code2,
  FolderTree,
  Activity,
  Settings,
  Users,
  Container,
  ChevronLeft,
  ChevronRight,
  Terminal,
  Bell,
} from 'lucide-react';
import { useUiStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';

type MenuItem = {
  path: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  disabled?: boolean;
};

const menuItems: MenuItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/scripts', label: 'Scripts', icon: Code2 },
  { path: '/folders', label: 'Carpetas', icon: FolderTree },
  { path: '/executions', label: 'Ejecuciones', icon: Activity },
  { path: '/notifications', label: 'Notificaciones', icon: Bell },
  { path: '/cron', label: 'Cron Jobs', icon: Terminal },
  { path: '/docker', label: 'Docker', icon: Container, disabled: true },
  { path: '/users', label: 'Usuarios', icon: Users },
  { path: '/settings', label: 'Configuración', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-surface-100 border-r border-white/5 flex flex-col z-50 transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-0 -translate-x-full'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
          <Code2 size={18} className="text-white" />
        </div>
        <span className="font-semibold text-lg text-white">ScriptFlow</span>
      </div>

      {/* User info */}
      {user && (
        <div className="px-5 py-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-sm font-medium text-accent-light">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.username}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.disabled ? '#' : item.path}
              onClick={(e) => {
                if (item.disabled) e.preventDefault();
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-accent/10 text-accent-light font-medium'
                  : item.disabled
                  ? 'text-gray-500 cursor-not-allowed opacity-50'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.disabled && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-500">
                  Pronto
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Toggle */}
      <button
        onClick={toggleSidebar}
        className="h-10 flex items-center justify-center border-t border-white/5 text-gray-400 hover:text-white transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Toggle button when closed */}
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed left-3 top-4 z-50 w-8 h-8 rounded-lg bg-surface-100 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      )}
    </aside>
  );
}
