import { useEffect, useState } from 'react';
import {
  Terminal,
  Plus,
  MoreVertical,
  Edit3,
  Trash2,
  Play,
  Loader2,
  Clock,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cronApi } from '../api/cron';
import { scriptsApi } from '../api/scripts';
import { CronJob, Script } from '../types';

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Mexico_City', 'America/Santiago', 'America/Sao_Paulo', 'America/Buenos_Aires',
  'Europe/London', 'Europe/Madrid', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow',
  'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Seoul', 'Asia/Kolkata', 'Asia/Dubai',
  'Australia/Sydney', 'Pacific/Auckland',
];

// Common cron expressions
const CRON_PRESETS = [
  { label: 'Cada 5 minutos', value: '*/5 * * * *' },
  { label: 'Cada 30 minutos', value: '*/30 * * * *' },
  { label: 'Cada hora', value: '0 * * * *' },
  { label: 'Cada 6 horas', value: '0 */6 * * *' },
  { label: 'Cada día (medianoche)', value: '0 0 * * *' },
  { label: 'Cada día (9 AM)', value: '0 9 * * *' },
  { label: 'Lunes a viernes (9 AM)', value: '0 9 * * 1-5' },
  { label: 'Cada lunes (3 AM)', value: '0 3 * * 1' },
  { label: 'Cada mes (día 1)', value: '0 0 1 * *' },
  { label: 'Cada 15 minutos (horario oficina)', value: '*/15 9-17 * * 1-5' },
];

const STATUS_BADGES: Record<string, { bg: string; text: string }> = {
  active: { bg: 'bg-green-500/10', text: 'text-green-400' },
  inactive: { bg: 'bg-gray-500/10', text: 'text-gray-400' },
};

