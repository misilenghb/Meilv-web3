"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: Toast["type"], duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast["type"] = "info", duration = 3000) => {
    const id = Math.random().toString(36).slice(2);
    const toast: Toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);
    
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const getToastStyles = (type: Toast["type"]) => {
    const baseStyles = "glass rounded-lg p-4 shadow-lg border-l-4 transition-all duration-300";
    const typeStyles = {
      success: "border-l-green-500 bg-green-500/10",
      error: "border-l-red-500 bg-red-500/10",
      warning: "border-l-yellow-500 bg-yellow-500/10",
      info: "border-l-blue-500 bg-blue-500/10"
    };
    return `${baseStyles} ${typeStyles[type]}`;
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={getToastStyles(toast.type)}
            onClick={() => removeToast(toast.id)}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm">{toast.message}</span>
              <button 
                className="ml-3 text-lg opacity-60 hover:opacity-100"
                onClick={() => removeToast(toast.id)}
                aria-label="关闭"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
