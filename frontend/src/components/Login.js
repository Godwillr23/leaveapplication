import React, { useState } from 'react';
import API from '../api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('employee@company.com');
  const [password, setPassword] = useState('password');
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    setErr(null);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErr('Please enter a valid email');
      return false;
    }
    if (!password || password.length < 4) {
      setErr('Please enter your password (min 4 chars)');
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      const { token, user } = res.data;
      onLogin({ ...user, token });
    } catch (e) {
      setErr(e.response?.data?.msg || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card login-card shadow-sm">
      <div className="card-body">
        <h4 className="card-title mb-3"><i className="bi bi-person-circle me-2"></i>Sign in</h4>
        {err && <div className="alert alert-danger">{err}</div>}

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input className="form-control" placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input className="form-control" placeholder="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>

        <div className="d-grid">
          <button className="btn btn-primary" onClick={submit} disabled={loading}><i className="bi bi-box-arrow-in-right me-1"></i>{loading ? 'Signing in...' : 'Login'}</button>
        </div>
      </div>
    </div>
  );
}
