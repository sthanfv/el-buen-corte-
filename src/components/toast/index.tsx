'use client';
import { X, Check, AlertTriangle, Info } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { ToastProps } from './use-toast';

const ICONS: Record<string, React.ReactNode> = {
  SUCCESS: <Check />,
  ERROR: <X />,
  WARNING: <AlertTriangle />,
  INFO: <Info />,
};

const PATHS: Record<string, string> = {
  SUCCESS: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  ERROR: 'M18 6L6 18M6 6l12 12',
  WARNING:
    'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  INFO: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
};

const COLORS: Record<string, string> = {
  SUCCESS: 'bg-green-900/50 text-green-300',
  ERROR: 'bg-red-900/50 text-red-300',
  WARNING: 'bg-yellow-900/50 text-yellow-300',
  INFO: 'bg-blue-900/50 text-blue-300',
};

const PROGRESS_COLORS: Record<string, string> = {
  SUCCESS: 'bg-green-500',
  ERROR: 'bg-red-500',
  WARNING: 'bg-yellow-500',
  INFO: 'bg-blue-500',
};

export const Toast: React.FC<ToastProps> = ({
  id,
  type = 'INFO',
  title,
  message,
  duration = 4000,
  isVisible,
  onDismiss,
}) => {
  const pathRef = useRef<SVGPathElement>(null);
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    setShow(isVisible);
  }, [isVisible]);

  useEffect(() => {
    if (show && pathRef.current) {
      const pathElement = pathRef.current;
      pathElement.setAttribute('d', PATHS[type]);
      const length = pathElement.getTotalLength();
      pathElement.style.strokeDasharray = `${length}`;
      pathElement.style.strokeDashoffset = `${length}`;
      // Trigger reflow to apply initial state before animation
      pathElement.getBoundingClientRect();
      // Start animation
      pathElement.style.strokeDashoffset = '0';
    }
  }, [type, show]);

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss(id);
    }
  };

  const toastStyle = {
    '--toast-duration': `${duration}ms`,
  } as React.CSSProperties;

  return (
    <div
      style={toastStyle}
      className={cn(
        'fixed bottom-6 right-6 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 sm:bottom-6 rounded-xl overflow-hidden shadow-2xl transition-transform duration-500 ease-in-out w-full max-w-sm z-[9999]',
        show ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0',
        'ring-1 ring-gray-800/50'
      )}
    >
      <div className={cn('flex items-start p-4 space-x-4 bg-gray-950')}>
        <div className="flex-shrink-0 pt-0.5">
          <div className={cn('p-2 rounded-full shadow-inner', COLORS[type])}>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                ref={pathRef}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={PATHS[type]}
                className={'animate-draw-path'}
              ></path>
            </svg>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-base text-white font-extrabold leading-snug engraved-text">
            {title}
          </p>
          <p className="text-sm text-gray-400 mt-1">{message}</p>
        </div>

        <button
          onClick={handleDismiss}
          type="button"
          className="flex-shrink-0 -mr-1 p-1 rounded-full text-gray-500 hover:bg-gray-800 hover:text-white transition"
          aria-label="Cerrar notificación"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="h-1 bg-black rounded-b-xl overflow-hidden">
        <div
          className={cn(
            'h-full opacity-80 toast-progress-bar',
            PROGRESS_COLORS[type]
          )}
        ></div>
      </div>
    </div>
  );
};
