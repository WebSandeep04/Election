import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './css/AddVillage.css';
import {
  fetchVillages, createVillage, updateVillage, deleteVillage,
  clearError, setCurrentPage
} from '../../store/slices/villageSlice';
import { fetchLokSabhas } from '../../store/slices/lokSabhaSlice';
import { fetchVidhanSabhas, fetchVidhanSabhasByLokSabha } from '../../store/slices/vidhanSabhaSlice';
import { fetchBlocks, fetchBlocksByVidhanSabha } from '../../store/slices/blockSlice';
import { fetchPanchayats, fetchPanchayatsByBlock } from '../../store/slices/panchayatSlice';
import { API_CONFIG, getApiUrl } from '../../config/api';

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

const AddVillage = () => {
  const dispatch = useDispatch();
  const { villages, loading, error, pagination } = useSelector((state) => state.village);
  const { lokSabhas } = useSelector((state) => state.lokSabha);
  const { vidhanSabhas } = useSelector((state) => state.vidhanSabha);
  const { blocks } = useSelector((state) => state.block);
  const { panchayats } = useSelector((state) => state.panchayat);
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
  const [filteredPanchayats, setFilteredPanchayats] = useState([]);
  const [formData, setFormData] = useState({
    loksabha_id: '',
    vidhansabha_id: '',
    block_id: '',
    panchayat_id: '',
    village_choosing: '2',
    village_name: '',
    village_status: '1',
    created_at: '',
    updated_at: ''
  });

  // Fetch data on component mount
  useEffect(() => {
    if (token) {
      dispatch(fetchVillages(pagination.current_page));
      dispatch(fetchLokSabhas(1)); // Fetch all Lok Sabhas for dropdown
      dispatch(fetchVidhanSabhas(1)); // Fetch all Vidhan Sabhas for dropdown
      dispatch(fetchBlocks(1)); // Fetch all Blocks for dropdown
      dispatch(fetchPanchayats(1)); // Fetch all Panchayats for dropdown
    }
  }, [dispatch, token, pagination.current_page]);

  useEffect(() => {
    if (success) {
      // Refresh the list when success message appears
      dispatch(fetchVillages(pagination.current_page));
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    }
  }, [success, dispatch, pagination.current_page]);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearError());
      }, 5000);
    }
  }, [error, dispatch]);

  // Handle Lok Sabha selection and fetch related Vidhan Sabhas
  const handleLokSabhaChange = async (e) => {
    const loksabhaId = e.target.value;
    console.log('Lok Sabha selected:', loksabhaId);
    
    setFormData(prev => ({
      ...prev,
      loksabha_id: loksabhaId,
      vidhansabha_id: '', // Reset Vidhan Sabha selection
      block_id: '', // Reset Block selection
      panchayat_id: '' // Reset Panchayat selection
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
      setFilteredPanchayats([]);
      console.log('No Lok Sabha selected, cleared filtered data');
    }
  };

  // Handle Vidhan Sabha selection and fetch related Blocks
  const handleVidhanSabhaChange = async (e) => {
    const vidhansabhaId = e.target.value;
    console.log('Vidhan Sabha selected:', vidhansabhaId);
    
    setFormData(prev => ({
      ...prev,
      vidhansabha_id: vidhansabhaId,
      block_id: '', // Reset Block selection
      panchayat_id: '' // Reset Panchayat selection
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
      setFilteredPanchayats([]);
      console.log('No Vidhan Sabha selected, cleared filtered Blocks and Panchayats');
    }
  };

  // Handle Block selection and fetch related Panchayats
  const handleBlockChange = async (e) => {
    const blockId = e.target.value;
    console.log('Block selected:', blockId);
    
    setFormData(prev => ({
      ...prev,
      block_id: blockId,
      panchayat_id: '' // Reset Panchayat selection
    }));

    if (blockId) {
      try {
        console.log('Fetching Panchayats for Block ID:', blockId);
        const result = await dispatch(fetchPanchayatsByBlock(blockId));
        console.log('Panchayats fetch result:', result);
        
        if (result.payload) {
          setFilteredPanchayats(result.payload);
          console.log('Filtered Panchayats set:', result.payload);
        }
      } catch (error) {
        console.error('Error fetching Panchayats by Block:', error);
        setFilteredPanchayats([]);
      }
    } else {
      setFilteredPanchayats([]);
      console.log('No Block selected, cleared filtered Panchayats');
    }
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('=== VILLAGE FORM SUBMISSION ===');
    console.log('Form Data:', formData);
    console.log('Is Editing:', isEditing);
    console.log('Editing ID:', editingId);
    
    if (!formData.village_name.trim() || !formData.loksabha_id || !formData.vidhansabha_id || !formData.block_id || !formData.panchayat_id) {
      console.error('Form validation failed:', {
        village_name: formData.village_name,
        loksabha_id: formData.loksabha_id,
        vidhansabha_id: formData.vidhansabha_id,
        block_id: formData.block_id,
        panchayat_id: formData.panchayat_id
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
      panchayat_id: parseInt(formData.panchayat_id) || formData.panchayat_id,
      village_choosing: formData.village_choosing,
      village_name: formData.village_name.trim(),
      village_status: formData.village_status,
      created_at: isEditing ? formData.created_at : now,
      updated_at: now
    };

    console.log('Submit Data:', submitData);
    console.log('Data types:', {
      loksabha_id: typeof submitData.loksabha_id,
      vidhansabha_id: typeof submitData.vidhansabha_id,
      block_id: typeof submitData.block_id,
      panchayat_id: typeof submitData.panchayat_id,
      village_choosing: typeof submitData.village_choosing,
      village_name: typeof submitData.village_name,
      village_status: typeof submitData.village_status
    });

    try {
      if (isEditing) {
        console.log('Updating village with ID:', editingId);
        await dispatch(updateVillage({ id: editingId, villageData: submitData })).unwrap();
        setSuccess('Village updated successfully!');
      } else {
        console.log('Creating new village');
        await dispatch(createVillage(submitData)).unwrap();
        setSuccess('Village created successfully!');
      }
      
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
    }
  };

  const handleEdit = (village) => {
    setFormData({
      loksabha_id: village.loksabha_id || '',
      vidhansabha_id: village.vidhansabha_id || '',
      block_id: village.block_id || '',
      panchayat_id: village.panchayat_id || '',
      village_choosing: village.village_choosing || '2',
      village_name: village.village_name || '',
      village_status: village.village_status || '1',
      created_at: village.created_at || '',
      updated_at: village.updated_at || ''
    });
    
    // If editing, fetch related Vidhan Sabhas for the selected Lok Sabha
    if (village.loksabha_id) {
      dispatch(fetchVidhanSabhasByLokSabha(village.loksabha_id))
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
    if (village.vidhansabha_id) {
      dispatch(fetchBlocksByVidhanSabha(village.vidhansabha_id))
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
    
    // If editing, fetch related Panchayats for the selected Block
    if (village.block_id) {
      dispatch(fetchPanchayatsByBlock(village.block_id))
        .then(result => {
          if (result.payload) {
            setFilteredPanchayats(result.payload);
          }
        })
        .catch(error => {
          console.error('Error fetching Panchayats for edit:', error);
          setFilteredPanchayats([]);
        });
    }
    
    setIsEditing(true);
    setEditingId(village.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this village?')) {
      try {
        await dispatch(deleteVillage(id));
        setSuccess('Village deleted successfully!');
      } catch (error) {
        console.error('Error deleting village:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      loksabha_id: '',
      vidhansabha_id: '',
      block_id: '',
      panchayat_id: '',
      village_choosing: '2',
      village_name: '',
      village_status: '1',
      created_at: '',
      updated_at: ''
    });
    setFilteredVidhanSabhas([]);
    setFilteredBlocks([]);
    setFilteredPanchayats([]);
    setIsEditing(false);
    setEditingId(null);
  };

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
    dispatch(fetchVillages(page));
  };

  const handleTestAPI = async () => {
    console.log('=== TESTING VILLAGE API ===');
    console.log('Auth token:', token ? 'Present' : 'Missing');
    console.log('Auth state:', useSelector((state) => state.auth));
    
    try {
      const response = await fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.VILLAGE)}?page=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Test API Response Status:', response.status);
      console.log('Test API Response Headers:', response.headers);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Test API Response Data:', data);
        alert('✅ API Test Successful! Check console for details.');
      } else {
        const errorText = await response.text();
        console.error('Test API Error Response:', errorText);
        alert(`❌ API Test Failed! Status: ${response.status}. Check console for details.`);
      }
    } catch (error) {
      console.error('Test API Error:', error);
      alert(`❌ API Test Error: ${error.message}`);
    }
  };

  return (
    <div className="village-management">
      {/* Header */}
      <div className="village-header">
        <div className="header-content">
          <h1>Village Management</h1>
          <p>Manage villages and village-level information</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-secondary test-api-btn"
            onClick={handleTestAPI}
            disabled={loading}
          >
            <RefreshIcon />
            Test API
          </button>
          <button 
            className="btn btn-primary add-btn"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            disabled={loading}
          >
            <PlusIcon />
            Add New Village
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

      {/* Village List Section */}
      <div className="village-list-section">
        <div className="list-header">
          <div className="list-header-left">
            <h2>Villages</h2>
            <div className="pagination-info">
              Showing {villages.length} villages
            </div>
          </div>
          <button 
            className="btn btn-secondary refresh-btn"
            onClick={() => dispatch(fetchVillages(pagination.current_page))}
            disabled={loading}
          >
            <RefreshIcon />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {loading && villages.length === 0 ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading villages...</p>
          </div>
        ) : villages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏘️</div>
            <h3>No villages found</h3>
            <p>Add your first village to get started.</p>
            <button 
              className="btn btn-primary"
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              <PlusIcon />
              Add First Village
            </button>
          </div>
        ) : (
          <div className="modern-table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Lok Sabha</th>
                  <th>Vidhan Sabha</th>
                  <th>Block</th>
                  <th>Panchayat</th>
                  <th>Type</th>
                  <th>Village Name</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Updated At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {villages.map((village) => (
                  <tr key={village.id}>
                    <td className="id-cell">#{village.id}</td>
                    <td className="loksabha-cell">
                      {village.lok_sabha?.loksabha_name || 'N/A'}
                    </td>
                    <td className="vidhansabha-cell">
                      {village.vidhan_sabha?.vidhansabha_name || 'N/A'}
                    </td>
                    <td className="block-cell">
                      {village.block?.block_name || 'N/A'}
                    </td>
                    <td className="panchayat-cell">
                      {village.panchayat?.panchayat_name || 'N/A'}
                    </td>
                    <td className="type-cell">
                      {village.village_choosing === '1' ? 'Ward' : 
                       village.village_choosing === '2' ? 'Village' : 
                       village.village_choosing}
                    </td>
                    <td className="name-cell">{village.village_name}</td>
                    <td className="status-cell">
                      {village.village_status === '1' ? 'Active' : 'Inactive'}
                    </td>
                    <td className="created-cell">
                      {new Date(village.created_at).toLocaleDateString()}
                    </td>
                    <td className="updated-cell">
                      {new Date(village.updated_at).toLocaleDateString()}
                    </td>
                    <td className="actions-cell">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(village)}
                        disabled={loading}
                        title="Edit village"
                      >
                        <EditIcon />
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(village.id)}
                        disabled={loading}
                        title="Delete village"
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
      </div>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(pagination.current_page - 1)}
            disabled={pagination.current_page === 1 || loading}
          >
            Previous
          </button>
          
          <div className="page-info">
            Page {pagination.current_page} of {pagination.last_page}
            <span className="total-info">
              ({pagination.total} total villages)
            </span>
          </div>
          
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(pagination.current_page + 1)}
            disabled={pagination.current_page === pagination.last_page || loading}
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Village' : 'Add New Village'}</h2>
              <button 
                className="btn-icon btn-close"
                onClick={() => setShowModal(false)}
                title="Close modal"
              >
                <CloseIcon />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
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
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="block_id">Block *</label>
                  <select
                    id="block_id"
                    name="block_id"
                    value={formData.block_id}
                    onChange={handleBlockChange}
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
                  <label htmlFor="panchayat_id">Panchayat *</label>
                  <select
                    id="panchayat_id"
                    name="panchayat_id"
                    value={formData.panchayat_id}
                    onChange={handleInputChange}
                    required
                    disabled={loading || !formData.block_id}
                  >
                    <option value="">
                      {!formData.block_id ? 'Select Block first' : 
                       loading ? 'Loading Panchayats...' : 
                       filteredPanchayats.length === 0 ? 'No Panchayats found' : 
                       'Select Panchayat'}
                    </option>
                    {Array.isArray(filteredPanchayats) && filteredPanchayats.map((panchayat) => (
                      <option key={panchayat.id} value={panchayat.id}>
                        {panchayat.panchayat_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="village_choosing">Type *</label>
                  <select
                    id="village_choosing"
                    name="village_choosing"
                    value={formData.village_choosing}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  >
                    <option value="1">Ward</option>
                    <option value="2">Village</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="village_status">Status</label>
                  <select
                    id="village_status"
                    name="village_status"
                    value={formData.village_status}
                    onChange={handleInputChange}
                    disabled={loading}
                  >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="village_name">Village Name *</label>
                  <input
                    type="text"
                    id="village_name"
                    name="village_name"
                    value={formData.village_name}
                    onChange={handleInputChange}
                    placeholder="Enter village name"
                    required
                    disabled={loading}
                    autoFocus
                  />
                </div>
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
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading || !formData.village_name.trim() || !formData.loksabha_id || !formData.vidhansabha_id || !formData.block_id || !formData.panchayat_id}
                >
                  {loading ? 'Processing...' : (isEditing ? 'Update Village' : 'Create Village')}
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
          <li><strong>GET</strong> {getApiUrl(API_CONFIG.ENDPOINTS.VILLAGE)}?page={pagination.current_page} - Fetch villages (paginated)</li>
          <li><strong>GET</strong> {getApiUrl(API_CONFIG.ENDPOINTS.VILLAGE)}/&#123;id&#125; - Get specific village</li>
          <li><strong>GET</strong> {getApiUrl(API_CONFIG.ENDPOINTS.VILLAGE)}/lok-sabha/&#123;loksabhaId&#125; - Get villages by Lok Sabha ID</li>
          <li><strong>GET</strong> {getApiUrl(API_CONFIG.ENDPOINTS.VILLAGE)}/vidhan-sabha/&#123;vidhansabhaId&#125; - Get villages by Vidhan Sabha ID</li>
          <li><strong>GET</strong> {getApiUrl(API_CONFIG.ENDPOINTS.VILLAGE)}/block/&#123;blockId&#125; - Get villages by Block ID</li>
          <li><strong>GET</strong> {getApiUrl(API_CONFIG.ENDPOINTS.VILLAGE)}/panchayat/&#123;panchayatId&#125; - Get villages by Panchayat ID</li>
          <li><strong>GET</strong> {getApiUrl(API_CONFIG.ENDPOINTS.VIDHAN_SABHA)}/lok-sabha/&#123;loksabhaId&#125; - Get Vidhan Sabhas by Lok Sabha ID</li>
          <li><strong>GET</strong> {getApiUrl(API_CONFIG.ENDPOINTS.BLOCK)}/vidhan-sabha/&#123;vidhansabhaId&#125; - Get Blocks by Vidhan Sabha ID</li>
          <li><strong>GET</strong> {getApiUrl(API_CONFIG.ENDPOINTS.PANCHAYAT)}/block/&#123;blockId&#125; - Get Panchayats by Block ID</li>
          <li><strong>POST</strong> {getApiUrl(API_CONFIG.ENDPOINTS.VILLAGE)} - Create new village</li>
          <li><strong>PUT</strong> {getApiUrl(API_CONFIG.ENDPOINTS.VILLAGE)}/&#123;id&#125; - Update village</li>
          <li><strong>DELETE</strong> {getApiUrl(API_CONFIG.ENDPOINTS.VILLAGE)}/&#123;id&#125; - Delete village</li>
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

export default AddVillage;
