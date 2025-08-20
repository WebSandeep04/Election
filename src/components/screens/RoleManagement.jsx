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
} from '../../store/slices/roleSlice';
import './css/RoleManagement.css';

// Icons (using simple SVG icons)
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

const RoleManagement = () => {
  const dispatch = useDispatch();
  const { roles: rawRoles, currentRole, loading, error, success, pagination } = useSelector((state) => state.roles);
  
  // Ensure roles is always an array
  const roles = Array.isArray(rawRoles) ? rawRoles : [];
  const { token } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    is_active: true,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (token) {
      dispatch(fetchRoles(1)); // Start with page 1
    }
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isEditing) {
      dispatch(updateRole({ id: editingId, roleData: formData }));
    } else {
      dispatch(createRole(formData));
    }
    
    handleCloseModal();
  };

  const handleEdit = (role) => {
    setFormData({
      name: role.name || '',
      display_name: role.display_name || '',
      description: role.description || '',
      is_active: role.is_active !== undefined ? role.is_active : true,
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

  const handleActivate = (role) => {
    setConfirmAction('activate');
    setConfirmData(role);
    setShowConfirmModal(true);
  };

  const handleDeactivate = (role) => {
    setConfirmAction('deactivate');
    setConfirmData(role);
    setShowConfirmModal(true);
  };

  const confirmActionHandler = () => {
    if (confirmAction === 'delete') {
      dispatch(deleteRole(confirmData.id));
    } else if (confirmAction === 'activate') {
      dispatch(activateRole(confirmData.id));
    } else if (confirmAction === 'deactivate') {
      dispatch(deactivateRole(confirmData.id));
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
    setConfirmData(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      name: '',
      display_name: '',
      description: '',
      is_active: true,
    });
  };

  const handleRefresh = () => {
    dispatch(fetchRoles(pagination.current_page));
  };

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
    dispatch(fetchRoles(page));
  };

  const filteredRoles = roles.filter(role =>
    role.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getConfirmMessage = () => {
    if (confirmAction === 'delete') {
      return `Are you sure you want to delete the role "${confirmData?.display_name}"? This action cannot be undone.`;
    } else if (confirmAction === 'activate') {
      return `Are you sure you want to activate the role "${confirmData?.display_name}"?`;
    } else if (confirmAction === 'deactivate') {
      return `Are you sure you want to deactivate the role "${confirmData?.display_name}"?`;
    }
    return '';
  };

  const getConfirmTitle = () => {
    if (confirmAction === 'delete') {
      return 'Delete Role';
    } else if (confirmAction === 'activate') {
      return 'Activate Role';
    } else if (confirmAction === 'deactivate') {
      return 'Deactivate Role';
    }
    return 'Confirm Action';
  };

  if (!token) {
    return (
      <div className="role-management">
        <div className="role-error">
          Please log in to access role management.
        </div>
      </div>
    );
  }

  return (
    <div className="role-management">
      <div className="role-header">
        <h1 className="role-title">Role Management</h1>
        <div className="role-actions">
          <button
            className="role-btn role-btn-secondary"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshIcon />
            Refresh
          </button>
          <button
            className="role-btn role-btn-primary"
            onClick={() => setShowModal(true)}
            disabled={loading}
          >
            <PlusIcon />
            Add Role
          </button>
        </div>
      </div>

      {error && (
        <div className="role-error">
          {error}
        </div>
      )}

      {success && (
        <div className="role-success">
          {success}
        </div>
      )}

      <div className="role-search">
        <input
          type="text"
          placeholder="Search roles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="role-search-input"
        />
      </div>

      {loading ? (
        <div className="role-loading">
          Loading roles...
        </div>
      ) : (
        <div className="role-table-container">
          {filteredRoles.length === 0 ? (
            <div className="role-empty">
              <div className="role-empty-icon">👥</div>
              <p>No roles found.</p>
              {searchTerm && <p>Try adjusting your search terms.</p>}
            </div>
          ) : (
            <table className="role-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Display Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoles.map((role) => (
                  <tr key={role.id}>
                    <td>
                      <strong>{role.name}</strong>
                    </td>
                    <td>{role.display_name}</td>
                    <td>{role.description || '-'}</td>
                    <td>
                      <span className={`role-status ${role.is_active ? 'active' : 'inactive'}`}>
                        {role.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      {role.created_at ? new Date(role.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="role-actions-cell">
                      <button
                        className="role-action-btn role-btn-primary"
                        onClick={() => handleEdit(role)}
                        title="Edit Role"
                      >
                        <EditIcon />
                        Edit
                      </button>
                      {role.is_active ? (
                        <button
                          className="role-action-btn role-btn-warning"
                          onClick={() => handleDeactivate(role)}
                          title="Deactivate Role"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          className="role-action-btn role-btn-success"
                          onClick={() => handleActivate(role)}
                          title="Activate Role"
                        >
                          Activate
                        </button>
                      )}
                      <button
                        className="role-action-btn role-btn-danger"
                        onClick={() => handleDelete(role)}
                        title="Delete Role"
                      >
                        <DeleteIcon />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {pagination && pagination.last_page > 1 && (
        <div className="role-pagination">
          <button
            className="role-pagination-btn"
            onClick={() => handlePageChange(pagination.current_page - 1)}
            disabled={pagination.current_page <= 1}
          >
            <ChevronLeftIcon />
            Previous
          </button>
          
          <span className="role-pagination-info">
            Page {pagination.current_page} of {pagination.last_page}
            {pagination.total > 0 && ` (${pagination.total} total roles)`}
          </span>
          
          <button
            className="role-pagination-btn"
            onClick={() => handlePageChange(pagination.current_page + 1)}
            disabled={pagination.current_page >= pagination.last_page}
          >
            Next
            <ChevronRightIcon />
          </button>
        </div>
      )}

      {/* Add/Edit Role Modal */}
      {showModal && (
        <div className="role-modal">
          <div className="role-modal-content">
            <div className="role-modal-header">
              <h2 className="role-modal-title">
                {isEditing ? 'Edit Role' : 'Add New Role'}
              </h2>
              <button
                className="role-modal-close"
                onClick={handleCloseModal}
              >
                <CloseIcon />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="role-form">
              <div className="role-form-group">
                <label className="role-form-label">Role Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="role-form-input"
                  placeholder="e.g., admin, manager, employee"
                  required
                />
              </div>
              
              <div className="role-form-group">
                <label className="role-form-label">Display Name *</label>
                <input
                  type="text"
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleInputChange}
                  className="role-form-input"
                  placeholder="e.g., Administrator, Manager, Employee"
                  required
                />
              </div>
              
              <div className="role-form-group">
                <label className="role-form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="role-form-textarea"
                  placeholder="Describe the role's purpose and permissions..."
                  rows="3"
                />
              </div>
              
              <div className="role-form-group">
                <label className="role-form-checkbox">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                  />
                  Active
                </label>
              </div>
              
              <div className="role-form-actions">
                <button
                  type="button"
                  className="role-btn role-btn-secondary"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="role-btn role-btn-primary"
                  disabled={loading}
                >
                  {isEditing ? 'Update Role' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="role-confirm-modal">
          <div className="role-confirm-content">
            <h3 className="role-confirm-title">{getConfirmTitle()}</h3>
            <p className="role-confirm-message">{getConfirmMessage()}</p>
            <div className="role-confirm-actions">
              <button
                className="role-btn role-btn-secondary"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                className={`role-btn ${
                  confirmAction === 'delete' ? 'role-btn-danger' : 'role-btn-primary'
                }`}
                onClick={confirmActionHandler}
                disabled={loading}
              >
                {confirmAction === 'delete' ? 'Delete' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
