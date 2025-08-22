import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './css/AddVidhanSabha.css';
import { 
  fetchVidhanSabhas, 
  createVidhanSabha, 
  updateVidhanSabha, 
  deleteVidhanSabha,
  clearError,
  setCurrentPage
} from '../../store/slices/vidhanSabhaSlice';
import { fetchLokSabhas } from '../../store/slices/lokSabhaSlice';
import { setActiveScreen, setActiveScreenWithParams } from '../../store/slices/uiSlice';

// SVG Icons
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3,6 5,6 21,6"></polyline>
    <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23,4 23,10 17,10"></polyline>
    <polyline points="1,20 1,14 7,14"></polyline>
    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"></path>
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const AddVidhanSabha = () => {
  const dispatch = useDispatch();
  const { vidhanSabhas, loading, error, pagination } = useSelector((state) => state.vidhanSabha);
  const { lokSabhas } = useSelector((state) => state.lokSabha);
  const { navigationParams } = useSelector((state) => state.ui);
  const token = useSelector((state) => state.auth.token);
  
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    loksabha_id: '',
    vidhansabha_name: '',
    vidhan_status: '1'
  });
  const [search, setSearch] = useState('');
  
  // Check if multiple names are entered
  const multipleNames = formData.vidhansabha_name.includes(',') && 
    formData.vidhansabha_name.split(',').filter(name => name.trim().length > 0).length > 1;

  // Fetch Vidhan Sabhas and Lok Sabhas on component mount and token change
  useEffect(() => {
    if (token) {
      dispatch(fetchVidhanSabhas({ page: pagination.current_page, search }));
      dispatch(fetchLokSabhas(1)); // Fetch all Lok Sabhas for dropdown
    }
  }, [dispatch, token, pagination.current_page]);

  // Handle navigation parameters - auto-open modal with pre-selected Lok Sabha
  useEffect(() => {
    if (navigationParams && navigationParams.selectedLokSabhaId) {
      setFormData(prev => ({
        ...prev,
        loksabha_id: navigationParams.selectedLokSabhaId.toString()
      }));
      setShowModal(true);
      // Clear navigation params after using them
      dispatch(setActiveScreen('add-vidhan-sabha'));
    }
  }, [navigationParams, dispatch]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      if (token) dispatch(fetchVidhanSabhas({ page: 1, search }));
    }, 400);
    return () => clearTimeout(t);
  }, [search, token, dispatch]);

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
    
    if (!formData.vidhansabha_name.trim() || !formData.loksabha_id) {
      return;
    }

    try {
      if (isEditing) {
        await dispatch(updateVidhanSabha({ id: editingId, vidhanSabhaData: formData })).unwrap();
        setSuccess('Vidhan Sabha updated successfully');
      } else {
        // Split names by comma and create multiple records
        const names = formData.vidhansabha_name.split(',').map(name => name.trim()).filter(name => name.length > 0);
        
        if (names.length === 1) {
          // Single name - create one record
          await dispatch(createVidhanSabha({
            ...formData,
            vidhansabha_name: names[0]
          })).unwrap();
          setSuccess('Vidhan Sabha created successfully');
        } else {
          // Multiple names - create multiple records
          const promises = names.map(name => 
            dispatch(createVidhanSabha({
              ...formData,
              vidhansabha_name: name
            })).unwrap()
          );
          
          await Promise.all(promises);
          setSuccess(`${names.length} Vidhan Sabha constituencies created successfully`);
        }
      }
      
      // Refresh the current page
      dispatch(fetchVidhanSabhas(pagination.current_page));
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleEdit = (vidhanSabha) => {
    setFormData({
      loksabha_id: vidhanSabha.loksabha_id || '',
      vidhansabha_name: vidhanSabha.vidhansabha_name || '',
      vidhan_status: vidhanSabha.vidhan_status || '1'
    });
    setIsEditing(true);
    setEditingId(vidhanSabha.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this Vidhan Sabha?')) {
      try {
        await dispatch(deleteVidhanSabha(id)).unwrap();
        setSuccess('Vidhan Sabha deleted successfully');
        // Refresh the current page
        dispatch(fetchVidhanSabhas(pagination.current_page));
      } catch (error) {
        console.error('Error deleting Vidhan Sabha:', error);
      }
    }
  };

  const handleCancel = () => {
    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setFormData({
      loksabha_id: '',
      vidhansabha_name: '',
      vidhan_status: '1',
      created_at: '',
      updated_at: ''
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
  };

  const handleRefresh = () => {
    dispatch(fetchVidhanSabhas(pagination.current_page));
  };

  const handleVidhanSabhaClick = (vidhanSabha) => {
    dispatch(setActiveScreenWithParams({
      screen: 'add-block',
      params: { 
        selectedVidhanSabhaId: vidhanSabha.id, 
        selectedVidhanSabhaName: vidhanSabha.vidhansabha_name,
        selectedLokSabhaId: vidhanSabha.loksabha_id,
        selectedLokSabhaName: vidhanSabha.lok_sabha?.loksabha_name || `Lok Sabha ${vidhanSabha.loksabha_id}`
      }
    }));
  };

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
    dispatch(fetchVidhanSabhas(page));
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

  if (error && !loading) {
    return (
      <div className="vidhan-sabha-management">
        <div className="error-state">
          <h2>Error Loading Vidhan Sabha Data</h2>
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
    <div className="vidhan-sabha-management">
      <div className="vidhan-sabha-header">
        <div className="header-content">
          <h1>Vidhan Sabha Management</h1>
          <p>Manage Vidhan Sabha constituencies and MLA information</p>
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

      {/* Search */}
      <div className="search-filters-section">
        <div className="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            type="text"
            placeholder="Search Vidhan Sabha by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      {/* Vidhan Sabha List Section */}
      <div className="vidhan-sabha-list-section">
        <div className="list-header">
          <div className="list-header-left">
            <h2>Vidhan Sabha Constituencies</h2>
            <div className="pagination-info">
              Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total || 0} constituencies
            </div>
            <div className="click-hint">
              💡 Click on any Vidhan Sabha name to add Block constituencies for that Vidhan Sabha
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

        {loading && vidhanSabhas.length === 0 ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading Vidhan Sabha constituencies...</p>
          </div>
        ) : vidhanSabhas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏛️</div>
            <h3>No Vidhan Sabha constituencies found</h3>
            <p>Add your first Vidhan Sabha constituency to get started.</p>
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
                    <th>Lok Sabha</th>
                    <th>Vidhan Sabha Name</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Updated At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(vidhanSabhas) && vidhanSabhas.map((vidhanSabha) => (
                    <tr 
                      key={vidhanSabha.id}
                      className="clickable-row"
                      onClick={() => handleVidhanSabhaClick(vidhanSabha)}
                    >
                      <td className="id-cell">#{vidhanSabha.id}</td>
                      <td className="loksabha-cell">
                        {vidhanSabha.lok_sabha?.loksabha_name || `Lok Sabha ${vidhanSabha.loksabha_id}`}
                      </td>
                      <td className="name-cell">{vidhanSabha.vidhansabha_name}</td>
                      <td className="status-cell">{vidhanSabha.vidhan_status === '1' ? 'Active' : 'Inactive'}</td>
                      <td className="created-cell">{new Date(vidhanSabha.created_at).toLocaleDateString()}</td>
                      <td className="updated-cell">{new Date(vidhanSabha.updated_at).toLocaleDateString()}</td>
                      <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEdit(vidhanSabha)}
                          disabled={loading}
                          title="Edit Vidhan Sabha"
                        >
                          <EditIcon />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(vidhanSabha.id)}
                          disabled={loading}
                          title="Delete Vidhan Sabha"
                        >
                          <DeleteIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="pagination-container">
                <div className="pagination-info">
                  Page {pagination.current_page} of {pagination.last_page} ({pagination.total} total)
                </div>
                <div className="pagination-controls">
                  <button
                    className="btn btn-secondary"
                    onClick={handlePreviousPage}
                    disabled={pagination.current_page <= 1 || loading}
                  >
                    Previous
                  </button>
                  
                  <div className="page-numbers">
                    {generatePageNumbers().map(page => (
                      <button
                        key={page}
                        className={`btn ${page === pagination.current_page ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => handlePageChange(page)}
                        disabled={loading}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    className="btn btn-secondary"
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
              <div className="modal-header-content">
                <h2>{isEditing ? 'Edit Vidhan Sabha Constituency' : 'Add New Vidhan Sabha Constituency'}</h2>
                                 {navigationParams && navigationParams.selectedLokSabhaName && (
                   <div className="selected-lok-sabha-indicator">
                     <span className="indicator-label">Selected Lok Sabha:</span>
                     <span className="indicator-value">{navigationParams.selectedLokSabhaName}</span>
                   </div>
                 )}
                 {multipleNames && (
                   <div className="multiple-names-indicator">
                     <span className="indicator-label">Multiple Constituencies:</span>
                     <span className="indicator-value">
                       {formData.vidhansabha_name.split(',').filter(name => name.trim().length > 0).length} constituencies will be created
                     </span>
                   </div>
                 )}
              </div>
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
                <label htmlFor="loksabha_id">Lok Sabha *</label>
                <select
                  id="loksabha_id"
                  name="loksabha_id"
                  value={formData.loksabha_id}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  <option value="">Select Lok Sabha</option>
                  {Array.isArray(lokSabhas) && lokSabhas.map((lokSabha) => (
                    <option key={lokSabha.id} value={lokSabha.id}>
                      {lokSabha.loksabha_name}
                    </option>
                  ))}
                </select>
              </div>
              
                             <div className="form-group">
                 <label htmlFor="vidhansabha_name">Vidhan Sabha Name *</label>
                 <input
                   type="text"
                   id="vidhansabha_name"
                   name="vidhansabha_name"
                   value={formData.vidhansabha_name}
                   onChange={handleInputChange}
                   placeholder="Enter Vidhan Sabha name (use comma to add multiple)"
                   required
                   disabled={loading}
                   autoFocus
                 />
                 <div className="form-hint">
                   💡 You can add multiple constituencies by separating names with commas (e.g., "Constituency 1, Constituency 2, Constituency 3")
                 </div>
                 {multipleNames && (
                   <div className="names-preview">
                     <div className="preview-label">Preview of constituencies to be created:</div>
                     <div className="preview-list">
                       {formData.vidhansabha_name.split(',').map((name, index) => {
                         const trimmedName = name.trim();
                         if (trimmedName.length > 0) {
                           return (
                             <div key={index} className="preview-item">
                               <span className="preview-number">{index + 1}.</span>
                               <span className="preview-name">{trimmedName}</span>
                             </div>
                           );
                         }
                         return null;
                       })}
                     </div>
                   </div>
                 )}
               </div>
              
              <div className="form-group">
                <label htmlFor="vidhan_status">Status</label>
                <select
                  id="vidhan_status"
                  name="vidhan_status"
                  value={formData.vidhan_status}
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
                  disabled={loading || !formData.vidhansabha_name.trim() || !formData.loksabha_id}
                >
                  {loading ? 'Processing...' : (isEditing ? 'Update Vidhan Sabha' : 'Create Vidhan Sabha')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddVidhanSabha;
