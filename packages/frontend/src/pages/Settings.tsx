import { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  Save,
  Send,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import { smtpApi } from '../api/smtp';
import type { SmtpConfig } from '../types';

export default function Settings() {
  const user = useAuthStore((s) => s.user);
  const loadProfile = useAuthStore((s) => s.loadProfile);

  // Profile form
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // SMTP form
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig | null>(null);
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpFromEmail, setSmtpFromEmail] = useState('');
  const [smtpFromName, setSmtpFromName] = useState('ScriptFlow');
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [loadingSmtp, setLoadingSmtp] = useState(true);

  // Load SMTP config
  useEffect(() => {
    const loadSmtp = async () => {
      try {
        const config = await smtpApi.get();
        if (config) {
          setSmtpConfig(config);
          setSmtpHost(config.host);
          setSmtpPort(config.port);
          setSmtpUser(config.username);
          setSmtpFromEmail(config.fromEmail);
          setSmtpFromName(config.fromName);
          setSmtpSecure(config.secure);
        }
      } catch {} finally {
        setLoadingSmtp(false);
      }
    };
    loadSmtp();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.patch('/auth/profile', { username, email });
      await loadProfile();
      toast.success('Perfil actualizado');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al actualizar perfil');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setChangingPassword(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      toast.success('Contraseña actualizada');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al cambiar contraseña');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smtpHost || !smtpUser || !smtpFromEmail) {
      toast.error('Host, usuario y email remitente son requeridos');
      return;
    }
    // Solo requerir contraseña si no hay configuración previa
    if (!smtpConfig && !smtpPass) {
      toast.error('La contraseña SMTP es requerida');
      return;
    }
    setSavingSmtp(true);
    try {
      const payload: any = {
        host: smtpHost,
        port: smtpPort,
        username: smtpUser,
        fromEmail: smtpFromEmail,
        fromName: smtpFromName,
        secure: smtpSecure,
        isEnabled: true,
      };
      // Solo enviar password si el usuario ingresó una nueva
      if (smtpPass) {
        payload.password = smtpPass;
      }
      const result = await smtpApi.upsert(payload);
      setSmtpConfig(result as any);
      toast.success('Configuración SMTP guardada');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al guardar SMTP');
    } finally {
      setSavingSmtp(false);
    }
  };

  const handleTestSmtp = async () => {
    setTestingSmtp(true);
    try {
      const result = await smtpApi.test();
      toast.success(result.message);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al enviar prueba');
    } finally {
      setTestingSmtp(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Configuración</h1>
        <p className="text-gray-400 mt-1">Administra tu perfil y preferencias</p>
      </div>

      {/* Profile Section */}
      <div className="bg-surface-100 rounded-xl border border-white/5 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-accent/10">
            <User size={20} className="text-accent-light" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Perfil</h2>
            <p className="text-sm text-gray-400">Actualiza tu información personal</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-surface-200 border border-white/5 rounded-lg text-gray-200 focus:outline-none focus:border-accent/50 transition-all"
                required
                minLength={3}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-surface-200 border border-white/5 rounded-lg text-gray-200 focus:outline-none focus:border-accent/50 transition-all"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <span className="text-sm text-gray-500">
              Rol: <span className="text-gray-300 capitalize">{user?.role}</span>
            </span>
            <span className="text-sm text-gray-500">
              Miembro desde: <span className="text-gray-300">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
              </span>
            </span>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>

      {/* SMTP Section */}
      <div className="bg-surface-100 rounded-xl border border-white/5 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Mail size={20} className="text-blue-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white">Notificaciones por Email (SMTP)</h2>
            <p className="text-sm text-gray-400">
              Configura el servidor SMTP para recibir alertas cuando un script falle
            </p>
          </div>
          {smtpConfig && (
            <span className="px-2 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Configurado
            </span>
          )}
        </div>

        {loadingSmtp ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-gray-400" />
          </div>
        ) : (
          <form onSubmit={handleSaveSmtp} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Servidor SMTP</label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder="smtp.gmail.com"
                  className="w-full px-3 py-2 bg-surface-200 border border-white/5 rounded-lg text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-accent/50 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Puerto</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(parseInt(e.target.value) || 587)}
                    className="w-full px-3 py-2 bg-surface-200 border border-white/5 rounded-lg text-gray-200 focus:outline-none focus:border-accent/50 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSmtpPort(587);
                      setSmtpSecure(false);
                    }}
                    className={`px-3 py-2 rounded-lg text-xs border transition-all ${
                      !smtpSecure && smtpPort === 587
                        ? 'bg-accent/10 text-accent-light border-accent/20'
                        : 'bg-surface-200 text-gray-400 border-white/5 hover:text-white'
                    }`}
                  >
                    STARTTLS
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSmtpPort(465);
                      setSmtpSecure(true);
                    }}
                    className={`px-3 py-2 rounded-lg text-xs border transition-all ${
                      smtpSecure && smtpPort === 465
                        ? 'bg-accent/10 text-accent-light border-accent/20'
                        : 'bg-surface-200 text-gray-400 border-white/5 hover:text-white'
                    }`}
                  >
                    SSL/TLS
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Usuario</label>
                <input
                  type="text"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full px-3 py-2 bg-surface-200 border border-white/5 rounded-lg text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-accent/50 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Contraseña</label>
                <input
                  type="password"
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                  placeholder={smtpConfig ? '•••••••• (dejar vacío para mantener)' : 'Contraseña SMTP'}
                  className="w-full px-3 py-2 bg-surface-200 border border-white/5 rounded-lg text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-accent/50 transition-all"
                  required={!smtpConfig}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Email Remitente</label>
                <input
                  type="email"
                  value={smtpFromEmail}
                  onChange={(e) => setSmtpFromEmail(e.target.value)}
                  placeholder="notificaciones@tudominio.com"
                  className="w-full px-3 py-2 bg-surface-200 border border-white/5 rounded-lg text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-accent/50 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Nombre Remitente</label>
                <input
                  type="text"
                  value={smtpFromName}
                  onChange={(e) => setSmtpFromName(e.target.value)}
                  placeholder="ScriptFlow"
                  className="w-full px-3 py-2 bg-surface-200 border border-white/5 rounded-lg text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-accent/50 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                {smtpConfig && (
                  <button
                    type="button"
                    onClick={handleTestSmtp}
                    disabled={testingSmtp}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                  >
                    {testingSmtp ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    {testingSmtp ? 'Enviando...' : 'Enviar prueba'}
                  </button>
                )}
                {smtpConfig && (
                  <span className="text-xs text-gray-500">
                    Se enviará un email de prueba a <strong className="text-gray-400">{user?.email}</strong>
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={savingSmtp}
                className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {savingSmtp ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Guardar SMTP
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Password Section */}
      <div className="bg-surface-100 rounded-xl border border-white/5 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-yellow-500/10">
            <Lock size={20} className="text-yellow-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Contraseña</h2>
            <p className="text-sm text-gray-400">Cambia tu contraseña de acceso</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Contraseña Actual</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 bg-surface-200 border border-white/5 rounded-lg text-gray-200 focus:outline-none focus:border-accent/50 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
              >
                {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Nueva Contraseña</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 bg-surface-200 border border-white/5 rounded-lg text-gray-200 focus:outline-none focus:border-accent/50 transition-all"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Confirmar Contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-surface-200 border border-white/5 rounded-lg text-gray-200 focus:outline-none focus:border-accent/50 transition-all"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={changingPassword}
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {changingPassword ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
              Cambiar Contraseña
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
