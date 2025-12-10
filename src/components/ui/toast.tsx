'use client';
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';
import { createPortal } from 'react-dom';
import { Check, X, AlertTriangle, ShieldAlert } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

export type ToastOptions = {
  id?: string;
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number;
};

type ToastItem = Required<
  Pick<ToastOptions, 'id' | 'title' | 'message' | 'type' | 'duration'>
>;

type ToastContextValue = {
  toast: (opts: ToastOptions) => string;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

function genId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
    return crypto.randomUUID();
  return `${Date.now()}-${Math.random()}`;
}

export const ToastProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const removeToast = useCallback(
    (id: string) => setToasts((t) => t.filter((x) => x.id !== id)),
    []
  );

  const toast = useCallback((opts: ToastOptions) => {
    const id = opts.id || genId();
    const item: ToastItem = {
      id,
      title: opts.title || '',
      message: opts.message,
      type: opts.type || 'info',
      duration: typeof opts.duration === 'number' ? opts.duration : 4500,
    };
    setToasts((prev) => [item, ...prev].slice(0, 6));
    return id;
  }, []);

  const ctx = useMemo(() => ({ toast, removeToast }), [toast, removeToast]);

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {isMounted && <ToastViewport toasts={toasts} onRemove={removeToast} />}
    </ToastContext.Provider>
  );
};

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx)
    throw new Error('useToastContext debe usarse dentro de ToastProvider');
  return ctx;
}

/* Viewport + Card */
const ToastViewport: React.FC<{
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}> = ({ toasts, onRemove }) => {
  const el =
    typeof document !== 'undefined'
      ? document.getElementById('toast-root')
      : null;
  if (!el && typeof document !== 'undefined') {
    const newEl = document.createElement('div');
    newEl.id = 'toast-root';
    document.body.appendChild(newEl);
    return createPortal(
      <div className="fixed bottom-5 right-5 z-[999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={() => onRemove(t.id)} />
        ))}
      </div>,
      newEl
    );
  }

  if (el) {
    return createPortal(
      <div className="fixed bottom-5 right-5 z-[999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={() => onRemove(t.id)} />
        ))}
      </div>,
      el
    );
  }

  return null;
};

const ToastCard: React.FC<{ toast: ToastItem; onClose: () => void }> = ({
  toast,
  onClose,
}) => {
  const [progress, setProgress] = useState(100);
  const [visible, setVisible] = useState(false);
  const [iconVisible, setIconVisible] = useState(false);

  useEffect(() => {
    const enter = setTimeout(() => {
      setVisible(true);
      setIconVisible(true);
    }, 20);
    const tickMs = Math.max(8, Math.floor(toast.duration / 120));
    const id = setInterval(() => {
      setProgress((p) => {
        if (p <= 0) {
          clearInterval(id);
          setVisible(false);
          setTimeout(onClose, 320);
          return 0;
        }
        return p - 0.8;
      });
    }, tickMs);
    return () => {
      clearTimeout(enter);
      clearInterval(id);
    };
  }, [toast.duration, onClose]);

  const baseColor =
    toast.type === 'success'
      ? 'bg-green-900/90 border-green-500/50 text-white'
      : toast.type === 'warning'
        ? 'bg-yellow-900/90 border-yellow-500/70 text-white'
        : toast.type === 'error'
          ? 'bg-red-900/90 border-red-500/50 text-white'
          : 'bg-white/90 text-gray-900';

  const barColor =
    toast.type === 'success'
      ? 'bg-green-400'
      : toast.type === 'warning'
        ? 'bg-yellow-400'
        : toast.type === 'error'
          ? 'bg-red-400'
          : 'bg-blue-400';
  const icon =
    toast.type === 'success' ? (
      <Check size={20} className="text-green-300" />
    ) : toast.type === 'warning' ? (
      <AlertTriangle size={20} className="text-yellow-300" />
    ) : toast.type === 'error' ? (
      <ShieldAlert size={20} className="text-red-300" />
    ) : (
      <Check size={20} className="text-blue-300" />
    );

  return (
    <div
      className={`pointer-events-auto px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border flex items-start gap-4 transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'} ${baseColor}`}
      style={{ minWidth: 300, maxWidth: 360, position: 'relative' }}
    >
      <div
        className={`transition-transform duration-300 ${iconVisible ? 'scale-100' : 'scale-75 opacity-0'}`}
      >
        {icon}
      </div>
      <div className="flex-1">
        {toast.title && <div className="text-sm font-bold">{toast.title}</div>}
        <div className="text-sm opacity-90">{toast.message}</div>
      </div>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }}
        className="ml-4 hover:opacity-70"
      >
        <X size={16} />
      </button>
      <div
        className={`absolute bottom-0 left-0 h-[3px] ${barColor} transition-all duration-75`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
