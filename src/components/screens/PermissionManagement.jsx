import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchPermissions,
  createPermission,
  updatePermission,
  deletePermission,
  clearPermissionError,
  clearPermissionSuccess,
  setPermissionPage,
  setCurrentPermission,
  clearCurrentPermission,
} from '../../store/slices/permissionSlice';
import './css/EmployeeManagement.css';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
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

const PermissionManagement = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error, success, pagination, current } = useAppSelector((s) => s.permissions);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ name: '', display_name: '', description: '' });

  const safeText = (val) => {
    if (val === null || val === undefined) return '-';
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return String(val);
    if (Array.isArray(val)) {
      const mapped = val.map((v) => (typeof v === 'object' ? (v?.name || v?.display_name || v?.title || v?.id || '-') : String(v)));
      return mapped.join(', ');
    }
    if (typeof val === 'object') {
      return val.name || val.display_name || val.title || JSON.stringify(val);
    }
    return String(val);
  };

  useEffect(() => {
    dispatch(fetchPermissions({ page: 1 }));
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => dispatch(clearPermissionSuccess()), 2500);
      return () => clearTimeout(t);
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => dispatch(clearPermissionError()), 4000);
      return () => clearTimeout(t);
    }
  }, [error, dispatch]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    const t = setTimeout(() => {
      dispatch(fetchPermissions({ page: 1, search: value }));
    }, 400);
    return () => clearTimeout(t);
  };

  const handleAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ name: '', display_name: '', description: '' });
    setShowModal(true);
  };

  const handleEdit = (perm) => {
    setIsEditing(true);
    setEditingId(perm.id);
    setFormData({
      name: perm.name || '',
      display_name: perm.display_name || '',
      description: perm.description || ''
    });
    dispatch(setCurrentPermission(perm));
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this permission?')) return;
    const res = await dispatch(deletePermission(id));
    if (res?.meta?.requestStatus === 'fulfilled') {
      dispatch(fetchPermissions({ page: pagination.current_page, search }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name.trim(),
      ...(formData.display_name ? { display_name: formData.display_name } : {}),
      ...(formData.description ? { description: formData.description } : {}),
    };
    let res;
    if (isEditing) {
      res = await dispatch(updatePermission({ id: editingId, payload }));
    } else {
      res = await dispatch(createPermission(payload));
    }
    if (res?.meta?.requestStatus === 'fulfilled') {
      setShowModal(false);
      setIsEditing(false);
      setEditingId(null);
      setFormData({ name: '', display_name: '', description: '' });
      dispatch(fetchPermissions({ page: pagination.current_page, search }));
    }
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.last_page) return;
    dispatch(setPermissionPage(page));
    dispatch(fetchPermissions({ page, search }));
  };

  const generatePageNumbers = () => {
    const pages = [];
    const current = pagination.current_page;
    const last = pagination.last_page;
    if (current > 3) {
      pages.push(1);
      if (current > 4) pages.push('...');
    }
    for (let i = Math.max(1, current - 1); i <= Math.min(last, current + 1); i++) pages.push(i);
    if (current < last - 2) {
      if (current < last - 3) pages.push('...');
      pages.push(last);
    }
    return pages;
  };

  return (
    <div className="employee-management">
      <div className="employee-header">
        <div className="header-content">
          <h1>Permission Management</h1>
          <p>Create, update, delete permissions and search with pagination</p>
        </div>
        <button className="btn btn-primary add-btn" onClick={handleAdd} disabled={loading}>
          <PlusIcon />
          Add Permission
        </button>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="search-filters-section">
        <div className="search-box">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search permissions by name..."
            value={search}
            onChange={handleSearchChange}
            disabled={loading}
          />
        </div>
      </div>

      <div className="employee-list-section">
        <div className="list-header">
          <div className="list-header-left">
            <h2>Permissions List</h2>
            <div className="pagination-info">
              Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} permissions
            </div>
          </div>
        </div>

        {loading && items.length === 0 ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading permissions...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛡️</div>
            <h3>No permissions found</h3>
            <p>Create your first permission to get started.</p>
            <button className="btn btn-primary" onClick={handleAdd}>
              <PlusIcon />
              Add First Permission
            </button>
          </div>
        ) : (
          <div className="modern-table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Display Name</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((perm) => (
                  <tr key={perm.id}>
                    <td className="id-cell">#{perm.id}</td>
                    <td>{safeText(perm.name)}</td>
                    <td>{safeText(perm.display_name)}</td>
                    <td>{safeText(perm.description)}</td>
                    <td className="actions-cell">
                      <button className="btn btn-outline" onClick={() => handleEdit(perm)} disabled={loading}>Edit</button>
                      <button className="btn btn-outline" onClick={() => handleDelete(perm.id)} disabled={loading}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.last_page > 1 && (
          <div className="pagination">
            <button className="btn btn-outline" onClick={() => handlePageChange(pagination.current_page - 1)} disabled={pagination.current_page === 1 || loading}>
              Previous
            </button>
            <div className="page-numbers">
              {generatePageNumbers().map((page, idx) => (
                <button key={idx} className={`btn ${page === pagination.current_page ? 'btn-primary' : 'btn-outline'}`} onClick={() => typeof page === 'number' && handlePageChange(page)} disabled={page === '...' || loading}>
                  {page}
                </button>
              ))}
            </div>
            <button className="btn btn-outline" onClick={() => handlePageChange(pagination.current_page + 1)} disabled={pagination.current_page === pagination.last_page || loading}>
              Next
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Permission' : 'Add Permission'}</h2>
              <button className="btn-icon btn-close" onClick={() => setShowModal(false)} title="Close">
                <CloseIcon />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="name">Name *</label>
                  <input id="name" name="name" type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required disabled={loading} placeholder="e.g., view_user_management" />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="display_name">Display Name</label>
                  <input id="display_name" name="display_name" type="text" value={formData.display_name} onChange={(e) => setFormData({ ...formData, display_name: e.target.value })} disabled={loading} placeholder="Human readable title" />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="description">Description</label>
                  <textarea id="description" name="description" rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} disabled={loading} placeholder="Brief description" />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={loading}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading || !formData.name.trim()}>{isEditing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionManagement;


