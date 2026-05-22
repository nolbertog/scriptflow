import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Code2,
  MoreVertical,
  Play,
  Edit3,
  Trash2,
  FolderOpen,
  Star,
  Search,
  Loader2,
  FileCode,
  Lock,
  Globe,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { scriptsApi } from '../api/scripts';
import { foldersApi } from '../api/folders';
import { useUiStore } from '../store/uiStore';
import { Script, Folder, Execution } from '../types';
import TerminalModal from '../components/TerminalModal';

const LANG_ICONS: Record<string, string> = {
  bash: '🐚',
  python: '🐍',
  javascript: '🟨',
  powershell: '🪟',
  php: '🐘',
  go: '🔵',
};

export default function Scripts() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<number | undefined>();
  const [showNewModal, setShowNewModal] = useState(false);
  const [newScript, setNewScript] = useState({ title: '', language: 'bash', description: '' });
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [executingId, setExecutingId] = useState<number | null>(null);
  const [terminalExec, setTerminalExec] = useState<{ execution: Execution; title: string } | null>(null);
  const searchQuery = useUiStore((s) => s.searchQuery);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const [s, f] = await Promise.all([
        scriptsApi.list({ folderId: selectedFolder, search: searchQuery || undefined }),
        foldersApi.list(),
      ]);
      setScripts(s);
      setFolders(f);
    } catch (error) {
      toast.error('Error al cargar scripts');
    } finally {
      setLoading(false);
    }
  };

  // Close menu on click outside
  useEffect(() => {
    const handleClick = () => setMenuOpen(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedFolder, searchQuery]);

  const createScript = async () => {
    if (!newScript.title.trim()) {
      toast.error('El título es requerido');
      return;
    }
    try {
      const script = await scriptsApi.create(newScript);
      toast.success('Script creado');
      setShowNewModal(false);
      setNewScript({ title: '', language: 'bash', description: '' });
      navigate(`/scripts/${script.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al crear script');
    }
  };

  const deleteScript = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este script?')) return;
    try {
      await scriptsApi.delete(id);
      toast.success('Script eliminado');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al eliminar');
    }
  };

  const executeScript = async (id: number) => {
    const script = scripts.find(s => s.id === id);
    setExecutingId(id);
    try {
      const result = await scriptsApi.execute(id);
      setTerminalExec({ execution: result, title: script?.title || 'Script' });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al ejecutar script');
    } finally {
      setExecutingId(null);
    }
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
          <h1 className="text-2xl font-bold text-white">Scripts</h1>
          <p className="text-gray-400 mt-1">
            {scripts.length} script{scripts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Nuevo Script
        </button>
      </div>

      {/* Folder Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedFolder(undefined)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
            !selectedFolder
              ? 'bg-accent/10 text-accent-light border border-accent/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <FolderOpen size={14} />
          Todos
        </button>
        {folders.map((folder) => (
          <button
            key={folder.id}
            onClick={() => setSelectedFolder(folder.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
              selectedFolder === folder.id
                ? 'bg-accent/10 text-accent-light border border-accent/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: folder.color }} />
            {folder.name}
          </button>
        ))}
      </div>

      {/* Scripts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scripts.map((script) => (
          <div
            key={script.id}
            className="group bg-surface-100 rounded-xl border border-white/5 p-5 hover:border-white/10 transition-all relative"
          >
            {/* Actions Menu */}
            <div className="absolute top-3 right-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(menuOpen === script.id ? null : script.id);
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100"
              >
                <MoreVertical size={14} />
              </button>
              {menuOpen === script.id && (
                <div className="absolute right-0 top-8 w-36 bg-surface-200 rounded-lg border border-white/10 shadow-xl py-1 z-10">
                  <button
                    onClick={() => { navigate(`/scripts/${script.id}`); setMenuOpen(null); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors"
                  >
                    <Edit3 size={14} />
                    Editar
                  </button>
                  <button
                    onClick={() => { executeScript(script.id); setMenuOpen(null); }}
                    disabled={executingId === script.id}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors"
                  >
                    <Play size={14} />
                    Ejecutar
                  </button>
                  <button
                    onClick={() => { deleteScript(script.id); setMenuOpen(null); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={14} />
                    Eliminar
                  </button>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="cursor-pointer" onClick={() => navigate(`/scripts/${script.id}`)}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-surface-200">
                  <FileCode size={18} className="text-accent-light" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white truncate flex items-center gap-2">
                    {script.title}
                    {script.isLocked && <Lock size={12} className="text-gray-500" />}
                  </h3>
                  {script.folder && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: script.folder.color }} />
                      {script.folder.name}
                    </p>
                  )}
                </div>
              </div>

              {script.description && (
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{script.description}</p>
              )}

              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{LANG_ICONS[script.language] || '📄'} {script.language}</span>
                <span>{new Date(script.updatedAt).toLocaleDateString()}</span>
                {script.isFavorite && <Star size={12} className="text-yellow-400" />}
              </div>
            </div>

            {/* Execute Button */}
            <button
              onClick={(e) => { e.stopPropagation(); executeScript(script.id); }}
              disabled={executingId === script.id}
              className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-accent/10 text-accent-light hover:bg-accent/20 transition-colors disabled:opacity-50"
            >
              {executingId === script.id ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Play size={14} />
              )}
              {executingId === script.id ? 'Ejecutando...' : 'Ejecutar'}
            </button>
          </div>
        ))}

        {scripts.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
            <FileCode size={48} className="mb-3 opacity-30" />
            <p className="text-sm">No hay scripts</p>
            <button
              onClick={() => setShowNewModal(true)}
              className="mt-2 text-sm text-accent-light hover:text-accent-hover transition-colors"
            >
              Crear el primero
            </button>
          </div>
        )}
      </div>

      {/* Terminal Modal */}
      <TerminalModal
        execution={terminalExec?.execution ?? null}
        isOpen={!!terminalExec}
        onClose={() => setTerminalExec(null)}
        title={terminalExec?.title}
      />

      {/* New Script Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowNewModal(false)}>
          <div className="bg-surface-100 rounded-xl border border-white/10 p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-4">Nuevo Script</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Título</label>
                <input
                  type="text"
                  value={newScript.title}
                  onChange={(e) => setNewScript({ ...newScript, title: e.target.value })}
                  placeholder="Mi script"
                  className="w-full px-3 py-2 bg-surface-200 border border-white/5 rounded-lg text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-accent/50 transition-all"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Lenguaje</label>
                <select
                  value={newScript.language}
                  onChange={(e) => setNewScript({ ...newScript, language: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-200 border border-white/5 rounded-lg text-gray-200 focus:outline-none focus:border-accent/50 transition-all"
                >
                  <option value="bash">Bash</option>
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="powershell">PowerShell</option>
                  <option value="php">PHP</option>
                  <option value="go">Go</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Descripción (opcional)</label>
                <input
                  type="text"
                  value={newScript.description}
                  onChange={(e) => setNewScript({ ...newScript, description: e.target.value })}
                  placeholder="Breve descripción"
                  className="w-full px-3 py-2 bg-surface-200 border border-white/5 rounded-lg text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-accent/50 transition-all"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={createScript}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
