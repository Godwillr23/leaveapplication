import React, { useState } from 'react';
import API from '../api';

export default function LeaveForm({ onApplied }) {
  const [type, setType] = useState('annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    setErr(null);
    if (!startDate) { setErr('Please select a start date'); return false; }
    if (!endDate) { setErr('Please select an end date'); return false; }
    const s = new Date(startDate);
    const e = new Date(endDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    const sDay = new Date(s.getFullYear(), s.getMonth(), s.getDate());
    if (sDay <= today) { setErr('Start date must be after today'); return false; }
    if (e < s) { setErr('End date must be after start date'); return false; }
    // Reason is optional for Annual leave. If provided, enforce a minimum length.
    if (type === 'annual') {
      if (reason && reason.trim().length > 0 && reason.trim().length < 8) { setErr('Reason must be at least 8 characters when provided'); return false; }
    } else {
      if (!reason || reason.trim().length < 8) { setErr('Please provide a reason (min 8 characters)'); return false; }
    }
    return true;
  };

  const submit = async () => {
    if (!validate()) return;
    setErr(null);
    setLoading(true);
    try {
      await API.post('/leaves/apply', { type, startDate, endDate, reason });
      onApplied();
      setReason(''); setStartDate(''); setEndDate('');
    } catch (e) {
      setErr(e.response?.data?.msg || 'Failed to apply');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mt-3">
      <div className="card-body">
        <h5 className="card-title"><i className="bi bi-send-fill me-2"></i>Apply for Leave</h5>
        {err && <div className="alert alert-danger">{err}</div>}

        <div className="row g-3">
          <div className="col-12 col-md-4">
            <label className="form-label">Type</label>
            <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
              <option value="annual">Annual</option>
              <option value="sick">Sick</option>
              <option value="maternity">Maternity</option>
              <option value="paternity">Paternity</option>
              <option value="family">Family</option>
              <option value="study">Study</option>
            </select>
          </div>

          <div className="col-6 col-md-4">
            <label className="form-label">Start</label>
            <input className="form-control" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>

          <div className="col-6 col-md-4">
            <label className="form-label">End</label>
            <input className="form-control" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>

          <div className="col-12">
            <label className="form-label">Reason</label>
            <textarea className="form-control" rows="3" value={reason} onChange={e => setReason(e.target.value)} />
            {type === 'annual' && <div className="form-text">Reason is optional for Annual leave</div>}
          </div>

          <div className="col-12">
            <button className="btn btn-success btn-full-sm" onClick={submit} disabled={loading}>{loading ? <><i className="bi bi-arrow-repeat me-1"></i>Applying...</> : <><i className="bi bi-send-check me-1"></i>Apply</>}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
