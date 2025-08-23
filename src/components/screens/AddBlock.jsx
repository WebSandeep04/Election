import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './css/AddBlock.css';
import { 
  fetchBlocks, 
  createBlock, 
  updateBlock, 
  deleteBlock,
  clearError,
  setCurrentPage
} from '../../store/slices/blockSlice';
import { fetchLokSabhas } from '../../store/slices/lokSabhaSlice';
import { fetchVidhanSabhas, fetchVidhanSabhasByLokSabha } from '../../store/slices/vidhanSabhaSlice';
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

const AddBlock = () => {
  const dispatch = useDispatch();
  const { blocks, loading, error, pagination } = useSelector((state) => state.block);
  const { lokSabhas } = useSelector((state) => state.lokSabha);
  const { vidhanSabhas } = useSelector((state) => state.vidhanSabha);
  const { navigationParams } = useSelector((state) => state.ui);
  const token = useSelector((state) => state.auth.token);
  
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filteredVidhanSabhas, setFilteredVidhanSabhas] = useState([]);
  const [formData, setFormData] = useState({
    loksabha_id: '',
    vidhansabha_id: '',
    block_name: '',
    block_status: '1',
    created_at: '',
    updated_at: ''
  });
  const [search, setSearch] = useState('');
  
  // Check if multiple names are entered
  const multipleNames = formData.block_name.includes(',') && 
    formData.block_name.split(',').filter(name => name.trim().length > 0).length > 1;

  // Fetch Blocks, Lok Sabhas, and Vidhan Sabhas on component mount and token change
  useEffect(() => {
    if (token) {
      dispatch(fetchBlocks({ page: pagination.current_page, search }));
      dispatch(fetchLokSabhas(1)); // Fetch all Lok Sabhas for dropdown
      dispatch(fetchVidhanSabhas(1)); // Fetch all Vidhan Sabhas for dropdown
    }
  }, [dispatch, token, pagination.current_page]);

  // Handle navigation parameters - auto-open modal with pre-selected Vidhan Sabha
  useEffect(() => {
    if (navigationParams && navigationParams.selectedVidhanSabhaId) {
      setFormData(prev => ({
        ...prev,
        loksabha_id: navigationParams.selectedLokSabhaId.toString(),
        vidhansabha_id: navigationParams.selectedVidhanSabhaId.toString()
      }));
      
      // Fetch Vidhan Sabhas for the selected Lok Sabha
      if (navigationParams.selectedLokSabhaId) {
        dispatch(fetchVidhanSabhasByLokSabha(navigationParams.selectedLokSabhaId))
          .then(result => {
            if (result.payload) {
              setFilteredVidhanSabhas(result.payload);
            }
          })
          .catch(error => {
            console.error('Error fetching Vidhan Sabhas:', error);
            setFilteredVidhanSabhas([]);
          });
      }
      
      setShowModal(true);
      // Clear navigation params after using them
      dispatch(setActiveScreen('add-block'));
    }
  }, [navigationParams, dispatch]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (token) dispatch(fetchBlocks({ page: 1, search }));
    }, 400);
    return () => clearTimeout(t);
  }, [search, token, dispatch]);

  // Handle Lok Sabha selection and fetch related Vidhan Sabhas
  const handleLokSabhaChange = async (e) => {
    const loksabhaId = e.target.value;
    
    setFormData(prev => ({
      ...prev,
      loksabha_id: loksabhaId,
      vidhansabha_id: '' // Reset Vidhan Sabha selection
    }));

    if (loksabhaId) {
      try {
        const result = await dispatch(fetchVidhanSabhasByLokSabha(loksabhaId));
        
        if (result.payload) {
          setFilteredVidhanSabhas(result.payload);
        }
      } catch (error) {
        console.error('Error fetching Vidhan Sabhas by Lok Sabha:', error);
        setFilteredVidhanSabhas([]);
      }
    } else {
      setFilteredVidhanSabhas([]);
    }
  };

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
    
    if (!formData.block_name.trim() || !formData.loksabha_id || !formData.vidhansabha_id) {
      return;
    }

    // Set timestamps
    const now = new Date().toISOString();
    const submitData = {
      ...formData,
      created_at: isEditing ? formData.created_at : now,
      updated_at: now
    };

    try {
      if (isEditing) {
        await dispatch(updateBlock({ id: editingId, blockData: submitData })).unwrap();
        setSuccess('Block updated successfully');
      } else {
        // Split names by comma and create multiple records
        const names = formData.block_name.split(',').map(name => name.trim()).filter(name => name.length > 0);
        
        if (names.length === 1) {
          // Single name - create one record
          await dispatch(createBlock({
            ...submitData,
            block_name: names[0]
          })).unwrap();
          setSuccess('Block created successfully');
        } else {
          // Multiple names - create multiple records
          const promises = names.map(name => 
            dispatch(createBlock({
              ...submitData,
              block_name: name
            })).unwrap()
          );
          
          await Promise.all(promises);
          setSuccess(`${names.length} Block constituencies created successfully`);
        }
      }
      
      // Refresh the current page
      dispatch(fetchBlocks(pagination.current_page));
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleEdit = (block) => {
    setFormData({
      loksabha_id: block.loksabha_id || '',
      vidhansabha_id: block.vidhansabha_id || '',
      block_name: block.block_name || '',
      block_status: block.block_status || '1',
      created_at: block.created_at || '',
      updated_at: block.updated_at || ''
    });
    
    // If editing, fetch related Vidhan Sabhas for the selected Lok Sabha
    if (block.loksabha_id) {
      dispatch(fetchVidhanSabhasByLokSabha(block.loksabha_id))
        .then(result => {
          if (result.payload) {
            setFilteredVidhanSabhas(result.payload);
          }
        })
        .catch(error => {
          console.error('Error fetching Vidhan Sabhas for edit:', error);
          setFilteredVidhanSabhas([]);
        });
    }
    
    setIsEditing(true);
    setEditingId(block.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this Block?')) {
      try {
        await dispatch(deleteBlock(id)).unwrap();
        setSuccess('Block deleted successfully');
        // Refresh the current page
        dispatch(fetchBlocks(pagination.current_page));
      } catch (error) {
        console.error('Error deleting Block:', error);
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
      vidhansabha_id: '',
      block_name: '',
      block_status: '1',
      created_at: '',
      updated_at: ''
    });
    setFilteredVidhanSabhas([]);
    setIsEditing(false);
    setEditingId(null);
  };

  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
  };

  const handleRefresh = () => {
    dispatch(fetchBlocks(pagination.current_page));
  };

  const handleBlockClick = (block) => {
    dispatch(setActiveScreenWithParams({
      screen: 'add-panchayat',
      params: { 
        selectedBlockId: block.id, 
        selectedBlockName: block.block_name,
        selectedVidhanSabhaId: block.vidhansabha_id,
        selectedVidhanSabhaName: block.vidhan_sabha?.vidhansabha_name || `Vidhan Sabha ${block.vidhansabha_id}`,
        selectedLokSabhaId: block.loksabha_id,
        selectedLokSabhaName: block.lok_sabha?.loksabha_name || `Lok Sabha ${block.loksabha_id}`
      }
    }));
  };

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
    dispatch(fetchBlocks(page));
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
      <div className="block-management">
        <div className="error-state">
          <h2>Error Loading Block Data</h2>
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
    <div className="block-management">
      <div className="block-header">
        <div className="header-content">
          <h1>Block Management</h1>
          <p>Manage administrative blocks and their relationships</p>
        </div>
        <div className="header-buttons">
          <button 
            className="btn btn-primary add-btn"
            onClick={handleAddNew}
            disabled={loading}
          >
            <PlusIcon />
            Add New Block
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
            placeholder="Search Blocks by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      {/* Block List Section */}
      <div className="block-list-section">
        <div className="list-header">
          <div className="list-header-left">
            <h2>Administrative Blocks</h2>
            <div className="pagination-info">
              Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total || 0} blocks
            </div>
            <div className="click-hint">
              💡 Click on any Block name to add Panchayat constituencies for that Block
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

        {loading && blocks.length === 0 ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading blocks...</p>
          </div>
        ) : blocks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏢</div>
            <h3>No blocks found</h3>
            <p>Add your first administrative block to get started.</p>
            <button 
              className="btn btn-primary"
              onClick={handleAddNew}
            >
              <PlusIcon />
              Add First Block
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
                    <th>Vidhan Sabha</th>
                    <th>Block Name</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Updated At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(blocks) && blocks.map((block) => (
                    <tr 
                      key={block.id}
                      className="clickable-row"
                      onClick={() => handleBlockClick(block)}
                    >
                      <td className="id-cell">#{block.id}</td>
                      <td className="loksabha-cell">
                        {block.lok_sabha?.loksabha_name || `Lok Sabha ${block.loksabha_id}`}
                      </td>
                      <td className="vidhansabha-cell">
                        {block.vidhan_sabha?.vidhansabha_name || `Vidhan Sabha ${block.vidhansabha_id}`}
                      </td>
                      <td className="name-cell">{block.block_name}</td>
                      <td className="status-cell">{block.block_status === '1' ? 'Active' : 'Inactive'}</td>
                      <td className="created-cell">{new Date(block.created_at).toLocaleDateString()}</td>
                      <td className="updated-cell">{new Date(block.updated_at).toLocaleDateString()}</td>
                      <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEdit(block)}
                          disabled={loading}
                          title="Edit Block"
                        >
                          <EditIcon />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(block.id)}
                          disabled={loading}
                          title="Delete Block"
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
                <h2>{isEditing ? 'Edit Block' : 'Add New Block'}</h2>
                {/* {navigationParams && navigationParams.selectedVidhanSabhaName && (
                  <div className="selected-vidhan-sabha-indicator">
                    <span className="indicator-label">Selected Vidhan Sabha:</span>
                    <span className="indicator-value">{navigationParams.selectedVidhanSabhaName}</span>
                  </div>
                )} */}
                {/* {navigationParams && navigationParams.selectedLokSabhaName && (
                  <div className="selected-lok-sabha-indicator">
                    <span className="indicator-label">Lok Sabha:</span>
                    <span className="indicator-value">{navigationParams.selectedLokSabhaName}</span>
                  </div>
                )} */}
                {multipleNames && (
                  <div className="multiple-names-indicator">
                    <span className="indicator-label">Multiple Blocks:</span>
                    <span className="indicator-value">
                      {formData.block_name.split(',').filter(name => name.trim().length > 0).length} blocks will be created
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
                  onChange={handleLokSabhaChange}
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
                <label htmlFor="vidhansabha_id">Vidhan Sabha *</label>
                <select
                  id="vidhansabha_id"
                  name="vidhansabha_id"
                  value={formData.vidhansabha_id}
                  onChange={handleInputChange}
                  required
                  disabled={loading || !formData.loksabha_id}
                >
                  <option value="">
                    {!formData.loksabha_id ? 'Select Lok Sabha first' : 
                     loading ? 'Loading Vidhan Sabhas...' : 
                     filteredVidhanSabhas.length === 0 ? 'No Vidhan Sabhas found' : 
                     'Select Vidhan Sabha'}
                  </option>
                  {Array.isArray(filteredVidhanSabhas) && filteredVidhanSabhas.map((vidhanSabha) => (
                    <option key={vidhanSabha.id} value={vidhanSabha.id}>
                      {vidhanSabha.vidhansabha_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="block_name">Block Name *</label>
                <input
                  type="text"
                  id="block_name"
                  name="block_name"
                  value={formData.block_name}
                  onChange={handleInputChange}
                  placeholder="Enter block name (use comma to add multiple)"
                  required
                  disabled={loading}
                  autoFocus
                />
                <div className="form-hint">
                  💡 You can add multiple blocks by separating names with commas (e.g., "Block 1, Block 2, Block 3")
                </div>
                {multipleNames && (
                  <div className="names-preview">
                    <div className="preview-label">Preview of blocks to be created:</div>
                    <div className="preview-list">
                      {formData.block_name.split(',').map((name, index) => {
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
              
              {/* <div className="form-group">
                <label htmlFor="block_status">Status</label>
                <select
                  id="block_status"
                  name="block_status"
                  value={formData.block_status}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </div> */}
              
              {/* <div className="form-row">
                <div className="form-group">
                  <label htmlFor="created_at">Created At</label>
                  <input
                    type="text"
                    id="created_at"
                    name="created_at"
                    value={formData.created_at ? new Date(formData.created_at).toLocaleString() : ''}
                    onChange={handleInputChange}
                    disabled
                    placeholder="Auto-generated on creation"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="updated_at">Updated At</label>
                  <input
                    type="text"
                    id="updated_at"
                    name="updated_at"
                    value={formData.updated_at ? new Date(formData.updated_at).toLocaleString() : ''}
                    onChange={handleInputChange}
                    disabled
                    placeholder="Auto-updated on save"
                  />
                </div>
              </div> */}
              
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
                  disabled={loading || !formData.block_name.trim() || !formData.loksabha_id || !formData.vidhansabha_id}
                >
                  {loading ? 'Processing...' : (isEditing ? 'Update Block' : 'Create Block')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddBlock;
