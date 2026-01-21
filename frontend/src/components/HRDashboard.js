import React, { useEffect, useState } from 'react';
import API from '../api';
import { useToast } from '../ToastContext';
import { useConfirm } from '../ConfirmContext';

export default function HRDashboard({ user }) {
  const [leaves, setLeaves] = useState([]);
  const [users, setUsers] = useState([]);
  const showToast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('employees');
  const DEPARTMENTS = [
    'Engineering',
    'Software Developer',
    'Web Developer',
    'IT',
    'Sales',
    'HR',
    'Finance',
    'Marketing',
    'Operations',
    'Customer Success'
  ];
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'employee', department: DEPARTMENTS[0], managerId: '' });
  const [creating, setCreating] = useState(false);
  const [formErr, setFormErr] = useState(null);

  const load = async () => {
    try {
      const res = await API.get('/leaves/dashboard');
      setLeaves(res.data.leaves || []);
    } catch (e) {
      console.error('Failed to load HR dashboard', e);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await API.get('/users');
      setUsers(res.data.users || []);
    } catch (e) {
      console.error('Failed to load users', e);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => { loadUsers(); }, []);

  const confirm = useConfirm();
  const escalate = async (id) => {
    const ok = await confirm({ title: 'Escalate Leave', message: 'Send escalation for this request?' });
    if (!ok) return;
    try {
      await API.post(`/leaves/${id}/escalate`);
      showToast('Escalation sent', 'success');
    } catch (e) {
      console.error('Escalation failed', e);
      showToast('Escalation failed', 'error');
    }
  };

  const validateNew = () => {
    setFormErr(null);
    if (!newUser.name) { setFormErr('Name is required'); return false; }
    if (!newUser.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) { setFormErr('Valid email required'); return false; }
    if (!newUser.password || newUser.password.length < 4) { setFormErr('Password (min 4 chars) required'); return false; }
    if (newUser.role === 'employee' && !newUser.managerId) { setFormErr('Manager is required for employees'); return false; }
    return true;
  };

  const createUser = async () => {
    if (!validateNew()) return;
    setCreating(true);
    try {
      await API.post('/users', newUser);
      setNewUser({ name: '', email: '', password: '', role: 'employee', department: '', managerId: '' });
      setShowForm(false);
      loadUsers();
      showToast('Employee created', 'success');
    } catch (e) {
      setFormErr(e.response?.data?.msg || 'Failed to create user');
    } finally { setCreating(false); }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">HR Dashboard</h5>
        <div>
          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => { setShowForm(!showForm); setFormErr(null); }}>
            <i className="bi bi-person-plus me-1"></i>{showForm ? 'Cancel' : 'Add Employee'}
          </button>
        </div>
      </div>

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'employees' ? 'active' : ''}`} onClick={() => setActiveTab('employees')}>Manage Employees</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'leaves' ? 'active' : ''}`} onClick={() => setActiveTab('leaves')}>Leave Applications</button>
        </li>
      </ul>

      {activeTab === 'employees' && (
        <div>
          {showForm && (
            <div className="card mb-3">
              <div className="card-body">
                <h6 className="card-title">Create Employee</h6>
                {formErr && <div className="alert alert-danger">{formErr}</div>}
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label">Name</label>
                    <input className="form-control" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Email</label>
                    <input className="form-control" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                  </div>
                  <div className="col-12 col-md-4">
                    <label className="form-label">Password</label>
                    <input className="form-control" type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                  </div>
                  <div className="col-12 col-md-4">
                    <label className="form-label">Role</label>
                    <select className="form-select" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                  <div className="col-12 col-md-4">
                    <label className="form-label">Department</label>
                    <select className="form-select" value={newUser.department} onChange={e => setNewUser({ ...newUser, department: e.target.value })}>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Manager {newUser.role === 'employee' ? '(required)' : '(optional)'}</label>
                    <select className="form-select" value={newUser.managerId} onChange={e => setNewUser({ ...newUser, managerId: e.target.value })} required={newUser.role === 'employee'}>
                      <option value="">— none —</option>
                      {users.filter(u => u.role === 'manager').map(u => (
                        <option key={String(u._id || u.id || u.email)} value={String(u._id || u.id || u.email)}>{u.name} — {u.department || ''}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12">
                    <div className="d-flex flex-column flex-sm-row gap-2">
                      <button className="btn btn-primary btn-full-sm" onClick={createUser} disabled={creating}>{creating ? 'Creating…' : 'Create'}</button>
                      <button className="btn btn-outline-secondary btn-full-sm" onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="card shadow-sm mb-3">
            <div className="card-body">
              <h6 className="card-title">All Employees</h6>
              <ul className="list-group list-group-flush">
                {users.map(u => (
                  <UserListItem key={u._id || u.id || u.email} user={u} users={users} onUpdated={loadUsers} onDeleted={loadUsers} showToast={showToast} departments={DEPARTMENTS} />
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'leaves' && (
        <div className="row">
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
                  <p className="mb-2"><small className="text-muted">Dept: {l.department}</small></p>
                  {l.status === 'Pending' && <button className="btn btn-sm btn-outline-primary" onClick={() => escalate(l._id)}>Escalate</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UserListItem({ user, users, onUpdated, onDeleted, showToast, departments = [], openConfirm }) {
  const [editing, setEditing] = useState(false);
  const [edit, setEdit] = useState({ name: user.name, email: user.email, role: user.role, department: user.department || '', managerId: user.manager || '' });
  const [saving, setSaving] = useState(false);
  const confirmLocal = useConfirm();

  const save = async () => {
    setSaving(true);
    try {
      // client-side validation for email
      if (!edit.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(edit.email)) {
        showToast('Valid email required', 'error');
        setSaving(false);
        return;
      }
      // require manager when role is employee
      if (edit.role === 'employee' && !edit.managerId) {
        showToast('Manager is required for employees', 'error');
        setSaving(false);
        return;
      }
          await API.patch(`/users/${user._id || user.id}`, { name: edit.name, email: edit.email, role: edit.role, department: edit.department, managerId: edit.managerId });
      showToast('User updated', 'success');
      setEditing(false);
      onUpdated();
    } catch (e) {
      showToast(e.response?.data?.msg || 'Update failed', 'error');
    } finally { setSaving(false); }
  };

  const remove = async () => {
    const ok = await confirmLocal({ title: 'Delete user', message: `Delete user ${user.name}? This cannot be undone.` });
    if (!ok) return;
    try {
      await API.delete(`/users/${user._id || user.id}`);
      showToast('User deleted', 'success');
      onDeleted();
    } catch (e) {
      showToast(e.response?.data?.msg || 'Delete failed', 'error');
    }
  };

  return (
    <li className="list-group-item">
      {!editing ? (
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div className="fw-bold">{user.name}</div>
            <div className="small text-muted">{user.email} • {user.role} {user.department ? '• ' + user.department : ''}</div>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-outline-secondary" onClick={() => {
              const mgrVal = user.manager ? (typeof user.manager === 'string' ? String(user.manager) : (user.manager._id ? String(user.manager._id) : (user.manager.id ? String(user.manager.id) : ''))) : '';
              setEdit({ name: user.name, email: user.email, role: user.role, department: user.department || '', managerId: mgrVal });
              setEditing(true);
            }}> <i className="bi bi-pencil-fill me-1"></i>Edit</button>
            <button className="btn btn-sm btn-outline-danger" onClick={remove}><i className="bi bi-trash-fill me-1"></i>Delete</button>
          </div>
        </div>
      ) : (
        <div>
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-3">
              <input className="form-control" value={edit.name} onChange={e => setEdit({...edit, name: e.target.value})} />
            </div>
            <div className="col-12 col-md-3">
              <input className="form-control" value={edit.email} onChange={e => setEdit({...edit, email: e.target.value})} />
            </div>
            <div className="col-6 col-md-2">
              <select className="form-select" value={edit.role} onChange={e => setEdit({...edit, role: e.target.value})}>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr">HR</option>
              </select>
            </div>
            <div className="col-6 col-md-2">
              <select className="form-select" value={edit.department} onChange={e => setEdit({...edit, department: e.target.value})}>
                <option value="">— none —</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="col-6 col-md-2">
              <select className="form-select" value={edit.managerId} onChange={e => setEdit({...edit, managerId: e.target.value})}>
                <option value="">— manager —</option>
                {users.filter(u => u.role === 'manager').map(u => (
                  <option key={String(u._id || u.id || u.email)} value={String(u._id || u.id || u.email)}>{u.name} — {u.department || ''}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-2 d-flex gap-2">
              <button className="btn btn-sm btn-primary" onClick={save} disabled={saving}>{saving ? <><i className="bi bi-arrow-repeat me-1"></i>Saving…</> : <><i className="bi bi-save2-fill me-1"></i>Save</> }</button>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditing(false)}><i className="bi bi-x-lg me-1"></i>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* confirmation handled globally via ConfirmProvider */}
    </li>
  );
}
