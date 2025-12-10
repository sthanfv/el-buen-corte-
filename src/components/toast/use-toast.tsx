'use client';
import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { Toast } from './index';

export type ToastType = 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
  isVisible: boolean;
  onDismiss: (id: string) => void;
}

interface ToastOptions {
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
});

interface ToastStateItem extends ToastOptions {
  id: string;
}

interface ToastState {
  toasts: ToastStateItem[];
}

type Action =
  | { type: 'ADD_TOAST'; payload: ToastStateItem }
  | { type: 'DISMISS_TOAST'; payload: { id: string } };

const toastReducer = (state: ToastState, action: Action): ToastState => {
  switch (action.type) {
    case 'ADD_TOAST':
      // Limit to 1 toast at a time
      return { toasts: [action.payload] };
    case 'DISMISS_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload.id),
      };
    default:
      return state;
  }
};

const ToastControllerContext = createContext<{
  toasts: ToastStateItem[];
  onDismiss: (id: string) => void;
} | null>(null);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] });

  const toast = useCallback((options: ToastOptions) => {
    const id = new Date().toISOString() + Math.random();
    dispatch({ type: 'ADD_TOAST', payload: { ...options, id } });
  }, []);

  const onDismiss = useCallback((id: string) => {
    dispatch({ type: 'DISMISS_TOAST', payload: { id } });
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastControllerContext.Provider
        value={{ toasts: state.toasts, onDismiss }}
      >
        {children}
      </ToastControllerContext.Provider>
    </ToastContext.Provider>
  );
};

export const ToastController: React.FC = () => {
  const context = useContext(ToastControllerContext);
  // Context check removed from here to allow hooks to run

  const { toasts, onDismiss } = context || { toasts: [], onDismiss: () => {} };
  const [visibleToasts, setVisibleToasts] = useState<ToastStateItem[]>([]);

  useEffect(() => {
    if (!context) return;

    if (toasts.length > 0) {
      setVisibleToasts(toasts);
      const toast = toasts[0];
      const timer = setTimeout(() => {
        onDismiss(toast.id);
      }, toast.duration || 4000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setVisibleToasts([]), 500); // Wait for fade-out animation
      return () => clearTimeout(timer);
    }
  }, [toasts, onDismiss, context]);

  if (!context) return null;

  return (
    <div className="fixed bottom-0 right-0 z-50 p-6">
      {visibleToasts.map((toastProps) => (
        <Toast
          key={toastProps.id}
          {...toastProps}
          isVisible={toasts.some((t) => t.id === toastProps.id)}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
};

export const useToast = () => {
  return useContext(ToastContext);
};
