import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './css/AddPanchayat.css';
import { 
  fetchPanchayats, 
  createPanchayat, 
  updatePanchayat, 
  deletePanchayat,
  clearError,
  setCurrentPage
} from '../../store/slices/panchayatSlice';
import { fetchLokSabhas } from '../../store/slices/lokSabhaSlice';
import { fetchVidhanSabhas, fetchVidhanSabhasByLokSabha } from '../../store/slices/vidhanSabhaSlice';
import { fetchBlocks, fetchBlocksByVidhanSabha } from '../../store/slices/blockSlice';

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

const AddPanchayat = () => {
  const dispatch = useDispatch();
  const { panchayats, loading, error, pagination } = useSelector((state) => state.panchayat);
  const { lokSabhas } = useSelector((state) => state.lokSabha);
  const { vidhanSabhas } = useSelector((state) => state.vidhanSabha);
  const { blocks } = useSelector((state) => state.block);
  const token = useSelector((state) => state.auth.token);
  
  // Debug authentication state
  console.log('Auth token:', token ? 'Present' : 'Missing');
  console.log('Auth state:', useSelector((state) => state.auth));
  
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filteredVidhanSabhas, setFilteredVidhanSabhas] = useState([]);
  const [filteredBlocks, setFilteredBlocks] = useState([]);
  const [formData, setFormData] = useState({
    loksabha_id: '',
    vidhansabha_id: '',
    block_id: '',
    panchayat_choosing: '1',
    panchayat_name: '',
    panchayat_status: '1',
    created_at: '',
    updated_at: ''
  });
  const [search, setSearch] = useState('');

  // Fetch Panchayats, Lok Sabhas, Vidhan Sabhas, and Blocks on component mount and token change
  useEffect(() => {
    if (token) {
      dispatch(fetchPanchayats({ page: pagination.current_page, search }));
      dispatch(fetchLokSabhas(1)); // Fetch all Lok Sabhas for dropdown
      dispatch(fetchVidhanSabhas(1)); // Fetch all Vidhan Sabhas for dropdown
      dispatch(fetchBlocks(1)); // Fetch all Blocks for dropdown
    }
  }, [dispatch, token, pagination.current_page]);

  // debounced server search
  useEffect(() => {
    const t = setTimeout(() => {
      if (token) dispatch(fetchPanchayats({ page: 1, search }));
    }, 400);
    return () => clearTimeout(t);
  }, [search, token, dispatch]);

  // Handle Lok Sabha selection and fetch related Vidhan Sabhas
  const handleLokSabhaChange = async (e) => {
    const loksabhaId = e.target.value;
    console.log('Lok Sabha selected:', loksabhaId);
    
    setFormData(prev => ({
      ...prev,
      loksabha_id: loksabhaId,
      vidhansabha_id: '', // Reset Vidhan Sabha selection
      block_id: '' // Reset Block selection
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
      setFilteredBlocks([]);
      console.log('No Lok Sabha selected, cleared filtered Vidhan Sabhas and Blocks');
    }
  };

  // Handle Vidhan Sabha selection and fetch related Blocks
  const handleVidhanSabhaChange = async (e) => {
    const vidhansabhaId = e.target.value;
    console.log('Vidhan Sabha selected:', vidhansabhaId);
    
    setFormData(prev => ({
      ...prev,
      vidhansabha_id: vidhansabhaId,
      block_id: '' // Reset Block selection
    }));

    if (vidhansabhaId) {
      try {
        console.log('Fetching Blocks for Vidhan Sabha ID:', vidhansabhaId);
        const result = await dispatch(fetchBlocksByVidhanSabha(vidhansabhaId));
        console.log('Blocks fetch result:', result);
        
        if (result.payload) {
          setFilteredBlocks(result.payload);
          console.log('Filtered Blocks set:', result.payload);
        }
      } catch (error) {
        console.error('Error fetching Blocks by Vidhan Sabha:', error);
        setFilteredBlocks([]);
      }
    } else {
      setFilteredBlocks([]);
      console.log('No Vidhan Sabha selected, cleared filtered Blocks');
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
    
    console.log('=== PANCHAYAT FORM SUBMISSION ===');
    console.log('Form Data:', formData);
    console.log('Is Editing:', isEditing);
    console.log('Editing ID:', editingId);
    
    if (!formData.panchayat_name.trim() || !formData.loksabha_id || !formData.vidhansabha_id || !formData.block_id) {
      console.error('Form validation failed:', {
        panchayat_name: formData.panchayat_name,
        loksabha_id: formData.loksabha_id,
        vidhansabha_id: formData.vidhansabha_id,
        block_id: formData.block_id
      });
      return;
    }

    // Set timestamps
    const now = new Date().toISOString();
    
    // Clean and validate the data
    const submitData = {
      loksabha_id: parseInt(formData.loksabha_id) || formData.loksabha_id,
      vidhansabha_id: parseInt(formData.vidhansabha_id) || formData.vidhansabha_id,
      block_id: parseInt(formData.block_id) || formData.block_id,
      panchayat_choosing: formData.panchayat_choosing,
      panchayat_name: formData.panchayat_name.trim(),
      panchayat_status: formData.panchayat_status,
      created_at: isEditing ? formData.created_at : now,
      updated_at: now
    };

    console.log('Submit Data:', submitData);
    console.log('Data types:', {
      loksabha_id: typeof submitData.loksabha_id,
      vidhansabha_id: typeof submitData.vidhansabha_id,
      block_id: typeof submitData.block_id,
      panchayat_choosing: typeof submitData.panchayat_choosing,
      panchayat_name: typeof submitData.panchayat_name,
      panchayat_status: typeof submitData.panchayat_status
    });

    try {
      if (isEditing) {
        console.log('Updating panchayat with ID:', editingId);
        await dispatch(updatePanchayat({ id: editingId, panchayatData: submitData })).unwrap();
        setSuccess('Panchayat updated successfully');
      } else {
        console.log('Creating new panchayat');
        await dispatch(createPanchayat(submitData)).unwrap();
        setSuccess('Panchayat created successfully');
      }
      
      // Refresh the current page
      dispatch(fetchPanchayats(pagination.current_page));
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
    }
  };

  const handleEdit = (panchayat) => {
    setFormData({
      loksabha_id: panchayat.loksabha_id || '',
      vidhansabha_id: panchayat.vidhansabha_id || '',
      block_id: panchayat.block_id || '',
      panchayat_choosing: panchayat.panchayat_choosing || '1',
      panchayat_name: panchayat.panchayat_name || '',
      panchayat_status: panchayat.panchayat_status || '1',
      created_at: panchayat.created_at || '',
      updated_at: panchayat.updated_at || ''
    });
    
    // If editing, fetch related Vidhan Sabhas for the selected Lok Sabha
    if (panchayat.loksabha_id) {
      dispatch(fetchVidhanSabhasByLokSabha(panchayat.loksabha_id))
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
    
    // If editing, fetch related Blocks for the selected Vidhan Sabha
    if (panchayat.vidhansabha_id) {
      dispatch(fetchBlocksByVidhanSabha(panchayat.vidhansabha_id))
        .then(result => {
          if (result.payload) {
            setFilteredBlocks(result.payload);
          }
        })
        .catch(error => {
          console.error('Error fetching Blocks for edit:', error);
          setFilteredBlocks([]);
        });
    }
    
    setIsEditing(true);
    setEditingId(panchayat.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this Panchayat?')) {
      try {
        await dispatch(deletePanchayat(id)).unwrap();
        setSuccess('Panchayat deleted successfully');
        // Refresh the current page
        dispatch(fetchPanchayats(pagination.current_page));
      } catch (error) {
        console.error('Error deleting Panchayat:', error);
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
      block_id: '',
      panchayat_choosing: '1',
      panchayat_name: '',
      panchayat_status: '1',
      created_at: '',
      updated_at: ''
    });
    setFilteredVidhanSabhas([]);
    setFilteredBlocks([]);
    setIsEditing(false);
    setEditingId(null);
  };

  // Test API connection
  const testApiConnection = async () => {
    try {
      console.log('Testing Panchayat API connection...');
      const response = await fetch('http://localhost:8000/api/panchayats', {
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

  // Test Panchayat creation with sample data
  const testPanchayatCreation = async () => {
    try {
      console.log('Testing Panchayat creation with sample data...');
      const sampleData = {
        loksabha_id: 1,
        vidhansabha_id: 1,
        block_id: 1,
        panchayat_choosing: '1',
        panchayat_name: 'Test Panchayat',
        panchayat_status: '1'
      };
      
      console.log('Sample data:', sampleData);
      
      const response = await fetch('http://localhost:8000/api/panchayats', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(sampleData)
      });
      
      console.log('Test creation response status:', response.status);
      console.log('Test creation response headers:', Object.fromEntries(response.headers.entries()));
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('Test creation response data:', data);
      } else {
        const data = await response.text();
        console.log('Test creation response text:', data);
      }
    } catch (error) {
      console.error('Test creation error:', error);
    }
  };

  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
  };

  const handleRefresh = () => {
    dispatch(fetchPanchayats(pagination.current_page));
  };

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
    dispatch(fetchPanchayats(page));
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
      <div className="panchayat-management">
        <div className="error-state">
          <h2>Error Loading Panchayat Data</h2>
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
    <div className="panchayat-management">
      <div className="panchayat-header">
        <div className="header-content">
          <h1>Panchayat Management</h1>
          <p>Manage local panchayats and their administrative structure</p>
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
             className="btn btn-secondary test-btn"
             onClick={testPanchayatCreation}
             disabled={loading}
           >
             Test Create
           </button>
           <button 
             className="btn btn-primary add-btn"
             onClick={handleAddNew}
             disabled={loading}
           >
             <PlusIcon />
             Add New Panchayat
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
            placeholder="Search Panchayats by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      {/* Panchayat List Section */}
      <div className="panchayat-list-section">
        <div className="list-header">
          <div className="list-header-left">
            <h2>Local Panchayats</h2>
            <div className="pagination-info">
              Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total || 0} panchayats
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

        {loading && panchayats.length === 0 ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading panchayats...</p>
          </div>
        ) : panchayats.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏘️</div>
            <h3>No panchayats found</h3>
            <p>Add your first local panchayat to get started.</p>
            <button 
              className="btn btn-primary"
              onClick={handleAddNew}
            >
              <PlusIcon />
              Add First Panchayat
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
                    <th>Block</th>
                    <th>Panchayat Name</th>
                    <th>Panchayat Type</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Updated At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(panchayats) && panchayats.map((panchayat) => (
                    <tr key={panchayat.id}>
                      <td className="id-cell">#{panchayat.id}</td>
                      <td className="loksabha-cell">
                        {panchayat.lok_sabha?.loksabha_name || `Lok Sabha ${panchayat.loksabha_id}`}
                      </td>
                      <td className="vidhansabha-cell">
                        {panchayat.vidhan_sabha?.vidhansabha_name || `Vidhan Sabha ${panchayat.vidhansabha_id}`}
                      </td>
                      <td className="block-cell">
                        {panchayat.block?.block_name || `Block ${panchayat.block_id}`}
                      </td>
                      <td className="name-cell">{panchayat.panchayat_name}</td>
                      <td className="choosing-cell">
                        {panchayat.panchayat_choosing === '1' ? 'Mahanagar Pallika' : 
                         panchayat.panchayat_choosing === '2' ? 'Gram Panchayat' : 
                         panchayat.panchayat_choosing}
                      </td>
                      <td className="status-cell">{panchayat.panchayat_status === '1' ? 'Active' : 'Inactive'}</td>
                      <td className="created-cell">{new Date(panchayat.created_at).toLocaleDateString()}</td>
                      <td className="updated-cell">{new Date(panchayat.updated_at).toLocaleDateString()}</td>
                      <td className="actions-cell">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEdit(panchayat)}
                          disabled={loading}
                          title="Edit Panchayat"
                        >
                          <EditIcon />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(panchayat.id)}
                          disabled={loading}
                          title="Delete Panchayat"
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
              <h2>{isEditing ? 'Edit Panchayat' : 'Add New Panchayat'}</h2>
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
                  onChange={handleVidhanSabhaChange}
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
                <label htmlFor="block_id">Block *</label>
                <select
                  id="block_id"
                  name="block_id"
                  value={formData.block_id}
                  onChange={handleInputChange}
                  required
                  disabled={loading || !formData.vidhansabha_id}
                >
                  <option value="">
                    {!formData.vidhansabha_id ? 'Select Vidhan Sabha first' : 
                     loading ? 'Loading Blocks...' : 
                     filteredBlocks.length === 0 ? 'No Blocks found' : 
                     'Select Block'}
                  </option>
                  {Array.isArray(filteredBlocks) && filteredBlocks.map((block) => (
                    <option key={block.id} value={block.id}>
                      {block.block_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="panchayat_name">Panchayat Name *</label>
                <input
                  type="text"
                  id="panchayat_name"
                  name="panchayat_name"
                  value={formData.panchayat_name}
                  onChange={handleInputChange}
                  placeholder="Enter panchayat name"
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="panchayat_choosing">Panchayat Type</label>
                <select
                  id="panchayat_choosing"
                  name="panchayat_choosing"
                  value={formData.panchayat_choosing}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  <option value="1">Mahanagar Pallika</option>
                  <option value="2">Gram Panchayat</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="panchayat_status">Status</label>
                <select
                  id="panchayat_status"
                  name="panchayat_status"
                  value={formData.panchayat_status}
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
                  disabled={loading || !formData.panchayat_name.trim() || !formData.loksabha_id || !formData.vidhansabha_id || !formData.block_id}
                >
                  {loading ? 'Processing...' : (isEditing ? 'Update Panchayat' : 'Create Panchayat')}
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
           <li><strong>GET</strong> /api/panchayats?page={pagination.current_page} - Fetch panchayats (paginated)</li>
           <li><strong>GET</strong> /api/panchayats/{'{id}'} - Get specific panchayat</li>
           <li><strong>GET</strong> /api/panchayats/lok-sabha/{'{loksabhaId}'} - Get panchayats by Lok Sabha ID</li>
           <li><strong>GET</strong> /api/panchayats/vidhan-sabha/{'{vidhansabhaId}'} - Get panchayats by Vidhan Sabha ID</li>
           <li><strong>GET</strong> /api/panchayats/block/{'{blockId}'} - Get panchayats by Block ID</li>
           <li><strong>GET</strong> /api/vidhan-sabhas/lok-sabha/{'{loksabhaId}'} - Get Vidhan Sabhas by Lok Sabha ID</li>
           <li><strong>GET</strong> /api/blocks/vidhan-sabha/{'{vidhansabhaId}'} - Get Blocks by Vidhan Sabha ID</li>
           <li><strong>POST</strong> /api/panchayats - Create new panchayat</li>
           <li><strong>PUT</strong> /api/panchayats/{'{id}'} - Update panchayat</li>
           <li><strong>DELETE</strong> /api/panchayats/{'{id}'} - Delete panchayat</li>
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

export default AddPanchayat;
