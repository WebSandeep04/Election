import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
  fetchRoleById,
  activateRole,
  deactivateRole,
  clearError,
  clearSuccess,
  setCurrentRole,
  clearCurrentRole,
  setCurrentPage,
  fetchPermissions,
  fetchRolePermissions,
  syncRolePermissions,
} from '../../store/slices/roleSlice';
import './css/RoleManagement.css';

// Icons
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

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15,18 9,12 15,6"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9,18 15,12 9,6"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const RoleManagement = () => {
  const dispatch = useDispatch();
  const { roles: rawRoles, loading, error, success, pagination } = useSelector((state) => state.roles);
  const roles = Array.isArray(rawRoles) ? rawRoles : [];
  const { token } = useSelector((state) => state.auth);
  const { permissions, permissionsPagination } = useSelector((state) => state.roles);

  // Local state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  const [search, setSearch] = useState('');
  const [showPermsModal, setShowPermsModal] = useState(false);
  const [permsSearch, setPermsSearch] = useState('');
  const [permsLoading, setPermsLoading] = useState(false);
  const [selectedRoleForPerms, setSelectedRoleForPerms] = useState(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);

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

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    if (token) {
      dispatch(fetchRoles(1));
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => dispatch(clearSuccess()), 3000);
      return () => clearTimeout(t);
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(t);
    }
  }, [error, dispatch]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await dispatch(updateRole({ id: editingId, roleData: formData }));
      } else {
        await dispatch(createRole(formData));
      }
      setShowModal(false);
      resetForm();
      dispatch(fetchRoles(1));
    } catch (_) {}
  };

  const resetForm = () => {
    setFormData({ name: '', display_name: '', description: '', is_active: true });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (role) => {
    setFormData({
      name: role.name || '',
      display_name: role.display_name || '',
      description: role.description || '',
      is_active: !!role.is_active,
    });
    setIsEditing(true);
    setEditingId(role.id);
    setShowModal(true);
  };

  const handleDelete = (role) => {
    setConfirmAction('delete');
    setConfirmData(role);
    setShowConfirmModal(true);
  };

  const handleToggle = (role) => {
    setConfirmAction(role.is_active ? 'deactivate' : 'activate');
    setConfirmData(role);
    setShowConfirmModal(true);
  };

  const confirmActionHandler = async () => {
    try {
      if (confirmAction === 'delete') await dispatch(deleteRole(confirmData.id));
      if (confirmAction === 'activate') await dispatch(activateRole(confirmData.id));
      if (confirmAction === 'deactivate') await dispatch(deactivateRole(confirmData.id));
    } finally {
      setShowConfirmModal(false);
      setConfirmAction(null);
      setConfirmData(null);
    }
  };

  const handleRefresh = () => dispatch(fetchRoles(pagination.current_page || 1));
  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
    dispatch(fetchRoles(page));
  };

  const openPermissionsModal = async (role) => {

    
    if (!role || !role.id) {
      console.error('Invalid role data:', role);
      return;
    }
    
    setSelectedRoleForPerms(role);
    setShowPermsModal(true);
    setPermsLoading(true);
    
    try {
      // Fetch permissions first
  
      await dispatch(fetchPermissions({ page: 1 })).unwrap();
      
      // Fetch assigned permissions for the role from backend to ensure correctness
      const result = await dispatch(fetchRolePermissions(role.id)).unwrap();
      const assigned = Array.isArray(result.permissions) ? result.permissions : [];
      const existingPermissionIds = assigned.map(p => (typeof p === 'object' ? p.id : p)).filter(Boolean);
      
      setSelectedPermissionIds(existingPermissionIds);
      
    } catch (error) {
      console.error('Error in openPermissionsModal:', error);
    } finally {
      setPermsLoading(false);
    }
  };

  const togglePermission = (permId) => {
    setSelectedPermissionIds(prev => prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]);
  };

  const selectAllPermissions = () => {
    const allIds = (permissions || []).map(p => p.id);
    setSelectedPermissionIds(allIds);
  };

  const clearAllPermissions = () => setSelectedPermissionIds([]);

  const savePermissions = async () => {
    if (!selectedRoleForPerms) return;
    setPermsLoading(true);
    try {
      await dispatch(syncRolePermissions({ roleId: selectedRoleForPerms.id, permissionIds: selectedPermissionIds })).unwrap();
      setShowPermsModal(false);
      setSelectedRoleForPerms(null);
      setSelectedPermissionIds([]);
    } catch (_) {
    } finally {
      setPermsLoading(false);
    }
  };

  // Debounced search for permissions
  useEffect(() => {
    if (!showPermsModal) return;
    const t = setTimeout(() => {
      dispatch(fetchPermissions({ page: 1, search: permsSearch }));
    }, 400);
    return () => clearTimeout(t);
  }, [permsSearch, showPermsModal, dispatch]);

  // Ensure selected permissions are set when permissions are loaded
  useEffect(() => {
    if (showPermsModal && selectedRoleForPerms && permissions.length > 0) {
      const existingPermissionIds = (selectedRoleForPerms.permissions || []).map(p => p.id);
  
      setSelectedPermissionIds(existingPermissionIds);
    }
  }, [permissions, showPermsModal, selectedRoleForPerms]);

  // Search filter (client-side)
  const filtered = roles.filter(r =>
    (r.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.display_name || '').toLowerCase().includes(search.toLowerCase())
  );

  // Pagination numbers (employee-style)
  const generatePageNumbers = () => {
    const pages = [];
    const current = pagination.current_page;
    const last = pagination.last_page;
    if (!current || !last) return pages;
    if (last <= 7) {
      for (let i = 1; i <= last; i++) pages.push(i);
    } else if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push('...');
      pages.push(last);
    } else if (current >= last - 3) {
      pages.push(1);
      pages.push('...');
      for (let i = last - 4; i <= last; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push('...');
      for (let i = current - 1; i <= current + 1; i++) pages.push(i);
      pages.push('...');
      pages.push(last);
    }
    return pages;
  };

  if (!token) {
    return (
      <div className="role-management">
        <div className="error-state">Please log in to access role management.</div>
      </div>
    );
  }

  return (
    <div className="role-management">
      {/* Header */}
      <div className="role-header">
        <div className="header-content">
          <h1>Role Management</h1>
          <p>Manage roles with CRUD operations and quick search</p>
        </div>
        <button
          className="btn btn-primary add-btn"
          onClick={() => { resetForm(); setShowModal(true); }}
          disabled={loading}
        >
          <PlusIcon />
          Add New Role
        </button>
      </div>

      {/* Alerts */}
      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Search only */}
      <div className="search-filters-section">
        <div className="search-box">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search roles by name or display name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      {/* List */}
      <div className="role-list-section">
        <div className="list-header">
          <div className="list-header-left">
            <h2>Roles List</h2>
            <div className="pagination-info">
              Showing {((pagination.current_page - 1) * pagination.per_page) + (filtered.length ? 1 : 0)} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} roles
            </div>
          </div>
          <button className="btn btn-secondary refresh-btn" onClick={handleRefresh} disabled={loading}>
            <RefreshIcon />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {loading && roles.length === 0 ? (
          <div className="loading-state"><div className="spinner"></div><p>Loading roles...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛡️</div>
            <h3>No roles found</h3>
            <p>Create your first role to get started.</p>
            <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
              <PlusIcon />
              Add First Role
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
                   <th>Status</th>
                   <th>Created</th>
                   <th>Actions</th>
                 </tr>
              </thead>
              <tbody>
                {filtered.map((role) => (
                  <tr key={role.id}>
                    <td className="id-cell">#{role.id}</td>
                                         <td className="name-cell"><strong>{safeText(role.name)}</strong></td>
                     <td>{safeText(role.display_name)}</td>
                     <td className="desc-cell">{safeText(role.description)}</td>
                    <td className="status-cell">
                      <span className={`status-badge ${role.is_active ? 'status-active' : 'status-inactive'}`}>
                        {role.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="date-cell">{role.created_at ? new Date(role.created_at).toLocaleDateString() : '-'}</td>
                    <td className="actions-cell">
                      <button className="btn-icon btn-edit" onClick={() => handleEdit(role)} disabled={loading} title="Edit">
                        <EditIcon />
                      </button>
                      <button className={`btn-icon ${role.is_active ? 'btn-deactivate' : 'btn-activate'}`} onClick={() => handleToggle(role)} disabled={loading} title={role.is_active ? 'Deactivate' : 'Activate'}>
                        {role.is_active ? '🔒' : '🔓'}
                      </button>
                                             <button className="btn-icon" onClick={() => openPermissionsModal(role)} title="Edit Permissions">🔑</button>
                      <button className="btn-icon btn-delete" onClick={() => handleDelete(role)} disabled={loading} title="Delete">
                        <DeleteIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="pagination">
            <button className="btn btn-outline" onClick={() => handlePageChange(pagination.current_page - 1)} disabled={pagination.current_page === 1 || loading}>
              <ChevronLeftIcon />
              Previous
            </button>
            <div className="page-numbers">
              {generatePageNumbers().map((page, index) => (
                <button key={index} className={`btn ${page === pagination.current_page ? 'btn-primary' : 'btn-outline'}`} onClick={() => typeof page === 'number' && handlePageChange(page)} disabled={page === '...' || loading}>
                  {page}
                </button>
              ))}
            </div>
            <button className="btn btn-outline" onClick={() => handlePageChange(pagination.current_page + 1)} disabled={pagination.current_page === pagination.last_page || loading}>
              Next
              <ChevronRightIcon />
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Role' : 'Add New Role'}</h2>
              <button className="btn-icon btn-close" onClick={() => setShowModal(false)} title="Close">
                <CloseIcon />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Role Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g., admin, manager" />
                </div>
                <div className="form-group">
                  <label>Display Name *</label>
                  <input type="text" name="display_name" value={formData.display_name} onChange={handleInputChange} required placeholder="e.g., Administrator" />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input type="text" name="description" value={formData.description} onChange={handleInputChange} placeholder="Describe the role" />
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} />
                    Active
                  </label>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} disabled={loading}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{isEditing ? 'Update Role' : 'Create Role'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-content small-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Action</h2>
              <button className="btn-icon btn-close" onClick={() => setShowConfirmModal(false)} title="Close">
                <CloseIcon />
              </button>
            </div>
            <div className="confirmation-content">
              {confirmAction === 'delete' && (<p>Are you sure you want to delete the role <strong>{confirmData?.display_name || confirmData?.name}</strong>?</p>)}
              {confirmAction === 'activate' && (<p>Are you sure you want to activate <strong>{confirmData?.display_name || confirmData?.name}</strong>?</p>)}
              {confirmAction === 'deactivate' && (<p>Are you sure you want to deactivate <strong>{confirmData?.display_name || confirmData?.name}</strong>?</p>)}
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setShowConfirmModal(false)} disabled={loading}>Cancel</button>
              <button type="button" className={`btn ${confirmAction === 'delete' ? 'btn-danger' : 'btn-primary'}`} onClick={confirmActionHandler} disabled={loading}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {showPermsModal && (
        <div className="modal-overlay" onClick={() => setShowPermsModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Permissions {selectedRoleForPerms ? `for ${selectedRoleForPerms.display_name || selectedRoleForPerms.name}` : ''}</h2>
              <button className="btn-icon btn-close" onClick={() => setShowPermsModal(false)} title="Close"><CloseIcon /></button>
            </div>
                          <div className="modal-form">
                <div className="search-filters-section" style={{marginBottom: 12}}>
                  <div className="search-box">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    <input
                      type="text"
                      placeholder="Search permissions..."
                      value={permsSearch}
                      onChange={(e) => setPermsSearch(e.target.value)}
                      disabled={permsLoading}
                    />
                  </div>
                  <div style={{display:'flex', gap:8}}>
                    <button className="btn btn-outline" onClick={selectAllPermissions} disabled={permsLoading}>Select All</button>
                    <button className="btn btn-outline" onClick={clearAllPermissions} disabled={permsLoading}>Clear All</button>
                  </div>
                </div>
                {process.env.NODE_ENV === 'development' && (
                  <div style={{marginBottom: 12, padding: 8, background: '#f0f0f0', borderRadius: 4, fontSize: '12px'}}>
                    <strong>Debug Info:</strong> Selected: {selectedPermissionIds.length} | Total Permissions: {permissions.length} | Role Permissions: {(selectedRoleForPerms?.permissions || []).length}
                  </div>
                )}
              <div className="modern-table-container">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th style={{width:60}}>Select</th>
                      <th>Name</th>
                      <th>Display Name</th>
                      <th>Description</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(permissions || []).map((perm) => {
                      const isCurrentlyAssigned = (selectedRoleForPerms?.permissions || []).some(p => p.id === perm.id);
                      return (
                        <tr key={perm.id} className={isCurrentlyAssigned ? 'currently-assigned' : ''}>
                          <td>
                            <input type="checkbox" checked={selectedPermissionIds.includes(perm.id)} onChange={() => togglePermission(perm.id)} />
                          </td>
                          <td className="name-cell">
                            <strong>{perm.name}</strong>
                            {isCurrentlyAssigned && <span style={{marginLeft: 8, fontSize: '12px', color: '#10b981'}}>✓ Currently Assigned</span>}
                          </td>
                          <td>{perm.display_name}</td>
                          <td className="desc-cell">{perm.description || '-'}</td>
                          <td className="status-cell">
                            <span className={`status-badge ${perm.is_active ? 'status-active' : 'status-inactive'}`}>{perm.is_active ? 'Active' : 'Inactive'}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowPermsModal(false)} disabled={permsLoading}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={savePermissions} disabled={permsLoading}>{permsLoading ? 'Saving...' : 'Save Permissions'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
