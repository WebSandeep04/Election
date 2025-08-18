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
  const token = useSelector((state) => state.auth.token);
  
  // Debug authentication state
  console.log('Auth token:', token ? 'Present' : 'Missing');
  console.log('Auth state:', useSelector((state) => state.auth));
  
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

  // Fetch Blocks, Lok Sabhas, and Vidhan Sabhas on component mount and token change
  useEffect(() => {
    if (token) {
      dispatch(fetchBlocks(pagination.current_page));
      dispatch(fetchLokSabhas(1)); // Fetch all Lok Sabhas for dropdown
      dispatch(fetchVidhanSabhas(1)); // Fetch all Vidhan Sabhas for dropdown
    }
  }, [dispatch, token, pagination.current_page]);

  // Handle Lok Sabha selection and fetch related Vidhan Sabhas
  const handleLokSabhaChange = async (e) => {
    const loksabhaId = e.target.value;
    console.log('Lok Sabha selected:', loksabhaId);
    
    setFormData(prev => ({
      ...prev,
      loksabha_id: loksabhaId,
      vidhansabha_id: '' // Reset Vidhan Sabha selection
    }));

    if (loksabhaId) {
      try {
        console.log('Fetching Vidhan Sabhas for Lok Sabha ID:', loksabhaId);
        const result = await dispatch(fetchVidhanSabhasByLokSabha(loksabhaId));
        console.log('Vidhan Sabhas fetch result:', result);
        
        if (result.payload) {
          setFilteredVidhanSabhas(result.payload);
          console.log('Filtered Vidhan Sabhas set:', result.payload);
        }
      } catch (error) {
        console.error('Error fetching Vidhan Sabhas by Lok Sabha:', error);
        setFilteredVidhanSabhas([]);
      }
    } else {
      setFilteredVidhanSabhas([]);
      console.log('No Lok Sabha selected, cleared filtered Vidhan Sabhas');
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
        await dispatch(createBlock(submitData)).unwrap();
        setSuccess('Block created successfully');
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

  // Test API connection
  const testApiConnection = async () => {
    try {
      console.log('Testing Block API connection...');
      const response = await fetch('http://localhost:8000/api/blocks', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Test response status:', response.status);
      console.log('Test response headers:', Object.fromEntries(response.headers.entries()));
      const data = await response.text();
      console.log('Test response data:', data);
    } catch (error) {
      console.error('Test API error:', error);
    }
  };

  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
  };

  const handleRefresh = () => {
    dispatch(fetchBlocks(pagination.current_page));
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
            className="btn btn-secondary test-btn"
            onClick={testApiConnection}
            disabled={loading}
          >
            Test API
          </button>
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

      {/* Block List Section */}
      <div className="block-list-section">
        <div className="list-header">
          <div className="list-header-left">
            <h2>Administrative Blocks</h2>
            <div className="pagination-info">
              Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total || 0} blocks
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
                    <tr key={block.id}>
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
                      <td className="actions-cell">
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
              <h2>{isEditing ? 'Edit Block' : 'Add New Block'}</h2>
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
                  placeholder="Enter block name"
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>
              
              <div className="form-group">
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
              </div>
              
              <div className="form-row">
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
                  disabled={loading || !formData.block_name.trim() || !formData.loksabha_id || !formData.vidhansabha_id}
                >
                  {loading ? 'Processing...' : (isEditing ? 'Update Block' : 'Create Block')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* API Information */}
      <div className="api-info">
        <h3>API Endpoints Used:</h3>
        <ul>
          <li><strong>GET</strong> /api/blocks?page={pagination.current_page} - Fetch blocks (paginated)</li>
          <li><strong>GET</strong> /api/blocks/{'{id}'} - Get specific block</li>
          <li><strong>GET</strong> /api/blocks/lok-sabha/{'{loksabhaId}'} - Get blocks by Lok Sabha ID</li>
          <li><strong>GET</strong> /api/blocks/vidhan-sabha/{'{vidhansabhaId}'} - Get blocks by Vidhan Sabha ID</li>
          <li><strong>POST</strong> /api/blocks - Create new block</li>
          <li><strong>PUT</strong> /api/blocks/{'{id}'} - Update block</li>
          <li><strong>DELETE</strong> /api/blocks/{'{id}'} - Delete block</li>
        </ul>
        <p><strong>Current Page:</strong> {pagination.current_page} of {pagination.last_page}</p>
        <p><strong>Total Records:</strong> {pagination.total}</p>
        <p><strong>API Base URL:</strong> {import.meta.env.VITE_API_URL || 'http://localhost:8000'}</p>
        <p><strong>Authentication:</strong> {token ? '✅ Token Present' : '❌ Token Missing'}</p>
        <p><strong>Token Preview:</strong> {token ? `${token.substring(0, 20)}...` : 'None'}</p>
      </div>
    </div>
  );
};

export default AddBlock;
