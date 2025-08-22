import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchLokSabhas, 
  createLokSabha, 
  updateLokSabha, 
  deleteLokSabha,
  clearError,
  setCurrentPage
} from '../../store/slices/lokSabhaSlice';
import './css/AddLokSabha.css';

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

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm-3.5-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
  </svg>
);

const AddLokSabha = () => {
  const dispatch = useDispatch();
  const { lokSabhas, loading, error, pagination } = useSelector((state) => state.lokSabha);
  const token = useSelector((state) => state.auth.token);
  
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    loksabha_name: '',
    status: '1'
  });
  const [search, setSearch] = useState('');

  // Fetch Lok Sabhas on component mount and token change
  useEffect(() => {
    if (token) {
      dispatch(fetchLokSabhas(pagination.current_page));
    }
  }, [dispatch, token, pagination.current_page]);

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    }
  }, [success]);

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
    
    if (!formData.loksabha_name.trim()) {
      return;
    }

    try {
      if (isEditing) {
        await dispatch(updateLokSabha({ id: editingId, lokSabhaData: formData })).unwrap();
        setSuccess('Lok Sabha updated successfully');
      } else {
        await dispatch(createLokSabha(formData)).unwrap();
        setSuccess('Lok Sabha created successfully');
      }
      
      // Refresh the current page
      dispatch(fetchLokSabhas(pagination.current_page));
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleEdit = (lokSabha) => {
    setFormData({
      loksabha_name: lokSabha.loksabha_name || '',
      status: lokSabha.status || '1'
    });
    setIsEditing(true);
    setEditingId(lokSabha.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this Lok Sabha?')) {
      try {
        await dispatch(deleteLokSabha(id)).unwrap();
        setSuccess('Lok Sabha deleted successfully');
        // Refresh the current page
        dispatch(fetchLokSabhas(pagination.current_page));
      } catch (error) {
        console.error('Error deleting Lok Sabha:', error);
      }
    }
  };

  const handleCancel = () => {
    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setFormData({
      loksabha_name: '',
      status: '1'
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
  };

  const handleRefresh = () => {
    dispatch(fetchLokSabhas(pagination.current_page));
  };

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
    dispatch(fetchLokSabhas(page));
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

  const generatePageNumbers = () => {
    const pages = [];
    const maxPages = 5;
    let startPage = Math.max(1, pagination.current_page - Math.floor(maxPages / 2));
    let endPage = Math.min(pagination.last_page, startPage + maxPages - 1);
    
    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const filteredLokSabhas = Array.isArray(lokSabhas)
    ? lokSabhas.filter(ls => (ls.loksabha_name || '').toLowerCase().includes(search.toLowerCase()))
    : [];

  if (error && !loading) {
    return (
      <div className="lok-sabha-management">
        <div className="error-state">
          <h2>Error Loading Lok Sabha Data</h2>
          <p>{error}</p>
          <button 
            className="btn btn-primary"
            onClick={handleRefresh}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lok-sabha-management">
      <div className="lok-sabha-header">
        <div className="header-content">
          <h1>Lok Sabha Management</h1>
          <p>Manage Lok Sabha constituencies and MP information</p>
        </div>
        <div className="header-buttons">
          <button 
            className="btn btn-primary add-btn"
            onClick={handleAddNew}
            disabled={loading}
          >
            <PlusIcon />
            Add New Constituency
          </button>
        </div>
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

      {/* Search (employee-style) */}
      <div className="search-filters-section">
        <div className="search-box">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search Lok Sabha by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      {/* Lok Sabha List Section */}
      <div className="lok-sabha-list-section">
        <div className="list-header">
          <div className="list-header-left">
            <h2>Lok Sabha Constituencies</h2>
            <div className="pagination-info">
              Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total || 0} constituencies
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

        {loading && lokSabhas.length === 0 ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading Lok Sabha constituencies...</p>
          </div>
        ) : lokSabhas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏛️</div>
            <h3>No Lok Sabha constituencies found</h3>
            <p>Add your first Lok Sabha constituency to get started.</p>
            <button 
              className="btn btn-primary"
              onClick={handleAddNew}
            >
              <PlusIcon />
              Add First Constituency
            </button>
          </div>
        ) : (
          <>
            <div className="modern-table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Lok Sabha Name</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Updated At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLokSabhas.map((lokSabha) => (
                    <tr key={lokSabha.id}>
                      <td className="id-cell">#{lokSabha.id}</td>
                      <td className="name-cell">{lokSabha.loksabha_name}</td>
                      <td className="status-cell">{lokSabha.status === '1' ? 'Active' : 'Inactive'}</td>
                      <td className="created-cell">{new Date(lokSabha.created_at).toLocaleDateString()}</td>
                      <td className="updated-cell">{new Date(lokSabha.updated_at).toLocaleDateString()}</td>
                      <td className="actions-cell">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEdit(lokSabha)}
                          disabled={loading}
                          title="Edit Lok Sabha"
                        >
                          <EditIcon />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(lokSabha.id)}
                          disabled={loading}
                          title="Delete Lok Sabha"
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
                  Page {pagination.current_page} of {pagination.last_page}
                </div>
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    onClick={handlePreviousPage}
                    disabled={pagination.current_page <= 1 || loading}
                  >
                    Previous
                  </button>
                  
                  <div className="page-numbers">
                    {generatePageNumbers().map((page) => (
                      <button
                        key={page}
                        className={`page-btn ${page === pagination.current_page ? 'active' : ''}`}
                        onClick={() => handlePageChange(page)}
                        disabled={loading}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    className="pagination-btn"
                    onClick={handleNextPage}
                    disabled={pagination.current_page >= pagination.last_page || loading}
                  >
                    Next
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
              <h2>{isEditing ? 'Edit Lok Sabha Constituency' : 'Add New Lok Sabha Constituency'}</h2>
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
                <label htmlFor="loksabha_name">Lok Sabha Name</label>
                <input
                  type="text"
                  id="loksabha_name"
                  name="loksabha_name"
                  value={formData.loksabha_name}
                  onChange={handleInputChange}
                  placeholder="Enter Lok Sabha name"
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
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
                  disabled={loading || !formData.loksabha_name.trim()}
                >
                  {loading ? 'Processing...' : (isEditing ? 'Update Lok Sabha' : 'Create Lok Sabha')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddLokSabha;
