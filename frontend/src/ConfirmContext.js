import React, { createContext, useContext, useState, useCallback } from 'react';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({ show: false, title: '', message: '', resolve: null });

  const openConfirm = useCallback(({ title = 'Confirm', message = '' }) => {
    return new Promise((resolve) => {
      setState({ show: true, title, message, resolve });
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    if (state.resolve) state.resolve(true);
    setState({ show: false, title: '', message: '', resolve: null });
  }, [state]);

  const handleCancel = useCallback(() => {
    if (state.resolve) state.resolve(false);
    setState({ show: false, title: '', message: '', resolve: null });
  }, [state]);

  return (
    <ConfirmContext.Provider value={openConfirm}>
      {children}
      {state.show && (
        <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.35)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{state.title}</h5>
              </div>
              <div className="modal-body">
                <p>{state.message}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-danger" onClick={handleConfirm}>OK</button>
                <button className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
}

export default ConfirmContext;
