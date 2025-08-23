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
import { fetchVillageChoosings } from '../../store/slices/villageChoosingSlice';
import { setActiveScreen, setActiveScreenWithParams } from '../../store/slices/uiSlice';
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
  const { villageChoosings } = useSelector((state) => state.villageChoosing);
  const { navigationParams } = useSelector((state) => state.ui);
  const token = useSelector((state) => state.auth.token);
  
  // Helper function to get village type display text
  const getVillageTypeText = (type) => {
    // First try to find by ID in the database options
    if (Array.isArray(villageChoosings)) {
      const choosingOption = villageChoosings.find(option => option.id == type);
      if (choosingOption) {
        return choosingOption.name;
      }
    }
    
    // Fallback to hardcoded values for backward compatibility
    if (type == 1) return 'Ward';
    if (type == 2) return 'Village';
    return type;
  };
  
  // Helper function to get status display text
  const getStatusText = (status) => {
    if (status == 1) return 'Active';
    if (status == 0) return 'Inactive';
    return status;
  };
  
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
    village_choosing: '',
    village_name: '',
    village_status: '1',
    created_at: '',
    updated_at: ''
  });
  const [search, setSearch] = useState('');

  // Check if multiple names are provided
  const multipleNames = formData.village_name.includes(',') && formData.village_name.split(',').filter(name => name.trim().length > 0).length > 1;

  // Fetch data on component mount
  useEffect(() => {
    if (token) {
      dispatch(fetchVillages({ page: pagination.current_page, search }));
      dispatch(fetchLokSabhas(1)); // Fetch all Lok Sabhas for dropdown
      dispatch(fetchVidhanSabhas(1)); // Fetch all Vidhan Sabhas for dropdown
      dispatch(fetchBlocks(1)); // Fetch all Blocks for dropdown
      dispatch(fetchPanchayats(1)); // Fetch all Panchayats for dropdown
      dispatch(fetchVillageChoosings()); // Fetch village choosing options
    }
  }, [dispatch, token, pagination.current_page]);

  // Handle navigation parameters for pre-selection
  useEffect(() => {
    if (navigationParams && navigationParams.selectedPanchayatId) {
      setFormData(prev => ({
        ...prev,
        loksabha_id: navigationParams.selectedLokSabhaId.toString(),
        vidhansabha_id: navigationParams.selectedVidhanSabhaId.toString(),
        block_id: navigationParams.selectedBlockId.toString(),
        panchayat_id: navigationParams.selectedPanchayatId.toString()
      }));

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

      if (navigationParams.selectedVidhanSabhaId) {
        dispatch(fetchBlocksByVidhanSabha(navigationParams.selectedVidhanSabhaId))
          .then(result => {
            if (result.payload) {
              setFilteredBlocks(result.payload);
            }
          })
          .catch(error => {
            console.error('Error fetching Blocks:', error);
            setFilteredBlocks([]);
          });
      }

      if (navigationParams.selectedBlockId) {
        dispatch(fetchPanchayatsByBlock(navigationParams.selectedBlockId))
          .then(result => {
            if (result.payload) {
              setFilteredPanchayats(result.payload);
            }
          })
          .catch(error => {
            console.error('Error fetching Panchayats:', error);
            setFilteredPanchayats([]);
          });
      }
      setShowModal(true);
      dispatch(setActiveScreen('add-village')); // Clear navigation params
    }
  }, [navigationParams, dispatch]);

  // debounced server search
  useEffect(() => {
    const t = setTimeout(() => {
      if (token) dispatch(fetchVillages({ page: 1, search }));
    }, 400);
    return () => clearTimeout(t);
  }, [search, token, dispatch]);

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
    
    setFormData(prev => ({
      ...prev,
      loksabha_id: loksabhaId,
      vidhansabha_id: '', // Reset Vidhan Sabha selection
      block_id: '', // Reset Block selection
      panchayat_id: '' // Reset Panchayat selection
    }));

    if (loksabhaId) {
      try {
        const result = await dispatch(fetchVidhanSabhasByLokSabha(loksabhaId));
        
        if (result.payload) {
          setFilteredVidhanSabhas(result.payload);
        }
      } catch (error) {
        setFilteredVidhanSabhas([]);
      }
    } else {
      setFilteredVidhanSabhas([]);
      setFilteredBlocks([]);
      setFilteredPanchayats([]);
    }
  };

  // Handle Vidhan Sabha selection and fetch related Blocks
  const handleVidhanSabhaChange = async (e) => {
    const vidhansabhaId = e.target.value;
    
    setFormData(prev => ({
      ...prev,
      vidhansabha_id: vidhansabhaId,
      block_id: '', // Reset Block selection
      panchayat_id: '' // Reset Panchayat selection
    }));

    if (vidhansabhaId) {
      try {
        const result = await dispatch(fetchBlocksByVidhanSabha(vidhansabhaId));
        
        if (result.payload) {
          setFilteredBlocks(result.payload);
        }
      } catch (error) {
        setFilteredBlocks([]);
      }
    } else {
      setFilteredBlocks([]);
      setFilteredPanchayats([]);
    }
  };

  // Handle Block selection and fetch related Panchayats
  const handleBlockChange = async (e) => {
    const blockId = e.target.value;
    
    setFormData(prev => ({
      ...prev,
      block_id: blockId,
      panchayat_id: '' // Reset Panchayat selection
    }));

    if (blockId) {
      try {
        const result = await dispatch(fetchPanchayatsByBlock(blockId));
        
        if (result.payload) {
          setFilteredPanchayats(result.payload);
        }
      } catch (error) {
        setFilteredPanchayats([]);
      }
    } else {
      setFilteredPanchayats([]);
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
    
    if (!formData.village_name.trim() || !formData.loksabha_id || !formData.vidhansabha_id || !formData.block_id || !formData.panchayat_id || !formData.village_choosing) {
      return;
    }

    // Set timestamps
    const now = new Date().toISOString();
    
    // Check if multiple names are provided
    if (multipleNames) {
      // Split by comma, trim whitespace, and filter out empty names
      const names = formData.village_name.split(',')
        .map(name => name.trim())
        .filter(name => name.length > 0);
      
      // Get the village choosing name from the selected ID
      const selectedChoosing = Array.isArray(villageChoosings) 
        ? villageChoosings.find(option => option.id == formData.village_choosing)
        : null;
      
      try {
        // Create multiple villages using Promise.all
        await Promise.all(names.map(name => {
          const submitData = {
            loksabha_id: parseInt(formData.loksabha_id) || formData.loksabha_id,
            vidhansabha_id: parseInt(formData.vidhansabha_id) || formData.vidhansabha_id,
            block_id: parseInt(formData.block_id) || formData.block_id,
            panchayat_id: parseInt(formData.panchayat_id) || formData.panchayat_id,
            village_choosing_id: parseInt(formData.village_choosing) || formData.village_choosing,
            village_choosing: selectedChoosing ? selectedChoosing.name : formData.village_choosing,
            village_name: name,
            village_status: formData.village_status,
            created_at: now,
            updated_at: now
          };
          return dispatch(createVillage(submitData)).unwrap();
        }));
        
        setSuccess(`${names.length} Villages created successfully!`);
        setShowModal(false);
        resetForm();
      } catch (error) {
        console.error('Error creating multiple villages:', error);
      }
    } else {
      // Single village creation (existing logic)
      const selectedChoosing = Array.isArray(villageChoosings) 
        ? villageChoosings.find(option => option.id == formData.village_choosing)
        : null;
      
      const submitData = {
        loksabha_id: parseInt(formData.loksabha_id) || formData.loksabha_id,
        vidhansabha_id: parseInt(formData.vidhansabha_id) || formData.vidhansabha_id,
        block_id: parseInt(formData.block_id) || formData.block_id,
        panchayat_id: parseInt(formData.panchayat_id) || formData.panchayat_id,
        village_choosing_id: parseInt(formData.village_choosing) || formData.village_choosing,
        village_choosing: selectedChoosing ? selectedChoosing.name : formData.village_choosing,
        village_name: formData.village_name.trim(),
        village_status: formData.village_status,
        created_at: isEditing ? formData.created_at : now,
        updated_at: now
      };

      try {
        if (isEditing) {
          await dispatch(updateVillage({ id: editingId, villageData: submitData })).unwrap();
          setSuccess('Village updated successfully!');
        } else {
          await dispatch(createVillage(submitData)).unwrap();
          setSuccess('Village created successfully!');
        }
        
        setShowModal(false);
        resetForm();
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    }
  };

     const handleEdit = (village) => {
     setFormData({
       loksabha_id: village.loksabha_id || '',
       vidhansabha_id: village.vidhansabha_id || '',
       block_id: village.block_id || '',
       panchayat_id: village.panchayat_id || '',
       village_choosing: village.village_choosing_id || village.village_choosing || '',
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

  const handleVillageClick = (village) => {
    dispatch(setActiveScreenWithParams({
      screen: 'add-booth',
      params: {
        selectedVillageId: village.id,
        selectedVillageName: village.village_name,
        selectedPanchayatId: village.panchayat_id,
        selectedPanchayatName: village.panchayat?.panchayat_name || `Panchayat ${village.panchayat_id}`,
        selectedBlockId: village.block_id,
        selectedBlockName: village.block?.block_name || `Block ${village.block_id}`,
        selectedVidhanSabhaId: village.vidhansabha_id,
        selectedVidhanSabhaName: village.vidhan_sabha?.vidhansabha_name || `Vidhan Sabha ${village.vidhansabha_id}`,
        selectedLokSabhaId: village.loksabha_id,
        selectedLokSabhaName: village.lok_sabha?.loksabha_name || `Lok Sabha ${village.loksabha_id}`
      }
    }));
  };

  const resetForm = () => {
    setFormData({
      loksabha_id: '',
      vidhansabha_id: '',
      block_id: '',
      panchayat_id: '',
      village_choosing: '',
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

      {/* Search */}
      <div className="search-filters-section">
        <div className="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            type="text"
            placeholder="Search Villages by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

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
                  <tr key={village.id} className="clickable-row" onClick={() => handleVillageClick(village)}>
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
                      {getVillageTypeText(village.village_choosing)}
                    </td>
                    <td className="name-cell">{village.village_name}</td>
                    <td className="status-cell">
                      {getStatusText(village.village_status)}
                    </td>
                    <td className="created-cell">
                      {new Date(village.created_at).toLocaleDateString()}
                    </td>
                    <td className="updated-cell">
                      {new Date(village.updated_at).toLocaleDateString()}
                    </td>
                    <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
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

            <div className="click-hint">
              💡 Click on any Village name to add Booth constituencies for that Village
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
              <div className="modal-header-content">
                <h2>{isEditing ? 'Edit Village' : 'Add New Village'}</h2>
                {/* {navigationParams && navigationParams.selectedPanchayatName && (
                  <div className="selected-panchayat-indicator">
                    <span className="indicator-label">Selected Panchayat:</span>
                    <span className="indicator-value">{navigationParams.selectedPanchayatName}</span>
                  </div>
                )}
                {navigationParams && navigationParams.selectedBlockName && (
                  <div className="selected-block-indicator">
                    <span className="indicator-label">Block:</span>
                    <span className="indicator-value">{navigationParams.selectedBlockName}</span>
                  </div>
                )}
                {navigationParams && navigationParams.selectedVidhanSabhaName && (
                  <div className="selected-vidhan-sabha-indicator">
                    <span className="indicator-label">Vidhan Sabha:</span>
                    <span className="indicator-value">{navigationParams.selectedVidhanSabhaName}</span>
                  </div>
                )}
                {navigationParams && navigationParams.selectedLokSabhaName && (
                  <div className="selected-lok-sabha-indicator">
                    <span className="indicator-label">Lok Sabha:</span>
                    <span className="indicator-value">{navigationParams.selectedLokSabhaName}</span>
                  </div>
                )} */}
                {multipleNames && (
                  <div className="multiple-names-indicator">
                    <span className="indicator-label">Multiple Villages:</span>
                    <span className="indicator-value">
                      {formData.village_name.split(',').filter(name => name.trim().length > 0).length} villages will be created
                    </span>
                  </div>
                )}
              </div>
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
                    <option value="">Select Village Type</option>
                    {Array.isArray(villageChoosings) && villageChoosings.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                  {(!Array.isArray(villageChoosings) || villageChoosings.length === 0) && (
                    <small style={{color: 'orange'}}>
                      Loading village types from database...
                    </small>
                  )}
                </div>
                {/* <div className="form-group">
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
                </div> */}
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
                    placeholder="Enter village name (use comma to add multiple)"
                    required
                    disabled={loading}
                    autoFocus
                  />
                  <div className="form-hint">
                    💡 Tip: You can add multiple villages by separating names with commas (e.g., "Village1, Village2, Village3")
                  </div>
                  {multipleNames && (
                    <div className="names-preview">
                      <div className="preview-label">Villages that will be created:</div>
                      <div className="preview-list">
                        {formData.village_name.split(',').map((name, index) => name.trim()).filter(name => name.length > 0).map((name, index) => (
                          <div key={index} className="preview-item">
                            <span className="preview-number">#{index + 1}</span>
                            <span className="preview-name">{name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

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
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading || !formData.village_name.trim() || !formData.loksabha_id || !formData.vidhansabha_id || !formData.block_id || !formData.panchayat_id || !formData.village_choosing}
                >
                  {loading ? 'Processing...' : (isEditing ? 'Update Village' : 'Create Village')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddVillage;
