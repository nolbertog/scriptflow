import { useEffect, useRef } from 'react';
import { X, Terminal, CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react';
import { Execution } from '../types';

interface TerminalModalProps {
  execution: Execution | null;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export default function TerminalModal({ execution, isOpen, onClose, title }: TerminalModalProps) {
  const outputRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [execution?.output, execution?.error]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !execution) return null;

  const getStatusBadge = () => {
    switch (execution.status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-green-500/15 text-green-400 border border-green-500/20">
            <CheckCircle2 size={12} />
            Completado
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">
            <XCircle size={12} />
            Error
          </span>
        );
      case 'running':
        return (
          <span className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">
            <Loader2 size={12} className="animate-spin" />
            Ejecutando...
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-gray-500/15 text-gray-400 border border-gray-500/20">
            <Clock size={12} />
            Pendiente
          </span>
        );
    }
  };

  const hasOutput = execution.output?.trim() || execution.error?.trim();

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-surface-100 rounded-xl border border-white/10 shadow-2xl w-full max-w-3xl mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-surface-200/50">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-surface-200 border border-white/5 flex items-center justify-center">
              <Terminal size={14} className="text-accent-light" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">
                {title || 'Ejecución de Script'}
              </h3>
              <p className="text-xs text-gray-500">
                {execution.duration
                  ? `Completado en ${(execution.duration / 1000).toFixed(2)}s`
                  : 'Ejecutando...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {getStatusBadge()}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="relative">
          {/* Terminal chrome bar */}
          <div className="flex items-center gap-2 px-5 py-2 bg-black/40 border-b border-white/5">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
            </div>
            <span className="text-xs text-gray-600 ml-2 font-mono">
              {execution.status === 'running' ? 'Proceso activo' : 'Proceso terminado'} — exit code {execution.status === 'completed' ? '0' : '1'}
            </span>
          </div>

          {/* Output */}
          <div className="bg-black/70 min-h-[300px] max-h-[500px] overflow-y-auto">
            {hasOutput ? (
              <pre
                ref={outputRef}
                className="p-5 font-mono text-sm leading-relaxed whitespace-pre-wrap break-all"
              >
                {execution.output && (
                  <span className="text-green-400/90">
                    {'$ '}{execution.output}
                  </span>
                )}
                {execution.error && (
                  <span className="text-red-400/90 block mt-2">
                    {'✗ '}{execution.error}
                  </span>
                )}
              </pre>
            ) : execution.status === 'running' ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="flex items-center gap-3 text-gray-500">
                  <Loader2 size={20} className="animate-spin text-accent-light" />
                  <span className="text-sm font-mono">Ejecutando script...</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <span className="text-sm font-mono text-gray-600">
                  {execution.status === 'completed'
                    ? '✓ Script ejecutado sin salida'
                    : 'Sin salida disponible'}
                </span>
              </div>
            )}

            {/* Blinking cursor animation */}
            {execution.status === 'running' && (
              <span className="inline-block w-2 h-4 bg-green-400/70 ml-1 animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
