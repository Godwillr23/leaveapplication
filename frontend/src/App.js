import React, { useEffect, useState, useCallback } from 'react';
import Login from './components/Login';
import EmployeeDashboard from './components/EmployeeDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import HRDashboard from './components/HRDashboard';
import { setLogoutHandler, clearLogoutHandler } from './auth';
// notifications removed per request

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('la_user')) || null;
    } catch { return null; }
  });

  useEffect(() => {
    if (user) localStorage.setItem('la_user', JSON.stringify(user));
    else localStorage.removeItem('la_user');
  }, [user]);

  const logout = useCallback(() => setUser(null), []);

  useEffect(() => {
    setLogoutHandler(logout);
    return () => clearLogoutHandler();
  }, [logout]);

  return (
    <div>
      <nav className="navbar navbar-light bg-white shadow-sm">
        <div className="container d-flex justify-content-between align-items-center">
          <a className="navbar-brand" href="#"><i className="bi bi-calendar-check-fill me-2" style={{color:'var(--primary)'}}></i>Leave Application</a>
          {user ? (
            <div className="d-flex align-items-center">
              <div className="me-3 text-end d-none d-sm-block">
                <div className="fw-bold">{user.name}</div>
                <small className="text-muted">{user.role}</small>
              </div>
              <button className="btn btn-outline-secondary btn-sm btn-full-sm" onClick={logout}><i className="bi bi-box-arrow-right me-1"></i>Logout</button>
            </div>
          ) : null}
        </div>
      </nav>

      <main className="container container-app">
        <div className="app-shell">
          <div className="app-body-card card app-body-card shadow-sm">
            <div className="card-body">
              {!user ? (
                <Login onLogin={setUser} />
              ) : (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h4 className="mb-0">Welcome back</h4>
                      <div className="text-muted">Manage your leaves quickly</div>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold">{user?.name}</div>
                      <small className="text-muted">{user?.role}</small>
                    </div>
                  </div>
                  {user.role === 'employee' && <EmployeeDashboard user={user} />}
                  {user.role === 'manager' && <ManagerDashboard user={user} />}
                  {user.role === 'hr' && <HRDashboard user={user} />}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
