import React, { useEffect, useState } from 'react';
import API from '../api';
import { useConfirm } from '../ConfirmContext';

export default function ManagerDashboard({ user }) {
  const [leaves, setLeaves] = useState([]);
  const confirm = useConfirm();

  const load = async () => {
    try {
      const res = await API.get('/leaves/dashboard');
      setLeaves(res.data.leaves || []);
    } catch (e) {
      console.error('Failed to load manager dashboard', e);
    }
  };

  useEffect(() => { load(); }, []);

  const act = async (id, action) => {
    try {
      const prompt = action === 'decline' ? 'Decline this request?' : 'Approve this request?';
      let ok = true;
      if (confirm) ok = await confirm({ title: action === 'decline' ? 'Decline' : 'Approve', message: prompt });
      if (!ok) return;
      await API.post(`/leaves/${id}/${action}`);
      load();
    } catch (e) {
      console.error('Action failed', e);
    }
  };

  return (
    <div>
      <h5 className="mb-3">Manager Dashboard — Department: {user.department}</h5>
      <div className="row">
        {leaves.length === 0 && <div className="text-muted">No requests</div>}
        {leaves.map(l => (
          <div key={l._id} className="col-12 col-md-6 card-list-item">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex w-100 justify-content-between align-items-center">
                  <h6 className="mb-1">{l.applicant?.name}</h6>
                  {(() => {
                    const s = (l.status || '').toLowerCase();
                    const cls = s === 'pending' ? 'status-badge pending' : s === 'declined' ? 'status-badge declined' : s === 'approved' ? 'status-badge approved' : 'status-badge other';
                    const ico = s === 'pending' ? 'bi-clock' : s === 'declined' ? 'bi-x-circle' : s === 'approved' ? 'bi-check-circle' : 'bi-info-circle';
                    return <span className={cls}><i className={`bi ${ico} me-1`}></i>{l.status}</span>;
                  })()}
                </div>
                <p className="mb-1">{l.type} — {new Date(l.startDate).toDateString()} to {new Date(l.endDate).toDateString()}</p>
                <p className="mb-2"><small className="text-muted">Reason: {l.reason}</small></p>
                          {l.status === 'Pending' && (
                            <div className="d-flex flex-column flex-sm-row gap-2">
                              <button className="btn btn-sm btn-success btn-full-sm" onClick={() => act(l._id, 'approve')}><i className="bi bi-check-lg me-1"></i>Approve</button>
                              <button className="btn btn-sm btn-danger btn-full-sm" onClick={() => act(l._id, 'decline')}><i className="bi bi-x-lg me-1"></i>Decline</button>
                            </div>
                          )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
