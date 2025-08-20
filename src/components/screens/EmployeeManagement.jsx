import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  fetchEmployeeById,
  getEmployeeDocumentDownload,
  uploadEmployeeDocument,
  clearError,
  clearSuccess,
  setCurrentEmployee,
  clearCurrentEmployee,
  setFilters,
  clearFilters,
  setCurrentPage,
} from '../../store/slices/employeeSlice';
import { fetchEmployeeTypes as fetchEmployeeTypesAction } from '../../store/slices/employeeTypeSlice';
import './css/EmployeeManagement.css';
import { getApiUrl } from '../../config/api';

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

const EmployeeManagement = () => {
  const dispatch = useDispatch();
  const { 
    employees, 
    currentEmployee, 
    loading, 
    error, 
    success, 
    pagination, 
    filters 
  } = useSelector((state) => state.employees);
  
  const { items: employeeTypes } = useSelector((state) => state.employeeTypes);
  const { token } = useSelector((state) => state.auth);

  // Local state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    employee_type_id: '',
    emp_name: '',
    emp_email: '',
    emp_password: '',
    emp_phone: '',
    emp_address: '',
    emp_wages: '',
    emp_date: '',
    is_active: true,
    emp_code: '',
    emp_designation: '',
    joining_date: new Date().toISOString().split('T')[0], // Default to current date
    termination_date: '',
    emp_status: 'active'
  });

  // Document upload state
  const [documents, setDocuments] = useState({
    aadhar_card: null,
    pan_card: null,
    marksheet: null
  });

  // Load initial data
  useEffect(() => {
    if (token) {
      dispatch(fetchEmployees({ page: 1 }));
      dispatch(fetchEmployeeTypesAction(1));
    }
  }, [dispatch, token]);

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
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle document upload
  const handleDocumentUpload = (documentType, file) => {
    setDocuments(prev => ({
      ...prev,
      [documentType]: file
    }));
  };

  // No local generator now; we set EMP-{id} after create when code is blank

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.emp_name.trim() || !formData.emp_email.trim()) {
      return;
    }

    // Build JSON payload
    const finalFormData = {
      ...formData,
      emp_wages: formData.emp_wages ? parseFloat(formData.emp_wages) : null,
      is_active: formData.is_active ? 1 : 0
    };
    // Omit optional fields if empty/blank to satisfy backend validation
    if (!finalFormData.emp_code) delete finalFormData.emp_code;
    if (isEditing && !finalFormData.emp_password) delete finalFormData.emp_password;

    let result;
    if (isEditing) {
      result = await dispatch(updateEmployee({ id: editingId, employeeData: finalFormData }));
    } else {
      result = await dispatch(createEmployee(finalFormData));
    }

    if (result && result.meta && result.meta.requestStatus === 'fulfilled') {
      const createdOrUpdated = result.payload;
      const employeeId = isEditing ? editingId : createdOrUpdated?.id;

      // If created and no code provided, set EMP-{id}
      if (!isEditing && !formData.emp_code && employeeId) {
        await dispatch(updateEmployee({ id: employeeId, employeeData: { emp_code: `EMP-${employeeId}` } }));
      }

      // Upload documents (optional)
      const uploads = [];
      if (employeeId) {
        if (documents.aadhar_card) {
          uploads.push(dispatch(uploadEmployeeDocument({ employeeId, file: documents.aadhar_card, documentType: 'aadhar', documentName: 'Aadhar Card' })));
        }
        if (documents.pan_card) {
          uploads.push(dispatch(uploadEmployeeDocument({ employeeId, file: documents.pan_card, documentType: 'pan', documentName: 'PAN Card' })));
        }
        if (documents.marksheet) {
          uploads.push(dispatch(uploadEmployeeDocument({ employeeId, file: documents.marksheet, documentType: 'marksheet', documentName: 'Marksheet' })));
        }
      }
      if (uploads.length) {
        await Promise.all(uploads);
        // Refresh the current employee to reflect latest documents
        if (employeeId) {
          await dispatch(fetchEmployeeById(employeeId));
        }
      }

      resetForm();
      setShowModal(false);
      dispatch(fetchEmployees({ 
        page: pagination.current_page,
        ...filters 
      }));
    }
  };

  // Handle edit
  const handleEdit = (employee) => {
    setFormData({
      employee_type_id: employee.employee_type_id?.toString() || '',
      emp_name: employee.emp_name || '',
      emp_email: employee.emp_email || '',
      emp_password: '',
      emp_phone: employee.emp_phone || '',
      emp_address: employee.emp_address || '',
      emp_wages: employee.emp_wages?.toString() || '',
      emp_date: employee.emp_date || '',
      is_active: employee.is_active || true,
      emp_code: employee.emp_code || '',
      emp_designation: employee.emp_designation || '',
      joining_date: employee.joining_date || new Date().toISOString().split('T')[0],
      termination_date: employee.termination_date || '',
      emp_status: employee.emp_status || 'active'
    });
    // Reset documents for editing (documents will be handled separately)
    setDocuments({
      aadhar_card: null,
      pan_card: null,
      marksheet: null
    });
    setIsEditing(true);
    setEditingId(employee.id);
    setShowModal(true);
    dispatch(setCurrentEmployee(employee));
  };

  // Handle view - fetch full record including documents
  const handleView = async (employee) => {
    const res = await dispatch(fetchEmployeeById(employee.id));
    if (res && res.meta && res.meta.requestStatus === 'fulfilled') {
      setViewingEmployee(res.payload);
    } else {
      setViewingEmployee(employee);
    }
    setShowViewModal(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      await dispatch(deleteEmployee(id));
      dispatch(fetchEmployees({ 
        page: pagination.current_page,
        ...filters 
      }));
    }
  };

  // Handle search
  const handleSearch = (e) => {
    const searchValue = e.target.value;
    dispatch(setFilters({ search: searchValue }));
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      dispatch(fetchEmployees({ 
        page: 1,
        search: searchValue,
        ...filters,
        search: searchValue
      }));
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    dispatch(setFilters({ [filterType]: value }));
    dispatch(fetchEmployees({ 
      page: 1,
      ...filters,
      [filterType]: value
    }));
  };

  // Handle pagination
  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
    dispatch(fetchEmployees({ 
      page,
      ...filters 
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      employee_type_id: '',
      emp_name: '',
      emp_email: '',
      emp_password: '',
      emp_phone: '',
      emp_address: '',
      emp_wages: '',
      emp_date: '',
      is_active: true,
      emp_code: '',
      emp_designation: '',
      joining_date: new Date().toISOString().split('T')[0], // Default to current date
      termination_date: '',
      emp_status: 'active'
    });
    setDocuments({
      aadhar_card: null,
      pan_card: null,
      marksheet: null
    });
    setIsEditing(false);
    setEditingId(null);
    dispatch(clearCurrentEmployee());
  };

  // Handle add new
  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
  };

  // Handle refresh
  const handleRefresh = () => {
    dispatch(fetchEmployees({ 
      page: pagination.current_page,
      ...filters 
    }));
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const current = pagination.current_page;
    const last = pagination.last_page;
    
    if (current > 3) {
      pages.push(1);
      if (current > 4) pages.push('...');
    }
    
    for (let i = Math.max(1, current - 1); i <= Math.min(last, current + 1); i++) {
      pages.push(i);
    }
    
    if (current < last - 2) {
      if (current < last - 3) pages.push('...');
      pages.push(last);
    }
    
    return pages;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Document helpers
  const getDocumentUrl = (doc) => doc?.download_url || doc?.file_url || doc?.url || doc?.path || null;
  const isImageUrl = (url) => /\.(png|jpe?g|webp|gif)$/i.test(url || '');
  const isPdfUrl = (url) => /\.pdf(\?|$)/i.test(url || '');
  const openDocumentPreview = async (doc) => {
    let finalUrl = null;
    // Prefer inline endpoint; if it returns JSON, switch to its download_url
    if (doc?.id) {
      const inlineUrl = `${getApiUrl(`/api/employee-documents/${doc.id}/download`)}?inline=1&_=${Date.now()}`;
      try {
        const resp = await fetch(inlineUrl, { method: 'GET' });
        if (resp.ok) {
          const contentType = resp.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            // Backend returned JSON { download_url, ... }
            const json = await resp.json();
            finalUrl = json.download_url || json.url || null;
          } else {
            // Likely a direct streamable file
            finalUrl = inlineUrl;
            const mime = contentType.split(';')[0];
            setPreviewDoc({ url: encodeURI(finalUrl), name: doc?.document_name || 'Document', mime });
            return;
          }
        }
      } catch (_) {
        // ignore and fall back below
      }
    }
    if (!finalUrl && doc?.id) {
      // Try explicit download-url API
      const res = await dispatch(getEmployeeDocumentDownload(doc.id));
      if (res && res.meta && res.meta.requestStatus === 'fulfilled') {
        finalUrl = res.payload?.download_url || res.payload?.url || null;
      }
    }
    if (!finalUrl) finalUrl = getDocumentUrl(doc);
    if (!finalUrl) return;
    // Try to probe mime with a HEAD request; ignore failures
    let mime;
    try {
      const head = await fetch(finalUrl, { method: 'HEAD' });
      if (head.ok) mime = (head.headers.get('content-type') || '').split(';')[0];
    } catch (_) {}
    setPreviewDoc({ url: encodeURI(finalUrl), name: doc?.document_name || 'Document', mime });
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'terminated': return 'status-terminated';
      case 'on_leave': return 'status-leave';
      default: return 'status-default';
    }
  };

  // Error state
  if (error && !loading) {
    return (
      <div className="employee-management">
        <div className="error-state">
          <h2>Error Loading Employees</h2>
          <p>{error}</p>
          <button 
            className="btn btn-primary"
            onClick={() => dispatch(fetchEmployees({ page: 1 }))}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-management">
      {/* Header */}
      <div className="employee-header">
        <div className="header-content">
          <h1>Employee Management</h1>
          <p>Manage employees with comprehensive CRUD operations, search, and filtering</p>
        </div>
        <button 
          className="btn btn-primary add-btn"
          onClick={handleAddNew}
          disabled={loading}
        >
          <PlusIcon />
          Add New Employee
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
            placeholder="Search employees by name, email, code, phone, or designation..."
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
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                disabled={loading}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
                <option value="on_leave">On Leave</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Employee Type</label>
              <select
                value={filters.employee_type_id}
                onChange={(e) => handleFilterChange('employee_type_id', e.target.value)}
                disabled={loading}
              >
                <option value="">All Types</option>
                {employeeTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.type_name}
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
                <option value="emp_name">Name</option>
                <option value="emp_email">Email</option>
                <option value="emp_wages">Wages</option>
                <option value="joining_date">Joining Date</option>
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
              onClick={() => {
                dispatch(clearFilters());
                dispatch(fetchEmployees({ page: 1 }));
              }}
              disabled={loading}
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Employee List */}
      <div className="employee-list-section">
        <div className="list-header">
          <div className="list-header-left">
            <h2>Employees List</h2>
            <div className="pagination-info">
              Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} employees
            </div>
          </div>
          <button 
            className="btn btn-secondary refresh-btn" 
            onClick={handleRefresh} 
            disabled={loading}
          >
            <RefreshIcon />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {loading && employees.length === 0 ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading employees...</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No employees found</h3>
            <p>Add your first employee to get started.</p>
            <button className="btn btn-primary" onClick={handleAddNew}>
              <PlusIcon />
              Add First Employee
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
                  <th>Phone</th>
                  <th>Type</th>
                  <th>Designation</th>
                  <th>Wages</th>
                  <th>Status</th>
                  <th>Joining Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="id-cell">#{employee.id}</td>
                    <td className="name-cell">
                      <div className="employee-name">
                        <strong>{employee.emp_name}</strong>
                        {employee.emp_code && (
                          <span className="employee-code">({employee.emp_code})</span>
                        )}
                      </div>
                    </td>
                    <td className="email-cell">{employee.emp_email}</td>
                    <td className="phone-cell">{employee.emp_phone || '-'}</td>
                    <td className="type-cell">
                      {employee.employee_type?.type_name || '-'}
                    </td>
                    <td className="designation-cell">{employee.emp_designation || '-'}</td>
                    <td className="wages-cell">
                      {employee.formatted_wages || formatCurrency(employee.emp_wages)}
                    </td>
                    <td className="status-cell">
                      <span className={`status-badge ${getStatusBadgeClass(employee.emp_status)}`}>
                        {employee.emp_status}
                      </span>
                    </td>
                    <td className="date-cell">
                      {formatDate(employee.joining_date)}
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="btn-icon btn-view" 
                        onClick={() => handleView(employee)} 
                        disabled={loading} 
                        title="View Details"
                      >
                        <EyeIcon />
                      </button>
                      <button 
                        className="btn-icon btn-edit" 
                        onClick={() => handleEdit(employee)} 
                        disabled={loading} 
                        title="Edit"
                      >
                        <EditIcon />
                      </button>
                      <button 
                        className="btn-icon btn-delete" 
                        onClick={() => handleDelete(employee.id)} 
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
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Employee' : 'Add New Employee'}</h2>
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
                  <label htmlFor="employee_type_id">Employee Type *</label>
                  <select
                    id="employee_type_id"
                    name="employee_type_id"
                    value={formData.employee_type_id}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  >
                    <option value="">Select Employee Type</option>
                    {employeeTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.type_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="emp_name">Full Name *</label>
                  <input
                    id="emp_name"
                    name="emp_name"
                    type="text"
                    value={formData.emp_name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="emp_email">Email *</label>
                  <input
                    id="emp_email"
                    name="emp_email"
                    type="email"
                    value={formData.emp_email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="emp_password">
                    {isEditing ? 'New Password (leave blank to keep current)' : 'Password *'}
                  </label>
                  <input
                    id="emp_password"
                    name="emp_password"
                    type="password"
                    value={formData.emp_password}
                    onChange={handleInputChange}
                    placeholder={isEditing ? "Enter new password" : "Enter password"}
                    required={!isEditing}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="emp_phone">Phone Number</label>
                  <input
                    id="emp_phone"
                    name="emp_phone"
                    type="tel"
                    value={formData.emp_phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="emp_code">
                    Employee Code 
                    <span className="field-note">(Auto-generated if left empty)</span>
                  </label>
                  <input
                    id="emp_code"
                    name="emp_code"
                    type="text"
                    value={formData.emp_code}
                    onChange={handleInputChange}
                    placeholder="Leave empty for auto-generation"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="emp_designation">Designation</label>
                  <input
                    id="emp_designation"
                    name="emp_designation"
                    type="text"
                    value={formData.emp_designation}
                    onChange={handleInputChange}
                    placeholder="Enter designation"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="emp_wages">Wages (₹)</label>
                  <input
                    id="emp_wages"
                    name="emp_wages"
                    type="number"
                    step="0.01"
                    value={formData.emp_wages}
                    onChange={handleInputChange}
                    placeholder="Enter wages"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="joining_date">Joining Date</label>
                  <input
                    id="joining_date"
                    name="joining_date"
                    type="date"
                    value={formData.joining_date}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="emp_status">Status</label>
                  <select
                    id="emp_status"
                    name="emp_status"
                    value={formData.emp_status}
                    onChange={handleInputChange}
                    disabled={loading}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="terminated">Terminated</option>
                    <option value="on_leave">On Leave</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="termination_date">Termination Date</label>
                  <input
                    id="termination_date"
                    name="termination_date"
                    type="date"
                    value={formData.termination_date}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="emp_address">Address</label>
                  <textarea
                    id="emp_address"
                    name="emp_address"
                    value={formData.emp_address}
                    onChange={handleInputChange}
                    placeholder="Enter full address"
                    rows="3"
                    disabled={loading}
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                    <span className="checkmark"></span>
                    Active Employee
                  </label>
                </div>

                {/* Document Upload Section */}
                <div className="form-group full-width">
                  <label>Documents (Optional)</label>
                  <div className="document-upload-grid">
                    <div className="document-upload-item">
                      <label htmlFor="aadhar_card">Aadhar Card</label>
                      <input
                        id="aadhar_card"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleDocumentUpload('aadhar_card', e.target.files[0])}
                        disabled={loading}
                      />
                      {documents.aadhar_card && (
                        <span className="file-selected">✓ {documents.aadhar_card.name}</span>
                      )}
                    </div>

                    <div className="document-upload-item">
                      <label htmlFor="pan_card">PAN Card</label>
                      <input
                        id="pan_card"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleDocumentUpload('pan_card', e.target.files[0])}
                        disabled={loading}
                      />
                      {documents.pan_card && (
                        <span className="file-selected">✓ {documents.pan_card.name}</span>
                      )}
                    </div>

                    <div className="document-upload-item">
                      <label htmlFor="marksheet">Marksheet</label>
                      <input
                        id="marksheet"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleDocumentUpload('marksheet', e.target.files[0])}
                        disabled={loading}
                      />
                      {documents.marksheet && (
                        <span className="file-selected">✓ {documents.marksheet.name}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowModal(false)} 
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={loading || !formData.emp_name.trim() || !formData.emp_email.trim()}
                >
                  {loading ? 'Processing...' : (isEditing ? 'Update Employee' : 'Create Employee')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Employee Modal */}
      {showViewModal && viewingEmployee && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Employee Details</h2>
              <button 
                className="btn-icon btn-close" 
                onClick={() => setShowViewModal(false)} 
                title="Close"
              >
                <CloseIcon />
              </button>
            </div>
            
            <div className="employee-details">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Employee ID</label>
                  <span>#{viewingEmployee.id}</span>
                </div>
                
                <div className="detail-item">
                  <label>Name</label>
                  <span>{viewingEmployee.emp_name}</span>
                </div>
                
                <div className="detail-item">
                  <label>Email</label>
                  <span>{viewingEmployee.emp_email}</span>
                </div>
                
                <div className="detail-item">
                  <label>Phone</label>
                  <span>{viewingEmployee.emp_phone || '-'}</span>
                </div>
                
                <div className="detail-item">
                  <label>Employee Code</label>
                  <span>{viewingEmployee.emp_code || '-'}</span>
                </div>
                
                <div className="detail-item">
                  <label>Employee Type</label>
                  <span>{viewingEmployee.employee_type?.type_name || '-'}</span>
                </div>
                
                <div className="detail-item">
                  <label>Designation</label>
                  <span>{viewingEmployee.emp_designation || '-'}</span>
                </div>
                
                <div className="detail-item">
                  <label>Wages</label>
                  <span>{viewingEmployee.formatted_wages || formatCurrency(viewingEmployee.emp_wages)}</span>
                </div>
                
                <div className="detail-item">
                  <label>Status</label>
                  <span className={`status-badge ${getStatusBadgeClass(viewingEmployee.emp_status)}`}>
                    {viewingEmployee.emp_status}
                  </span>
                </div>
                
                <div className="detail-item">
                  <label>Joining Date</label>
                  <span>{formatDate(viewingEmployee.joining_date)}</span>
                </div>
                
                <div className="detail-item">
                  <label>Termination Date</label>
                  <span>{formatDate(viewingEmployee.termination_date)}</span>
                </div>
                
                <div className="detail-item">
                  <label>Active</label>
                  <span className={`status-badge ${viewingEmployee.is_active ? 'status-active' : 'status-inactive'}`}>
                    {viewingEmployee.is_active ? 'Yes' : 'No'}
                  </span>
                </div>
                
                <div className="detail-item full-width">
                  <label>Address</label>
                  <span>{viewingEmployee.emp_address || '-'}</span>
                </div>
                
                {/* Document Information from documents[] */}
                {(() => {
                  const docs = Array.isArray(viewingEmployee?.documents) ? viewingEmployee.documents : [];
                  const getLatestDocByType = (type) => {
                    const matches = docs.filter(d => d.document_type === type);
                    if (matches.length === 0) return null;
                    return matches.sort((a, b) => {
                      const aKey = new Date(a.created_at || 0).getTime() || a.id || 0;
                      const bKey = new Date(b.created_at || 0).getTime() || b.id || 0;
                      return bKey - aKey;
                    })[0];
                  };
                  const getDocUrl = (doc) => doc?.download_url || doc?.file_url || doc?.url || null;
                  const aadhar = getLatestDocByType('aadhar');
                  const pan = getLatestDocByType('pan');
                  const marksheet = getLatestDocByType('marksheet');
                  return (
                    <>
                      <div className="detail-item">
                        <label>Aadhar Card</label>
                        <span className="doc-actions">
                          {aadhar ? (
                            <>
                              <button 
                                type="button" 
                                className="btn-icon btn-eye" 
                                title="Preview"
                                onClick={() => openDocumentPreview(aadhar)}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                              </button>
                              {getDocUrl(aadhar) && (
                                <a href={getDocUrl(aadhar)} target="_blank" rel="noopener noreferrer" className="document-link">
                                  {aadhar.document_name || 'Open'}
                                </a>
                              )}
                              {!getDocUrl(aadhar) && <span>{aadhar.document_name || 'Uploaded'}</span>}
                            </>
                          ) : 'Not uploaded'}
                        </span>
                      </div>
                      <div className="detail-item">
                        <label>PAN Card</label>
                        <span className="doc-actions">
                          {pan ? (
                            <>
                              <button 
                                type="button" 
                                className="btn-icon btn-eye" 
                                title="Preview"
                                onClick={() => openDocumentPreview(pan)}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                              </button>
                              {getDocUrl(pan) && (
                                <a href={getDocUrl(pan)} target="_blank" rel="noopener noreferrer" className="document-link">
                                  {pan.document_name || 'Open'}
                                </a>
                              )}
                              {!getDocUrl(pan) && <span>{pan.document_name || 'Uploaded'}</span>}
                            </>
                          ) : 'Not uploaded'}
                        </span>
                      </div>
                      <div className="detail-item">
                        <label>Marksheet</label>
                        <span className="doc-actions">
                          {marksheet ? (
                            <>
                              <button 
                                type="button" 
                                className="btn-icon btn-eye" 
                                title="Preview"
                                onClick={() => openDocumentPreview(marksheet)}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                              </button>
                              {getDocUrl(marksheet) && (
                                <a href={getDocUrl(marksheet)} target="_blank" rel="noopener noreferrer" className="document-link">
                                  {marksheet.document_name || 'Open'}
                                </a>
                              )}
                              {!getDocUrl(marksheet) && <span>{marksheet.document_name || 'Uploaded'}</span>}
                            </>
                          ) : 'Not uploaded'}
                        </span>
                      </div>
                    </>
                  );
                })()}
                
                <div className="detail-item">
                  <label>Created</label>
                  <span>{formatDate(viewingEmployee.created_at)}</span>
                </div>
                
                <div className="detail-item">
                  <label>Last Updated</label>
                  <span>{formatDate(viewingEmployee.updated_at)}</span>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={() => {
                  setShowViewModal(false);
                  handleEdit(viewingEmployee);
                }}
              >
                Edit Employee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="modal-overlay" onClick={() => setPreviewDoc(null)}>
          <div className="modal-content preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Document Preview</h2>
              <button 
                className="btn-icon btn-close" 
                onClick={() => setPreviewDoc(null)} 
                title="Close"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="preview-body">
              {(previewDoc?.mime?.includes('pdf') || isPdfUrl(previewDoc.url)) ? (
                <iframe title={previewDoc.name} src={previewDoc.url} className="preview-frame" />
              ) : (previewDoc?.mime?.startsWith('image/') || isImageUrl(previewDoc.url)) ? (
                <img alt={previewDoc.name} src={previewDoc.url} className="preview-image" />
              ) : (
                <div className="preview-fallback">
                  <p>Preview not available for this file type.</p>
                  <a href={previewDoc.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Open in new tab</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;