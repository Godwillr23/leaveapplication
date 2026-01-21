import React, { useEffect, useState } from 'react';
import API from '../api';
import LeaveForm from './LeaveForm';

export default function EmployeeDashboard({ user }) {
  const [data, setData] = useState(null);

  const load = async () => {
    try {
      const res = await API.get('/leaves/dashboard');
      setData(res.data);
    } catch (e) {
      console.error('Failed to load employee dashboard', e);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="row g-3">
        <div className="col-12 col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title"><i className="bi bi-bar-chart-line-fill me-2"></i>Accrual</h5>
              <div className="small text-muted">Current balances</div>
              <div className="d-flex gap-3 mt-2">
                <div>
                  <div className="text-muted small">Accrued</div>
                  <div className="fw-bold">{data ? data.accrual?.accrued ?? '-' : '...'}</div>
                </div>
                <div>
                  <div className="text-muted small">Taken</div>
                  <div className="fw-bold">{data ? data.accrual?.taken ?? '-' : '...'}</div>
                </div>
                <div>
                  <div className="text-muted small">Remaining</div>
                  <div className="fw-bold">{data ? data.accrual?.remaining ?? '-' : '...'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title"><i className="bi bi-journal-check me-2"></i>Applications</h5>
              {data && data.leaves.length === 0 && <div className="text-muted">No leaves found</div>}
              <div className="list-group list-group-flush">
                {data && data.leaves.map(l => (
                  <div key={l._id} className="list-group-item">
                    <div className="d-flex w-100 justify-content-between align-items-center">
                          <h6 className="mb-1">{l.type}</h6>
                          {(() => {
                            const s = (l.status || '').toLowerCase();
                            const cls = s === 'pending' ? 'status-badge pending' : s === 'declined' ? 'status-badge declined' : s === 'approved' ? 'status-badge approved' : 'status-badge other';
                            const ico = s === 'pending' ? 'bi-clock' : s === 'declined' ? 'bi-x-circle' : s === 'approved' ? 'bi-check-circle' : 'bi-info-circle';
                            return <span className={cls}><i className={`bi ${ico} me-1`}></i>{l.status}</span>;
                          })()}
                        </div>
                    <p className="mb-1">{l.startDate?.slice(0,10)} to {l.endDate?.slice(0,10)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <LeaveForm onApplied={load} />
        </div>
      </div>
    </div>
  );
}
