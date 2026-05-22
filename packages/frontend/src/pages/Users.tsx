import { useEffect, useState } from 'react';
import {
  Users as UsersIcon,
  Loader2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldBan,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Search,
  ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usersApi } from '../api/users';
import { AdminUser } from '../types';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const ROLE_CONFIG: Record<string, { icon: typeof Shield; color: string; label: string }> = {
  admin: { icon: ShieldCheck, color: 'text-red-400', label: 'Admin' },
  developer: { icon: Shield, color: 'text-blue-400', label: 'Developer' },
  operator: { icon: ShieldAlert, color: 'text-yellow-400', label: 'Operator' },
  viewer: { icon: ShieldBan, color: 'text-gray-400', label: 'Viewer' },
};

export default function Users() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [newRole, setNewRole] = useState('');
  const currentUser = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const loadUsers = async () => {
    try {
      const data = await usersApi.list();
      setUsers(data);
    } catch {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      loadUsers();
    } else {
      setLoading(false);
    }
  }, []);

  // Only admins can access this page
  if (currentUser && currentUser.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 animate-fadeIn">
        <ShieldBan size={48} className="mb-3 opacity-30" />
        <p className="text-sm">Solo los administradores pueden gestionar usuarios</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 flex items-center gap-2 text-sm text-accent-light hover:text-accent-hover transition-colors"
        >
          <ArrowLeft size={14} />
          Volver al Dashboard
        </button>
      </div>
    );
  }

  const handleRoleChange = async () => {
    if (!editingUser || !newRole) return;
    try {
      await usersApi.update(editingUser.id, { role: newRole });
      toast.success('Rol actualizado');
      setEditingUser(null);
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al actualizar');
    }
  };

  const toggleActive = async (user: AdminUser) => {
    try {
      await usersApi.update(user.id, { isActive: !user.isActive });
      toast.success(user.isActive ? 'Usuario desactivado' : 'Usuario activado');
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al actualizar');
    }
  };

  const deleteUser = async (user: AdminUser) => {
    if (!confirm(`¿Estás seguro de eliminar a "${user.username}"?`)) return;
    try {
      await usersApi.delete(user.id);
      toast.success('Usuario eliminado');
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al eliminar');
    }
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Usuarios</h1>
          <p className="text-gray-400 mt-1">{users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar usuarios..."
          className="w-full pl-9 pr-4 py-2 bg-surface-200 border border-white/5 rounded-lg text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-accent/50 transition-all"
        />
      </div>

      {/* Users Table */}
      <div className="bg-surface-100 rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Scripts</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Registro</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => {
                const roleCfg = ROLE_CONFIG[user.role] || ROLE_CONFIG.viewer;
                const RoleIcon = roleCfg.icon;
                const isSelf = currentUser?.id === user.id;
                return (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-sm font-medium text-accent-light">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-sm text-white font-medium">{user.username}</span>
                          {isSelf && (
                            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent-light">Tú</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-400">{user.email}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-opacity-10 ${roleCfg.color}`}>
                        <RoleIcon size={12} />
                        {roleCfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        user.isActive
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-400">{user._count.scripts}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditingUser(user); setNewRole(user.role); }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                          title="Cambiar rol"
                        >
                          <Shield size={14} />
                        </button>
                        <button
                          onClick={() => toggleActive(user)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                          title={user.isActive ? 'Desactivar' : 'Activar'}
                        >
                          {user.isActive ? <ToggleRight size={14} className="text-green-400" /> : <ToggleLeft size={14} />}
                        </button>
                        {!isSelf && (
                          <button
                            onClick={() => deleteUser(user)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Change Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditingUser(null)}>
          <div className="bg-surface-100 rounded-xl border border-white/10 p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-2">Cambiar Rol</h2>
            <p className="text-sm text-gray-400 mb-4">
              Usuario: <span className="text-white font-medium">{editingUser.username}</span>
            </p>
            <div className="space-y-2">
              {Object.entries(ROLE_CONFIG).map(([role, cfg]) => {
                const RoleIcon = cfg.icon;
                const isSelected = newRole === role;
                return (
                  <button
                    key={role}
                    onClick={() => setNewRole(role)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                      isSelected
                        ? 'bg-accent/10 border border-accent/20 text-accent-light'
                        : 'text-gray-300 hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <RoleIcon size={18} className={cfg.color} />
                    <div className="text-left flex-1">
                      <p className="font-medium">{cfg.label}</p>
                      <p className="text-xs text-gray-500">
                        {role === 'admin' ? 'Acceso completo al sistema' :
                         role === 'developer' ? 'Crear y editar scripts' :
                         role === 'operator' ? 'Ejecutar scripts' :
                         'Solo lectura'}
                      </p>
                    </div>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-accent" />}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleRoleChange}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
