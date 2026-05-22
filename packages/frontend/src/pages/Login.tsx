import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('¡Bienvenido a ScriptFlow!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen bg-surface-300 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fadeIn">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
              <Code2 size={28} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">ScriptFlow</h1>
          <p className="text-gray-400 mt-1">Plataforma de gestión de scripts</p>
        </div>

        {/* Form */}
        <div className="bg-surface-100 rounded-xl border border-white/5 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-2.5 bg-surface-200 border border-white/5 rounded-lg text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-10 bg-surface-200 border border-white/5 rounded-lg text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-accent-light hover:text-accent-hover transition-colors">
              Registrarse
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 p-3 rounded-lg bg-surface-200/50 border border-white/5">
            <p className="text-xs text-gray-400 mb-2">Credenciales de demo:</p>
            <p className="text-xs text-gray-500">
              Admin: <span className="text-gray-300">admin@scriptflow.com</span> / <span className="text-gray-300">admin123</span>
            </p>
            <p className="text-xs text-gray-500">
              Dev: <span className="text-gray-300">dev@scriptflow.com</span> / <span className="text-gray-300">dev123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
