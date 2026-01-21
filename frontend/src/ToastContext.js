import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = 'info', timeout = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type }]);
    if (timeout > 0) setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), timeout);
  }, []);

  const remove = useCallback((id) => setToasts(t => t.filter(x => x.id !== id)), []);

  return (
    <ToastContext.Provider value={{ show, remove }}>
      {children}
      <div className="toast-wrapper" style={{ position: 'fixed', top: 16, right: 16, zIndex: 1050 }}>
        {toasts.map(toast => (
          <div key={toast.id} className={`alert alert-${toast.type === 'error' ? 'danger' : toast.type} shadow-sm`} role="alert" style={{ minWidth: 260, marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>{toast.message}</div>
              <button className="btn btn-sm btn-link text-muted" onClick={() => remove(toast.id)} style={{ textDecoration: 'none' }}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx.show;
}

export default ToastContext;
