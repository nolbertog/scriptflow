import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Play,
  Save,
  ArrowLeft,
  Trash2,
  Loader2,
  Terminal,
  History,
  Star,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { scriptsApi } from '../api/scripts';
import { Script, Execution } from '../types';
import TerminalModal from '../components/TerminalModal';

const LANG_MAP: Record<string, string> = {
  bash: 'shell',
  python: 'python',
  javascript: 'javascript',
  powershell: 'powershell',
  php: 'php',
  go: 'go',
};

interface ScriptEditorProps {}

export default function ScriptEditor(props: ScriptEditorProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [script, setScript] = useState<Script | null>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('bash');
  const [executing, setExecuting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastExecution, setLastExecution] = useState<Execution | null>(null);
  const [showTerminal, setShowTerminal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const scriptId = parseInt(id!);

  const loadScript = useCallback(async () => {
    try {
      const s = await scriptsApi.getById(scriptId);
      setScript(s);
      setContent(s.content);
      setTitle(s.title);
      setLanguage(s.language);
    } catch {
      toast.error('Script no encontrado');
      navigate('/scripts');
    }
  }, [scriptId, navigate]);

  useEffect(() => {
    if (id) loadScript();
  }, [id, loadScript]);

  // Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [title, content, language]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await scriptsApi.update(scriptId, { title, content, language });
      setScript(updated);
      setHasChanges(false);
      toast.success('Script guardado');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleExecute = async () => {
    setExecuting(true);
    try {
      if (hasChanges) await handleSave();
      const result = await scriptsApi.execute(scriptId);
      setLastExecution(result);
      setShowTerminal(true);
    } catch (error: any) {
      toast.error('Error al ejecutar');
    } finally {
      setExecuting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este script?')) return;
    try {
      await scriptsApi.delete(scriptId);
      toast.success('Script eliminado');
      navigate('/scripts');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al eliminar');
    }
  };

  const loadLastExecution = async () => {
    try {
      const execs = await scriptsApi.getExecutions(scriptId);
      if (execs.length > 0) {
        setLastExecution(execs[0]);
        setShowTerminal(true);
      }
    } catch {
      toast.error('Error al cargar ejecuciones');
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const updated = await scriptsApi.update(scriptId, { isFavorite: !script?.isFavorite });
      setScript(prev => prev ? { ...prev, isFavorite: updated.isFavorite } : null);
      toast.success(updated.isFavorite ? 'Añadido a favoritos' : 'Eliminado de favoritos');
    } catch {
      toast.error('Error al actualizar');
    }
  };

  useEffect(() => {
    if (content !== (script?.content ?? '')) setHasChanges(true);
  }, [content, script?.content]);

  if (!script) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/scripts')}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setHasChanges(true); }}
              className="bg-transparent text-lg font-semibold text-white border-none outline-none focus:border-b focus:border-accent/50 px-1"
            />
            {script.folder && (
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: script.folder.color }} />
                {script.folder.name}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-lg transition-colors ${
              script.isFavorite ? 'text-yellow-400' : 'text-gray-400 hover:text-white'
            } hover:bg-white/5`}
          >
            <Star size={16} />
          </button>
          <button
            onClick={loadLastExecution}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <History size={16} />
            Última ejecución
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Editor and Output */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center gap-3 bg-surface-100 rounded-xl border border-white/5 px-4 py-2">
            <select
              value={language}
              onChange={(e) => { setLanguage(e.target.value); setHasChanges(true); }}
              className="bg-surface-200 border border-white/5 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-accent/50"
            >
              <option value="bash">Bash</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="powershell">PowerShell</option>
              <option value="php">PHP</option>
              <option value="go">Go</option>
            </select>

            <div className="flex-1" />

            <span className={`text-xs ${hasChanges ? 'text-yellow-400' : 'text-gray-500'}`}>
              {hasChanges ? 'Sin guardar' : 'Guardado'}
            </span>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-surface-200 text-gray-300 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Guardar
            </button>
            <button
              onClick={handleExecute}
              disabled={executing}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50"
            >
              {executing ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
              {executing ? 'Ejecutando...' : 'Ejecutar'}
            </button>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 rounded-xl overflow-hidden border border-white/5">
            <Editor
              height="100%"
              language={LANG_MAP[language] || 'shell'}
              value={content}
              onChange={(value) => setContent(value || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                automaticLayout: true,
                tabSize: 2,
                padding: { top: 12 },
                bracketPairColorization: { enabled: true },
              }}
            />
          </div>
        </div>

        {/* Terminal Modal */}
        <TerminalModal
          execution={lastExecution}
          isOpen={showTerminal}
          onClose={() => setShowTerminal(false)}
          title={title}
        />
      </div>
    </div>
  );
}
