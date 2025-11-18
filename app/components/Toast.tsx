'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Card } from '@/app/ui/Card';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

const iconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
};

const iconColorMap = {
  success: 'text-green-600',
  error: 'text-red-600',
  info: 'text-blue-600',
  warning: 'text-amber-600',
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 4000) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-16 md:top-4 right-2 md:right-4 left-2 md:left-auto z-500 flex flex-col gap-2 pointer-events-none max-w-md md:max-w-none">
        {toasts.map(toast => {
          const Icon = iconMap[toast.type];
          return (
            <Card
              key={toast.id}
              className={`${colorMap[toast.type]} border-2 shadow-lg p-3 md:p-4 w-full md:min-w-[320px] pointer-events-auto animate-in slide-in-from-right duration-300`}
            >
              <div className="flex items-start gap-2 md:gap-3">
                <Icon className={`w-4 h-4 md:w-5 md:h-5 ${iconColorMap[toast.type]} flex-shrink-0 mt-0.5`} />
                <p className="flex-1 text-xs md:text-sm font-medium break-words">{toast.message}</p>
                <button
                  onClick={() => removeToast(toast.id)}
                  className={`${iconColorMap[toast.type]} hover:opacity-70 transition-opacity flex-shrink-0`}
                  aria-label="Close notification"
                >
                  <X className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

