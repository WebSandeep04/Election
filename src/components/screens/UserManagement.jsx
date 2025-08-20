import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  fetchUserById,
  activateUser,
  deactivateUser,
  clearError,
  clearSuccess,
  setCurrentUser,
  clearCurrentUser,
  setCurrentPage,
} from '../../store/slices/userSlice';
import {
  fetchRoles,
} from '../../store/slices/roleSlice';
import './css/UserManagement.css';

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

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/>
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

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const UserManagement = () => {
  const dispatch = useDispatch();
  const { 
    users, 
    currentUser, 
    loading, 
    error, 
    success, 
    pagination 
  } = useSelector((state) => state.users);
  
  const { roles } = useSelector((state) => state.roles);
  const { token } = useSelector((state) => state.auth);

  // Local state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmData, setConfirmData] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_id: '',
    is_active: true
  });

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    is_active: '',
    role_id: '',
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  // Load initial data
  useEffect(() => {
    if (token) {
      dispatch(fetchUsers({ page: 1, ...filters }));
      dispatch(fetchRoles(1));
    }
  }, [dispatch, token]);

  // Test API connection
  const testApiConnection = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/users?page=1`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      console.log('API Test Response:', response.status, response.ok);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Test Error:', errorData);
      }
    } catch (error) {
      console.error('API Test Failed:', error);
    }
  };

  // Test API on component mount
  useEffect(() => {
    if (token) {
      testApiConnection();
    }
  }, [token]);

  // Auto-clear success and error messages
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const next = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      // During update, auto-fill confirmation when password changes
      if (isEditing && name === 'password') {
        next.password_confirmation = value;
      }
      return next;
    });
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setFilters(prev => ({
      ...prev,
      search: value
    }));
  };

  // Apply filters automatically when filters change
  useEffect(() => {
    if (token) {
      const timeoutId = setTimeout(() => {
        dispatch(fetchUsers({ page: 1, ...filters }));
      }, 300); // Small delay to prevent too many API calls

      return () => clearTimeout(timeoutId);
    }
  }, [filters, dispatch, token]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Name and email are required');
      return;
    }

    // If password provided (create or update), ensure confirmation matches
    if (formData.password) {
      if (!formData.password_confirmation) {
        alert('Please confirm the password.');
        return;
      }
      if (formData.password !== formData.password_confirmation) {
        alert('Password and confirmation do not match.');
        return;
      }
    }

    // Build JSON payload
    const finalFormData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      is_active: formData.is_active ? 1 : 0,
      ...(formData.role_id && { role_id: parseInt(formData.role_id) })
    };

    // Add password fields only if provided
    if (formData.password) {
      finalFormData.password = formData.password;
      finalFormData.password_confirmation = formData.password_confirmation;
    }

    try {
      if (isEditing) {
        console.log('Updating user with data:', finalFormData);
        await dispatch(updateUser({ id: editingId, userData: finalFormData })).unwrap();
      } else {
        // For create, password is required
        if (!formData.password) {
          alert('Password is required for new users');
          return;
        }
        console.log('Creating user with data:', finalFormData);
        await dispatch(createUser(finalFormData)).unwrap();
      }
      
      setShowModal(false);
      resetForm();
      // Refresh the user list
      dispatch(fetchUsers({ page: 1, ...filters }));
    } catch (error) {
      console.error('Form submission error:', error);
      alert(`Error: ${error.message || 'Something went wrong'}`);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role_id: '',
      is_active: true
    });
    setIsEditing(false);
    setEditingId(null);
  };

  // Handle add new user
  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
  };

  // Handle edit user
  const handleEdit = (user) => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      password_confirmation: '',
      role_id: user.role_id ? user.role_id.toString() : '',
      is_active: user.is_active || false
    });
    setIsEditing(true);
    setEditingId(user.id);
    setShowModal(true);
  };

  // Handle view user
  const handleView = (user) => {
    setViewingUser(user);
    setShowViewModal(true);
  };

  // Handle delete user
  const handleDelete = (userId) => {
    setConfirmAction('delete');
    setConfirmData({ id: userId });
    setShowConfirmModal(true);
  };

  // Handle activate/deactivate user
  const handleToggleStatus = (user) => {
    setConfirmAction(user.is_active ? 'deactivate' : 'activate');
    setConfirmData({ id: user.id, name: user.name });
    setShowConfirmModal(true);
  };

  // Handle confirm action
  const handleConfirmAction = async () => {
    if (!confirmData) return;

    try {
      switch (confirmAction) {
        case 'delete':
          await dispatch(deleteUser(confirmData.id)).unwrap();
          break;
        case 'activate':
          await dispatch(activateUser(confirmData.id)).unwrap();
          break;
        case 'deactivate':
          await dispatch(deactivateUser(confirmData.id)).unwrap();
          break;
        default:
          break;
      }
      
      setShowConfirmModal(false);
      setConfirmAction(null);
      setConfirmData(null);
      dispatch(fetchUsers({ page: 1, ...filters }));
    } catch (error) {
      console.error('Action error:', error);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    dispatch(fetchUsers({ page: 1, ...filters }));
  };

  // Handle page change
  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
    dispatch(fetchUsers({ page, ...filters }));
  };



  // Clear filters
  const clearAllFilters = () => {
    const clearedFilters = {
      search: '',
      is_active: '',
      role_id: '',
      sort_by: 'created_at',
      sort_order: 'desc'
    };
    setFilters(clearedFilters);
    dispatch(fetchUsers({ page: 1, ...clearedFilters }));
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const current = pagination.current_page;
    const last = pagination.last_page;
    
    if (last <= 7) {
      for (let i = 1; i <= last; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(last);
      } else if (current >= last - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = last - 4; i <= last; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(last);
      }
    }
    
    return pages;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  // Get status badge class
  const getStatusBadgeClass = (isActive) => {
    return isActive ? 'status-active' : 'status-inactive';
  };

  // Get role display name
  const getRoleDisplayName = (role) => {
    return role?.display_name || role?.name || 'No Role';
  };

  // Error state
  if (error && !loading) {
    return (
      <div className="user-management">
        <div className="error-state">
          <h2>Error Loading Users</h2>
          <p>{error}</p>
          <button 
            className="btn btn-primary"
            onClick={() => dispatch(fetchUsers({ page: 1 }))}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management">
      {/* Header */}
      <div className="user-header">
        <div className="header-content">
          <h1>User Management</h1>
          <p>Manage users with comprehensive CRUD operations, search, and filtering</p>
        </div>
        <button 
          className="btn btn-primary add-btn"
          onClick={handleAddNew}
          disabled={loading}
        >
          <PlusIcon />
          Add New User
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

      {/* Search and Filters */}
      <div className="search-filters-section">
        <div className="search-box">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={filters.search}
            onChange={handleSearch}
            disabled={loading}
          />
        </div>
        
        <button 
          className="btn btn-secondary filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
          disabled={loading}
        >
          <FilterIcon />
          Filters
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="advanced-filters">
          <div className="filter-row">
            <div className="filter-group">
              <label>Status</label>
              <select
                value={filters.is_active}
                onChange={(e) => handleFilterChange('is_active', e.target.value)}
                disabled={loading}
              >
                <option value="">All Status</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Role</label>
              <select
                value={filters.role_id}
                onChange={(e) => handleFilterChange('role_id', e.target.value)}
                disabled={loading}
              >
                <option value="">All Roles</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.display_name || role.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select
                value={filters.sort_by}
                onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                disabled={loading}
              >
                <option value="created_at">Created Date</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="is_active">Status</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Order</label>
              <select
                value={filters.sort_order}
                onChange={(e) => handleFilterChange('sort_order', e.target.value)}
                disabled={loading}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>

            <button 
              className="btn btn-outline"
              onClick={clearAllFilters}
              disabled={loading}
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* User List */}
      <div className="user-list-section">
        <div className="list-header">
          <div className="list-header-left">
            <h2>Users List</h2>
            <div className="pagination-info">
              Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} users
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-secondary" 
              onClick={testApiConnection}
              disabled={loading}
              title="Test API Connection"
            >
              🔧 Test API
            </button>
            <button 
              className="btn btn-secondary refresh-btn" 
              onClick={handleRefresh} 
              disabled={loading}
            >
              <RefreshIcon />
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {loading && users.length === 0 ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👤</div>
            <h3>No users found</h3>
            <p>Add your first user to get started.</p>
            <button className="btn btn-primary" onClick={handleAddNew}>
              <PlusIcon />
              Add First User
            </button>
          </div>
        ) : (
          <div className="modern-table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="id-cell">#{user.id}</td>
                    <td className="name-cell">
                      <div className="user-name">
                        <strong>{user.name}</strong>
                      </div>
                    </td>
                    <td className="email-cell">{user.email}</td>
                    <td className="role-cell">
                      {getRoleDisplayName(user.role)}
                    </td>
                    <td className="status-cell">
                      <span className={`status-badge ${getStatusBadgeClass(user.is_active)}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="date-cell">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="btn-icon btn-view" 
                        onClick={() => handleView(user)} 
                        disabled={loading} 
                        title="View Details"
                      >
                        <EyeIcon />
                      </button>
                      <button 
                        className="btn-icon btn-edit" 
                        onClick={() => handleEdit(user)} 
                        disabled={loading} 
                        title="Edit"
                      >
                        <EditIcon />
                      </button>
                      <button 
                        className={`btn-icon ${user.is_active ? 'btn-deactivate' : 'btn-activate'}`}
                        onClick={() => handleToggleStatus(user)} 
                        disabled={loading} 
                        title={user.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {user.is_active ? '🔒' : '🔓'}
                      </button>
                      <button 
                        className="btn-icon btn-delete" 
                        onClick={() => handleDelete(user.id)} 
                        disabled={loading} 
                        title="Delete"
                      >
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
            <button
              className="btn btn-outline"
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={pagination.current_page === 1 || loading}
            >
              <ChevronLeftIcon />
              Previous
            </button>

            <div className="page-numbers">
              {generatePageNumbers().map((page, index) => (
                <button
                  key={index}
                  className={`btn ${page === pagination.current_page ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => typeof page === 'number' && handlePageChange(page)}
                  disabled={page === '...' || loading}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              className="btn btn-outline"
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.last_page || loading}
            >
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
              <h2>{isEditing ? 'Edit User' : 'Add New User'}</h2>
              <button 
                className="btn-icon btn-close" 
                onClick={() => setShowModal(false)} 
                title="Close"
              >
                <CloseIcon />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter email address"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">{isEditing ? 'New Password' : 'Password *'}</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!isEditing}
                    placeholder={isEditing ? 'Leave blank to keep current' : 'Enter password'}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password_confirmation">Confirm Password {!isEditing && '*'}{isEditing && formData.password ? ' *' : ''}</label>
                  <input
                    type="password"
                    id="password_confirmation"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleInputChange}
                    required={!isEditing || !!formData.password}
                    placeholder="Confirm password"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role_id">Role</label>
                  <select
                    id="role_id"
                    name="role_id"
                    value={formData.role_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Role</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.display_name || role.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                    />
                    <span className="checkmark"></span>
                    Active User
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (isEditing ? 'Update User' : 'Create User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && viewingUser && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Details</h2>
              <button 
                className="btn-icon btn-close" 
                onClick={() => setShowViewModal(false)} 
                title="Close"
              >
                <CloseIcon />
              </button>
            </div>
            
            <div className="user-details">
              <div className="detail-row">
                <label>ID:</label>
                <span>#{viewingUser.id}</span>
              </div>
              <div className="detail-row">
                <label>Name:</label>
                <span>{viewingUser.name}</span>
              </div>
              <div className="detail-row">
                <label>Email:</label>
                <span>{viewingUser.email}</span>
              </div>
              <div className="detail-row">
                <label>Role:</label>
                <span>{getRoleDisplayName(viewingUser.role)}</span>
              </div>
              <div className="detail-row">
                <label>Status:</label>
                <span className={`status-badge ${getStatusBadgeClass(viewingUser.is_active)}`}>
                  {viewingUser.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="detail-row">
                <label>Created:</label>
                <span>{formatDate(viewingUser.created_at)}</span>
              </div>
              <div className="detail-row">
                <label>Last Updated:</label>
                <span>{formatDate(viewingUser.updated_at)}</span>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => {
                  setShowViewModal(false);
                  handleEdit(viewingUser);
                }}
              >
                Edit User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-content small-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Action</h2>
              <button 
                className="btn-icon btn-close" 
                onClick={() => setShowConfirmModal(false)} 
                title="Close"
              >
                <CloseIcon />
              </button>
            </div>
            
            <div className="confirmation-content">
              {confirmAction === 'delete' && (
                <p>Are you sure you want to delete this user? This action cannot be undone.</p>
              )}
              {confirmAction === 'activate' && (
                <p>Are you sure you want to activate <strong>{confirmData?.name}</strong>?</p>
              )}
              {confirmAction === 'deactivate' && (
                <p>Are you sure you want to deactivate <strong>{confirmData?.name}</strong>?</p>
              )}
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={() => setShowConfirmModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className={`btn ${confirmAction === 'delete' ? 'btn-danger' : 'btn-primary'}`}
                onClick={handleConfirmAction}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