export default function CronJobs() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<CronJob | null>(null);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    scriptId: 0,
    expression: '0 0 * * *',
    description: '',
    timezone: 'UTC',
    retryCount: 0,
  });

  const loadJobs = async () => {
    try {
      const [j, s] = await Promise.all([
        cronApi.list(),
        scriptsApi.list(),
      ]);
      setJobs(j);
      setScripts(s);
    } catch {
      toast.error('Error al cargar cron jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadJobs(); }, []);

  useEffect(() => {
    if (editingJob) {
      setForm({
        scriptId: editingJob.scriptId,
        expression: editingJob.expression,
        description: editingJob.description || '',
        timezone: editingJob.timezone,
        retryCount: editingJob.retryCount,
      });
    } else {
      setForm({
        scriptId: scripts[0]?.id || 0,
        expression: '0 0 * * *',
        description: '',
        timezone: 'UTC',
        retryCount: 0,
      });
    }
  }, [editingJob, scripts]);

  const handleSave = async () => {
    if (!form.scriptId) {
      toast.error('Selecciona un script');
      return;
    }
    setSaving(true);
    try {
      if (editingJob) {
        await cronApi.update(editingJob.id, form);
        toast.success('Cron job actualizado');
      } else {
        await cronApi.create(form);
        toast.success('Cron job creado');
      }
      setShowModal(false);
      setEditingJob(null);
      loadJobs();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (job: CronJob) => {
    try {
      await cronApi.update(job.id, { isActive: !job.isActive });
      toast.success(job.isActive ? 'Cron job pausado' : 'Cron job activado');
      loadJobs();
    } catch {
      toast.error('Error al actualizar');
    }
  };

  const deleteJob = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este cron job?')) return;
    try {
      await cronApi.delete(id);
      toast.success('Cron job eliminado');
      loadJobs();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const describeCron = (expr: string): string => {
    const parts = expr.split(' ');
    if (parts.length !== 5) return expr;
    const labels: string[] = [];
    if (parts[0] !== '0') labels.push(parts[0].startsWith('*/') ? `cada ${parts[0].slice(2)} min` : `min ${parts[0]}`);
    if (parts[1] !== '0' && parts[1] !== '*') labels.push(parts[1].startsWith('*/') ? `cada ${parts[1].slice(2)} h` : `h ${parts[1]}`);
    if (parts[2] !== '*' && parts[2] !== '0') labels.push(`día ${parts[2]}`);
    if (parts[3] !== '*') labels.push(`mes ${parts[3]}`);
    if (parts[4] !== '*') {
      const dayMap: Record<string, string> = { '0': 'dom', '1': 'lun', '2': 'mar', '3': 'mié', '4': 'jue', '5': 'vie', '6': 'sáb' };
      labels.push(parts[4].split(',').map(d => dayMap[d] || d).join(','));
    }
    return labels.join(', ') || 'cada minuto';
  };

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
          <h1 className="text-2xl font-bold text-white">Cron Jobs</h1>
          <p className="text-gray-400 mt-1">
            {jobs.length} tarea{jobs.length !== 1 ? 's' : ''} programada{jobs.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => { setEditingJob(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Nuevo Cron Job
        </button>
      </div>

      {/* Job Cards */}
      <div className="grid grid-cols-1 gap-4">
        {jobs.map((job) => {
          const badge = job.isActive ? STATUS_BADGES.active : STATUS_BADGES.inactive;
          return (
            <div
              key={job.id}
              className="bg-surface-100 rounded-xl border border-white/5 p-5 hover:border-white/10 transition-all relative group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-lg ${job.isActive ? 'bg-green-500/10' : 'bg-surface-200'}`}>
                    <Clock size={20} className={job.isActive ? 'text-green-400' : 'text-gray-500'} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-sm font-medium text-white">{job.script?.title || `Script #${job.scriptId}`}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                        {job.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5">
                      <code className="text-xs font-mono bg-surface-200 px-2 py-1 rounded text-accent-light">{job.expression}</code>
                      <span className="text-xs text-gray-500">{describeCron(job.expression)}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={10} />
                        {job.timezone}
                      </span>
                    </div>
                    {job.description && (
                      <p className="text-xs text-gray-500 mt-2">{job.description}</p>
                    )}
                    {job.lastRunAt && (
                      <p className="text-xs text-gray-600 mt-1">
                        Última ejecución: {new Date(job.lastRunAt).toLocaleString()}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                      <span>Reintentos: {job.retryCount}</span>
                      <span>Creado: {new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(job)}
                    className={`p-2 rounded-lg transition-colors ${
                      job.isActive ? 'text-green-400 hover:bg-green-500/10' : 'text-gray-500 hover:bg-white/5'
                    }`}
                    title={job.isActive ? 'Pausar' : 'Activar'}
                  >
                    {job.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  </button>
                  <button
                    onClick={() => { setEditingJob(job); setShowModal(true); }}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => deleteJob(job.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {jobs.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500">
            <Clock size={48} className="mb-3 opacity-30" />
            <p className="text-sm">No hay tareas programadas</p>
            <p className="text-xs text-gray-600 mt-1">Crea un cron job para ejecutar scripts automáticamente</p>
            <button
              onClick={() => { setEditingJob(null); setShowModal(true); }}
              className="mt-4 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} className="inline mr-1" />
              Crear primer cron job
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-surface-100 rounded-xl border border-white/10 p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-4">
              {editingJob ? 'Editar Cron Job' : 'Nuevo Cron Job'}
            </h2>

            <div className="space-y-4">
              {/* Script Select */}
              <div>
                <label className="block text-sm text-gray-300 mb-1">Script</label>
                <select
                  value={form.scriptId}
                  onChange={(e) => setForm({ ...form, scriptId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-surface-200 border border-white/5 rounded-lg text-gray-200 focus:outline-none focus:border-accent/50 transition-all"
                >
                  <option value={0}>Selecciona un script</option>
                  {scripts.map((s) => (
                    <option key={s.id} value={s.id}>{s.title} ({s.language})</option>
                  ))}
                </select>
              </div>

              {/* Cron Expression */}
              <div>
                <label className="block text-sm text-gray-300 mb-1">Expresión Cron</label>
                <input
                  type="text"
                  value={form.expression}
                  onChange={(e) => setForm({ ...form, expression: e.target.value })}
                  placeholder="* * * * *"
                  className="w-full px-3 py-2 bg-surface-200 border border-white/5 rounded-lg text-gray-200 font-mono focus:outline-none focus:border-accent/50 transition-all"
                />
              </div>

              {/* Presets */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">Presets rápidos:</label>
                <div className="flex flex-wrap gap-1.5">
                  {CRON_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => setForm({ ...form, expression: preset.value })}
                      className={`text-xs px-2 py-1 rounded border transition-colors ${
                        form.expression === preset.value
                          ? 'border-accent/30 bg-accent/10 text-accent-light'
                          : 'border-white/5 text-gray-400 hover:border-white/10 hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-gray-300 mb-1">Descripción (opcional)</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Qué hace esta tarea?"
                  className="w-full px-3 py-2 bg-surface-200 border border-white/5 rounded-lg text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-accent/50 transition-all"
                />
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-sm text-gray-300 mb-1">Zona Horaria</label>
                <select
                  value={form.timezone}
                  onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-200 border border-white/5 rounded-lg text-gray-200 focus:outline-none focus:border-accent/50 transition-all"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>

              {/* Retry Count */}
              <div>
                <label className="block text-sm text-gray-300 mb-1">Reintentos automáticos</label>
                <select
                  value={form.retryCount}
                  onChange={(e) => setForm({ ...form, retryCount: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-surface-200 border border-white/5 rounded-lg text-gray-200 focus:outline-none focus:border-accent/50 transition-all"
                >
                  {[0, 1, 2, 3, 5].map((n) => (
                    <option key={n} value={n}>{n === 0 ? 'Sin reintentos' : `${n} reintento${n > 1 ? 's' : ''}`}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editingJob ? 'Guardar Cambios' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
