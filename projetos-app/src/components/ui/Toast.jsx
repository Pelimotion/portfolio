import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, Loader2 } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 w-80 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl animate-in slide-in-from-right-10 fade-in-0 duration-300 ${
              t.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
              t.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
              t.type === 'info' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
              'bg-card border-border text-foreground'
            }`}
          >
            <div className="shrink-0">
              {t.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5" />}
              {t.type === 'info' && <Info className="w-5 h-5" />}
              {t.type === 'loading' && <Loader2 className="w-5 h-5 animate-spin" />}
            </div>
            <p className="text-xs font-semibold flex-1 leading-relaxed">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="p-1 hover:bg-black/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 opacity-40" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
