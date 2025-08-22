import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCastes,
  createCaste,
  updateCaste,
  deleteCaste,
  fetchCasteById,
  clearError,
  clearSuccess,
  setCurrentCaste,
  clearCurrentCaste,
  setCurrentPage,
} from '../../store/slices/casteSlice';
import './css/CasteManagement.css';

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

const CasteManagement = () => {
  const dispatch = useDispatch();
  const { castes: rawCastes, currentCaste, loading, error, success, pagination } = useSelector((state) => state.caste);
  
  // Ensure castes is always an array
  const castes = Array.isArray(rawCastes) ? rawCastes : [];
  const { token } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    caste: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (token) {
      dispatch(fetchCastes(1)); // Start with page 1
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.caste.trim()) {
      return;
    }

    if (isEditing) {
      await dispatch(updateCaste({ id: editingId, casteData: formData }));
    } else {
      await dispatch(createCaste(formData));
    }

    if (!error) {
      resetForm();
      setShowModal(false);
      // Refresh current page after create/update
      dispatch(fetchCastes(pagination.current_page));
    }
  };

  const handleEdit = (caste) => {
    setFormData({ caste: caste.caste });
    setIsEditing(true);
    setEditingId(caste.id);
    setShowModal(true);
    dispatch(setCurrentCaste(caste));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this caste?')) {
      await dispatch(deleteCaste(id));
      // Refresh current page after delete
      dispatch(fetchCastes(pagination.current_page));
    }
  };

  const handleCancel = () => {
    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setFormData({ caste: '' });
    setIsEditing(false);
    setEditingId(null);
    dispatch(clearCurrentCaste());
  };

  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
  };

  const handleRefresh = () => {
    dispatch(fetchCastes(pagination.current_page));
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
    dispatch(fetchCastes(page));
  };

  const handlePreviousPage = () => {
    if (pagination.current_page > 1) {
      handlePageChange(pagination.current_page - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.current_page < pagination.last_page) {
      handlePageChange(pagination.current_page + 1);
    }
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const current = pagination.current_page;
    const last = pagination.last_page;
    
    // Always show first page
    if (current > 3) {
      pages.push(1);
      if (current > 4) pages.push('...');
    }
    
    // Show pages around current page
    for (let i = Math.max(1, current - 1); i <= Math.min(last, current + 1); i++) {
      pages.push(i);
    }
    
    // Always show last page
    if (current < last - 2) {
      if (current < last - 3) pages.push('...');
      pages.push(last);
    }
    
    return pages;
  };

  // Error state
  if (error && !loading) {
    return (
      <div className="caste-management">
        <div className="error-state">
          <h2>Error Loading Castes</h2>
          <p>{error}</p>
          <button 
            className="btn btn-primary"
            onClick={() => dispatch(fetchCastes(1))}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="caste-management">
      <div className="caste-header">
        <div className="header-content">
          <h1>Caste Management</h1>
          <p>Manage caste information with full CRUD operations</p>
        </div>
        <button 
          className="btn btn-primary add-btn"
          onClick={handleAddNew}
          disabled={loading}
        >
          <PlusIcon />
          Add New Caste
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

      {/* Caste List Section */}
      <div className="caste-list-section">
        <div className="list-header">
          <div className="list-header-left">
            <h2>Caste List</h2>
            <div className="pagination-info">
              Showing {pagination.from} to {pagination.to} of {pagination.total} entries
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

        {loading && castes.length === 0 ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading castes...</p>
          </div>
        ) : castes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No castes found</h3>
            <p>Add your first caste to get started.</p>
            <button 
              className="btn btn-primary"
              onClick={handleAddNew}
            >
              <PlusIcon />
              Add First Caste
            </button>
          </div>
        ) : (
          <>
            <div className="modern-table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Caste Name</th>
                    <th>Created At</th>
                    <th>Updated At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {castes.map((caste) => (
                    <tr key={caste.id}>
                      <td className="id-cell">#{caste.id}</td>
                      <td className="name-cell">{caste.caste}</td>
                      <td className="date-cell">{new Date(caste.created_at).toLocaleDateString()}</td>
                      <td className="date-cell">{new Date(caste.updated_at).toLocaleDateString()}</td>
                      <td className="actions-cell">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEdit(caste)}
                          disabled={loading}
                          title="Edit caste"
                        >
                          <EditIcon />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(caste.id)}
                          disabled={loading}
                          title="Delete caste"
                        >
                          <DeleteIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination.last_page > 1 && (
              <div className="pagination-container">
                <div className="pagination-info-mobile">
                  Showing {pagination.from} to {pagination.to} of {pagination.total} entries
                </div>
                <div className="pagination-controls">
                  <button
                    className="btn btn-secondary pagination-btn"
                    onClick={handlePreviousPage}
                    disabled={pagination.current_page <= 1 || loading}
                    title="Previous page"
                  >
                    <ChevronLeftIcon />
                    Previous
                  </button>
                  
                  <div className="page-numbers">
                    {generatePageNumbers().map((page, index) => (
                      <button
                        key={index}
                        className={`btn page-btn ${page === pagination.current_page ? 'active' : ''} ${page === '...' ? 'disabled' : ''}`}
                        onClick={() => typeof page === 'number' && handlePageChange(page)}
                        disabled={page === '...' || loading}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    className="btn btn-secondary pagination-btn"
                    onClick={handleNextPage}
                    disabled={pagination.current_page >= pagination.last_page || loading}
                    title="Next page"
                  >
                    Next
                    <ChevronRightIcon />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Caste' : 'Add New Caste'}</h2>
              <button 
                className="btn-icon btn-close"
                onClick={handleCancel}
                title="Close modal"
              >
                <CloseIcon />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="caste">Caste Name</label>
                <input
                  type="text"
                  id="caste"
                  name="caste"
                  value={formData.caste}
                  onChange={handleInputChange}
                  placeholder="Enter caste name"
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading || !formData.caste.trim()}
                >
                  {loading ? 'Processing...' : (isEditing ? 'Update Caste' : 'Create Caste')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CasteManagement;
