import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchEmployeeTypes,
  createEmployeeType,
  updateEmployeeType,
  deleteEmployeeType,
  fetchEmployeeTypeById,
  clearEmployeeTypeState,
  clearError,
  clearSuccess,
} from '../../store/slices/employeeTypeSlice';
import './css/CasteManagement.css';

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3,6 5,6 21,6"/>
    <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23,4 23,10 17,10"/>
    <polyline points="1,20 1,14 7,14"/>
    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
  </svg>
);

const emptyForm = { type_name: '', status: '1' };

const EmployeeTypes = () => {
  const dispatch = useDispatch();
  const { items, pagination, loading, error, success, current } = useSelector((s) => s.employeeTypes);
  const { token } = useSelector((s) => s.auth || {});

  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const list = useMemo(() => {
    const all = Array.isArray(items) ? items : [];
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter((i) => (i?.type_name || '').toLowerCase().includes(q));
  }, [items, search]);

  useEffect(() => {
    if (token) dispatch(fetchEmployeeTypes(1));
  }, [dispatch, token]);

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearError());
      }, 5000);
    }
  }, [error, dispatch]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    // Don't clear success/error here - let them auto-clear with timeouts
  };

  const clearFormAndState = () => {
    setForm(emptyForm);
    setEditingId(null);
    dispatch(clearEmployeeTypeState());
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const type_name = (form.type_name || '').trim();
    if (!type_name) return alert('Type name is required');
    const payload = { type_name, status: (form.status || '1').trim() };
    if (editingId) {
      dispatch(updateEmployeeType({ id: editingId, payload })).then(() => {
        setForm(emptyForm);
        setEditingId(null);
        setShowModal(false);
        dispatch(fetchEmployeeTypes(1));
      });
    } else {
      dispatch(createEmployeeType(payload)).then(() => {
        setForm(emptyForm);
        setEditingId(null);
        setShowModal(false);
        dispatch(fetchEmployeeTypes(1));
      });
    }
  };

  const onEdit = (id) => {
    dispatch(fetchEmployeeTypeById(id)).then((res) => {
      const et = res.payload;
      if (et) {
        setEditingId(et.id);
        setForm({ type_name: et.type_name || '', status: et.status || '1' });
        setShowModal(true);
      }
    });
  };

  const onDelete = (id) => {
    if (confirm('Delete this employee type?')) dispatch(deleteEmployeeType(id));
  };

  return (
    <div className="caste-management">
      <div className="caste-header">
        <div className="header-content">
          <h1>Employee Types</h1>
          <p>Manage employee types with full CRUD operations</p>
        </div>
        <button className="btn btn-primary add-btn" onClick={() => { clearFormAndState(); setShowModal(true); }} disabled={loading}>
          <PlusIcon />
          Add Employee Type
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="caste-list-section">
        <div className="list-header">
          <div className="list-header-left">
            <h2>Employee Types List</h2>
            <div className="pagination-info">Page {pagination?.current_page || 1}</div>
          </div>
          <button className="btn btn-secondary refresh-btn" onClick={() => dispatch(fetchEmployeeTypes(1))} disabled={loading}>
            <RefreshIcon />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {loading && list.length === 0 ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading employee types...</p>
          </div>
        ) : list.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No employee types found</h3>
            <p>Add your first employee type to get started.</p>
            <button className="btn btn-primary" onClick={() => { clearFormAndState(); setShowModal(true); }}>
              <PlusIcon />
              Add First Type
            </button>
          </div>
        ) : (
          <div className="modern-table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type Name</th>
                  <th>Status</th>
                  <th>Updated At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((et) => (
                  <tr key={et.id}>
                    <td className="id-cell">#{et.id}</td>
                    <td className="name-cell">{et.type_name}</td>
                    <td className="name-cell">{et.status}</td>
                    <td className="date-cell">{et.updated_at ? new Date(et.updated_at).toLocaleDateString() : '-'}</td>
                    <td className="actions-cell">
                      <button className="btn-icon btn-edit" onClick={() => onEdit(et.id)} disabled={loading} title="Edit">
                        <EditIcon />
                      </button>
                      <button className="btn-icon btn-delete" onClick={() => onDelete(et.id)} disabled={loading} title="Delete">
                        <DeleteIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Employee Type' : 'Add Employee Type'}</h2>
              <button className="btn-icon btn-close" onClick={() => setShowModal(false)} title="Close">
                <CloseIcon />
              </button>
            </div>
            <form onSubmit={onSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="type_name">Type Name</label>
                <input
                  id="type_name"
                  name="type_name"
                  type="text"
                  value={form.type_name}
                  onChange={(e) => setForm({ ...form, type_name: e.target.value })}
                  placeholder="Enter type name"
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <input
                  id="status"
                  name="status"
                  type="text"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  placeholder="1 or active"
                  disabled={loading}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={loading}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading || !form.type_name.trim()}>
                  {loading ? 'Processing...' : (editingId ? 'Update Type' : 'Create Type')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTypes;


