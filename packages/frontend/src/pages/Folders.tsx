import { useEffect, useState } from 'react';
import {
  Plus,
  Folder as FolderIcon,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Edit3,
  Trash2,
  Loader2,
  FileCode,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { foldersApi } from '../api/folders';
import { Folder } from '../types';
import { useNavigate } from 'react-router-dom';

const FOLDER_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#22c55e',
  '#14b8a6', '#3b82f6', '#6366f1', '#8b5cf6',
  '#ec4899', '#64748b',
];

const FOLDER_ICONS = ['folder', 'cloud', 'database', 'server', 'shield'];

export default function Folders() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newFolder, setNewFolder] = useState({ name: '', color: '#6366f1', parentId: undefined as number | undefined });
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [editingFolder, setEditingFolder] = useState<{ id: number; name: string } | null>(null);
  const navigate = useNavigate();

  const loadFolders = async () => {
    try {
      const data = await foldersApi.tree();
      setFolders(data);
    } catch {
      toast.error('Error al cargar carpetas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFolders();
  }, []);

  const createFolder = async () => {
    if (!newFolder.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    try {
      await foldersApi.create(newFolder);
      toast.success('Carpeta creada');
      setShowNewModal(false);
      setNewFolder({ name: '', color: '#6366f1', parentId: undefined });
      loadFolders();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al crear');
    }
  };

  const deleteFolder = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta carpeta y sus subcarpetas?')) return;
    try {
      await foldersApi.delete(id);
      toast.success('Carpeta eliminada');
      loadFolders();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al eliminar');
    }
  };

  const updateFolderName = async (id: number, name: string) => {
    try {
      await foldersApi.update(id, { name });
      toast.success('Carpeta renombrada');
      setEditingFolder(null);
      loadFolders();
    } catch (error: any) {
      toast.error('Error al renombrar');
    }
  };

  const toggleExpand = (id: number) => {
    const newSet = new Set(expandedFolders);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedFolders(newSet);
  };

  const renderFolderTree = (items: Folder[], depth = 0) => {
    if (!items?.length) return null;

    return items.map((folder) => {
      const isExpanded = expandedFolders.has(folder.id);
      const hasChildren = folder.children && folder.children.length > 0;

      return (
        <div key={folder.id}>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer"
            style={{ marginLeft: depth * 20 }}
          >
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(folder.id)}
                className="text-gray-400 hover:text-white"
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            ) : (
              <div className="w-4" />
            )}

            <div
              className="flex-1 flex items-center gap-2"
              onClick={() => navigate(`/scripts?folderId=${folder.id}`)}
            >
              <FolderIcon size={16} style={{ color: folder.color }} />
              {editingFolder?.id === folder.id ? (
                <input
                  type="text"
                  value={editingFolder.name}
                  onChange={(e) => setEditingFolder({ ...editingFolder, name: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') updateFolderName(folder.id, editingFolder.name);
                    if (e.key === 'Escape') setEditingFolder(null);
                  }}
                  onBlur={() => updateFolderName(folder.id, editingFolder.name)}
                  className="flex-1 bg-surface-200 border border-accent/50 rounded px-1 py-0.5 text-sm text-white outline-none"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <>
                  <span className="text-sm text-gray-200 flex-1">{folder.name}</span>
                  {folder._count && (
                    <span className="text-xs text-gray-500">{folder._count.scripts}</span>
                  )}
                </>
              )}
            </div>

            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingFolder({ id: folder.id, name: folder.name });
                }}
                className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/5"
              >
                <Edit3 size={12} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteFolder(folder.id);
                }}
                className="p-1 rounded text-gray-400 hover:text-red-400 hover:bg-red-500/10"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {hasChildren && isExpanded && (
            <div>
              {renderFolderTree(folder.children!, depth + 1)}
            </div>
          )}
        </div>
      );
    });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Carpetas</h1>
          <p className="text-gray-400 mt-1">Organiza tus scripts en carpetas</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Nueva Carpeta
        </button>
      </div>

      {/* Folder Tree */}
      <div className="bg-surface-100 rounded-xl border border-white/5 p-4">
        {folders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <FolderIcon size={48} className="mb-3 opacity-30" />
            <p className="text-sm">No hay carpetas</p>
            <button
              onClick={() => setShowNewModal(true)}
              className="mt-2 text-sm text-accent-light hover:text-accent-hover transition-colors"
            >
              Crear la primera
            </button>
          </div>
        ) : (
          renderFolderTree(folders)
        )}
      </div>

      {/* New Folder Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowNewModal(false)}>
          <div className="bg-surface-100 rounded-xl border border-white/10 p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-4">Nueva Carpeta</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Nombre</label>
                <input
                  type="text"
                  value={newFolder.name}
                  onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                  placeholder="Nombre de la carpeta"
                  className="w-full px-3 py-2 bg-surface-200 border border-white/5 rounded-lg text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-accent/50 transition-all"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Color</label>
                <div className="flex gap-2">
                  {FOLDER_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewFolder({ ...newFolder, color })}
                      className={`w-8 h-8 rounded-lg transition-all ${
                        newFolder.color === color ? 'ring-2 ring-white ring-offset-1 ring-offset-surface-100 scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Subcarpeta de (opcional)</label>
                <select
                  value={newFolder.parentId || ''}
                  onChange={(e) => setNewFolder({ ...newFolder, parentId: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-3 py-2 bg-surface-200 border border-white/5 rounded-lg text-gray-200 focus:outline-none focus:border-accent/50 transition-all"
                >
                  <option value="">Ninguna (raíz)</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
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
                onClick={createFolder}
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
