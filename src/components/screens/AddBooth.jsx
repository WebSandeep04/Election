import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './css/AddBooth.css';
import {
  fetchBooths, createBooth, updateBooth, deleteBooth,
  clearError, setCurrentPage
} from '../../store/slices/boothSlice';
import { fetchLokSabhas } from '../../store/slices/lokSabhaSlice';
import { fetchVidhanSabhas, fetchVidhanSabhasByLokSabha } from '../../store/slices/vidhanSabhaSlice';
import { fetchBlocks, fetchBlocksByVidhanSabha } from '../../store/slices/blockSlice';
import { fetchPanchayats, fetchPanchayatsByBlock } from '../../store/slices/panchayatSlice';
import { fetchVillages, fetchVillagesByPanchayat } from '../../store/slices/villageSlice';
import { fetchVillageChoosings } from '../../store/slices/villageChoosingSlice';
import { fetchPanchayatChoosings } from '../../store/slices/panchayatChoosingSlice';
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

const AddBooth = () => {
  const dispatch = useDispatch();
  const { booths, loading, error, pagination } = useSelector((state) => state.booth);
  const { lokSabhas } = useSelector((state) => state.lokSabha);
  const { vidhanSabhas } = useSelector((state) => state.vidhanSabha);
  const { blocks } = useSelector((state) => state.block);
  const { panchayats } = useSelector((state) => state.panchayat);
  const { villages } = useSelector((state) => state.village);
  const { villageChoosings } = useSelector((state) => state.villageChoosing);
  const { panchayatChoosings } = useSelector((state) => state.panchayatChoosing);
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

  // Helper function to get panchayat type display text
  const getPanchayatTypeText = (type) => {
    // First try to find by ID in the database options
    if (Array.isArray(panchayatChoosings)) {
      const choosingOption = panchayatChoosings.find(option => option.id == type);
      if (choosingOption) {
        return choosingOption.name;
      }
    }
    
    // Fallback to hardcoded values for backward compatibility
    if (type == 1) return 'Mahanagar Pallika';
    if (type == 2) return 'Gram Panchayat';
    return type;
  };
  
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filteredVidhanSabhas, setFilteredVidhanSabhas] = useState([]);
  const [filteredBlocks, setFilteredBlocks] = useState([]);
  const [filteredPanchayats, setFilteredPanchayats] = useState([]);
  const [filteredVillages, setFilteredVillages] = useState([]);
  const [formData, setFormData] = useState({
    loksabha_id: '',
    vidhansabha_id: '',
    block_id: '',
    panchayat_id: '',
    panchayat_choosing: '',
    village_id: '',
    village_choosing: '',
    booth_name: '',
    booth_status: '1',
    created_at: '',
    updated_at: ''
  });
  const [search, setSearch] = useState('');

  // Check if multiple names are being entered
  const multipleNames = formData.booth_name.includes(',') && formData.booth_name.split(',').filter(name => name.trim().length > 0).length > 1;

  // Handle navigation params for pre-selection
  useEffect(() => {
    if (navigationParams && navigationParams.selectedVillageId) {
      setFormData(prev => ({
        ...prev,
        loksabha_id: navigationParams.selectedLokSabhaId.toString(),
        vidhansabha_id: navigationParams.selectedVidhanSabhaId.toString(),
        block_id: navigationParams.selectedBlockId.toString(),
        panchayat_id: navigationParams.selectedPanchayatId.toString(),
        village_id: navigationParams.selectedVillageId.toString()
      }));
      
      // Fetch filtered data for the selected hierarchy
      const fetchFilteredData = async () => {
        try {
          // Fetch Vidhan Sabhas for the selected Lok Sabha
          const vidhanResult = await dispatch(fetchVidhanSabhasByLokSabha(navigationParams.selectedLokSabhaId));
          if (vidhanResult.payload) {
            setFilteredVidhanSabhas(vidhanResult.payload);
          }
          
          // Fetch Blocks for the selected Vidhan Sabha
          const blockResult = await dispatch(fetchBlocksByVidhanSabha(navigationParams.selectedVidhanSabhaId));
          if (blockResult.payload) {
            setFilteredBlocks(blockResult.payload);
          }
          
          // Fetch Panchayats for the selected Block
          const panchayatResult = await dispatch(fetchPanchayatsByBlock(navigationParams.selectedBlockId));
          if (panchayatResult.payload) {
            setFilteredPanchayats(panchayatResult.payload);
          }
          
          // Fetch Villages for the selected Panchayat
          const villageResult = await dispatch(fetchVillagesByPanchayat(navigationParams.selectedPanchayatId));
          if (villageResult.payload) {
            setFilteredVillages(villageResult.payload);
          }
        } catch (error) {
          console.error('Error fetching filtered data:', error);
        }
      };
      
      fetchFilteredData();
      setShowModal(true);
      dispatch(setActiveScreen('add-booth')); // Clear navigation params
    }
  }, [navigationParams, dispatch]);

  // Fetch data on component mount
  useEffect(() => {
    if (token) {
      dispatch(fetchBooths({ page: pagination.current_page, search }));
      dispatch(fetchLokSabhas(1)); // Fetch all Lok Sabhas for dropdown
      dispatch(fetchVidhanSabhas(1)); // Fetch all Vidhan Sabhas for dropdown
      dispatch(fetchBlocks(1)); // Fetch all Blocks for dropdown
      dispatch(fetchPanchayats(1)); // Fetch all Panchayats for dropdown
      dispatch(fetchVillages(1)); // Fetch all Villages for dropdown
      dispatch(fetchVillageChoosings()); // Fetch village choosing options
      dispatch(fetchPanchayatChoosings()); // Fetch panchayat choosing options
    }
  }, [dispatch, token, pagination.current_page]);

  // debounced server search
  useEffect(() => {
    const t = setTimeout(() => {
      if (token) dispatch(fetchBooths({ page: 1, search }));
    }, 400);
    return () => clearTimeout(t);
  }, [search, token, dispatch]);

  // Handle Lok Sabha selection and fetch related Vidhan Sabhas
  const handleLokSabhaChange = async (e) => {
    const loksabhaId = e.target.value;
    
    setFormData(prev => ({
      ...prev,
      loksabha_id: loksabhaId,
      vidhansabha_id: '', // Reset Vidhan Sabha selection
      block_id: '', // Reset Block selection
      panchayat_id: '', // Reset Panchayat selection
      village_id: '' // Reset Village selection
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
      setFilteredBlocks([]);
      setFilteredPanchayats([]);
      setFilteredVillages([]);
    }
  };

  // Handle Vidhan Sabha selection and fetch related Blocks
  const handleVidhanSabhaChange = async (e) => {
    const vidhansabhaId = e.target.value;
    
    setFormData(prev => ({
      ...prev,
      vidhansabha_id: vidhansabhaId,
      block_id: '', // Reset Block selection
      panchayat_id: '', // Reset Panchayat selection
      village_id: '' // Reset Village selection
    }));

    if (vidhansabhaId) {
      try {
        const result = await dispatch(fetchBlocksByVidhanSabha(vidhansabhaId));
        
        if (result.payload) {
          setFilteredBlocks(result.payload);
        }
      } catch (error) {
        console.error('Error fetching Blocks by Vidhan Sabha:', error);
        setFilteredBlocks([]);
      }
    } else {
      setFilteredBlocks([]);
      setFilteredPanchayats([]);
      setFilteredVillages([]);
    }
  };

  // Handle Block selection and fetch related Panchayats
  const handleBlockChange = async (e) => {
    const blockId = e.target.value;
    
    setFormData(prev => ({
      ...prev,
      block_id: blockId,
      panchayat_id: '', // Reset Panchayat selection
      village_id: '' // Reset Village selection
    }));

    if (blockId) {
      try {
        const result = await dispatch(fetchPanchayatsByBlock(blockId));
        
        if (result.payload) {
          setFilteredPanchayats(result.payload);
        }
      } catch (error) {
        console.error('Error fetching Panchayats by Block:', error);
        setFilteredPanchayats([]);
      }
    } else {
      setFilteredPanchayats([]);
      setFilteredVillages([]);
    }
  };

  // Handle Panchayat selection and fetch related Villages
  const handlePanchayatChange = async (e) => {
    const panchayatId = e.target.value;
    
    if (panchayatId) {
      // Find the selected panchayat from filtered panchayats
      const selectedPanchayat = filteredPanchayats.find(panchayat => panchayat.id == panchayatId);
      
      if (selectedPanchayat) {
        
        // Automatically set the panchayat type based on the selected panchayat's choosing value
        const panchayatType = selectedPanchayat.panchayat_choosing_id || selectedPanchayat.panchayat_choosing;
        
        setFormData(prev => ({
          ...prev,
          panchayat_id: panchayatId,
          panchayat_choosing: panchayatType || '', // Default to empty if not found
          village_id: '' // Reset Village selection
        }));
        
      } else {
        setFormData(prev => ({
          ...prev,
          panchayat_id: panchayatId,
          panchayat_choosing: '',
          village_id: '' // Reset Village selection
        }));
      }

      try {
        const result = await dispatch(fetchVillagesByPanchayat(panchayatId));
        
        if (result.payload) {
          setFilteredVillages(result.payload);
        }
      } catch (error) {
        console.error('Error fetching Villages by Panchayat:', error);
        setFilteredVillages([]);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        panchayat_id: '',
        panchayat_choosing: '',
        village_id: ''
      }));
      setFilteredVillages([]);
    }
  };

  // Handle Village selection and automatically set village type
  const handleVillageChange = (e) => {
    const villageId = e.target.value;
    
    if (villageId) {
      // Find the selected village from filtered villages
      const selectedVillage = filteredVillages.find(village => village.id == villageId);
      
      if (selectedVillage) {
        
        // Automatically set the village type based on the selected village's choosing value
        const villageType = selectedVillage.village_choosing_id || selectedVillage.village_choosing;
        
        setFormData(prev => ({
          ...prev,
          village_id: villageId,
          village_choosing: villageType || '' // Default to empty if not found
        }));
        
      }
    } else {
      setFormData(prev => ({
        ...prev,
        village_id: '',
        village_choosing: '' // Reset to empty
      }));
    }
  };

  useEffect(() => {
    if (success) {
      // Refresh the list when success message appears
      dispatch(fetchBooths(pagination.current_page));
      
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
    
    if (!formData.booth_name.trim() || !formData.loksabha_id || !formData.vidhansabha_id || !formData.block_id || !formData.panchayat_id || !formData.panchayat_choosing || !formData.village_id || !formData.village_choosing) {
      return;
    }

    // Set timestamps
    const now = new Date().toISOString();
    
    // Get the village choosing name from the selected ID
    const selectedChoosing = Array.isArray(villageChoosings) 
      ? villageChoosings.find(option => option.id == formData.village_choosing)
      : null;
    
    // Get the panchayat choosing name from the selected ID
    const selectedPanchayatChoosing = Array.isArray(panchayatChoosings) 
      ? panchayatChoosings.find(option => option.id == formData.panchayat_choosing)
      : null;
    
    try {
      if (multipleNames) {
        // Handle multiple booth names
        const names = formData.booth_name.split(',').map(name => name.trim()).filter(name => name.length > 0);
        
        await Promise.all(names.map(name => {
          const submitData = {
            loksabha_id: parseInt(formData.loksabha_id) || formData.loksabha_id,
            vidhansabha_id: parseInt(formData.vidhansabha_id) || formData.vidhansabha_id,
            block_id: parseInt(formData.block_id) || formData.block_id,
            panchayat_id: parseInt(formData.panchayat_id) || formData.panchayat_id,
            panchayat_choosing_id: parseInt(formData.panchayat_choosing) || formData.panchayat_choosing,
            panchayat_choosing: selectedPanchayatChoosing ? selectedPanchayatChoosing.name : formData.panchayat_choosing,
            village_id: parseInt(formData.village_id) || formData.village_id,
            village_choosing_id: parseInt(formData.village_choosing) || formData.village_choosing,
            village_choosing: selectedChoosing ? selectedChoosing.name : formData.village_choosing,
            booth_name: name,
            booth_status: formData.booth_status,
            created_at: now,
            updated_at: now
          };
          
          return dispatch(createBooth(submitData));
        }));
        
        setSuccess(`${names.length} Booths created successfully!`);
      } else {
        // Handle single booth creation
    const submitData = {
      loksabha_id: parseInt(formData.loksabha_id) || formData.loksabha_id,
      vidhansabha_id: parseInt(formData.vidhansabha_id) || formData.vidhansabha_id,
      block_id: parseInt(formData.block_id) || formData.block_id,
      panchayat_id: parseInt(formData.panchayat_id) || formData.panchayat_id,
      panchayat_choosing_id: parseInt(formData.panchayat_choosing) || formData.panchayat_choosing,
      panchayat_choosing: selectedPanchayatChoosing ? selectedPanchayatChoosing.name : formData.panchayat_choosing,
      village_id: parseInt(formData.village_id) || formData.village_id,
      village_choosing_id: parseInt(formData.village_choosing) || formData.village_choosing,
      village_choosing: selectedChoosing ? selectedChoosing.name : formData.village_choosing,
      booth_name: formData.booth_name.trim(),
      booth_status: formData.booth_status,
      created_at: isEditing ? formData.created_at : now,
      updated_at: now
    };

      if (isEditing) {
        await dispatch(updateBooth({ id: editingId, boothData: submitData }));
      } else {
        await dispatch(createBooth(submitData));
      }
      
      setSuccess(isEditing ? 'Booth updated successfully!' : 'Booth created successfully!');
      }
      
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleEdit = (booth) => {
    setFormData({
      loksabha_id: booth.loksabha_id || '',
      vidhansabha_id: booth.vidhansabha_id || '',
      block_id: booth.block_id || '',
      panchayat_id: booth.panchayat_id || '',
      panchayat_choosing: booth.panchayat_choosing_id || booth.panchayat_choosing || '',
      village_id: booth.village_id || '',
      village_choosing: booth.village_choosing_id || booth.village_choosing || '',
      booth_name: booth.booth_name || '',
      booth_status: booth.booth_status || '1',
      created_at: booth.created_at || '',
      updated_at: booth.updated_at || ''
    });
    
    // If editing, fetch related Vidhan Sabhas for the selected Lok Sabha
    if (booth.loksabha_id) {
      dispatch(fetchVidhanSabhasByLokSabha(booth.loksabha_id))
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
    if (booth.vidhansabha_id) {
      dispatch(fetchBlocksByVidhanSabha(booth.vidhansabha_id))
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
    if (booth.block_id) {
      dispatch(fetchPanchayatsByBlock(booth.block_id))
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
    
    // If editing, fetch related Villages for the selected Panchayat
    if (booth.panchayat_id) {
      dispatch(fetchVillagesByPanchayat(booth.panchayat_id))
        .then(result => {
          if (result.payload) {
            setFilteredVillages(result.payload);
          }
        })
        .catch(error => {
          console.error('Error fetching Villages for edit:', error);
          setFilteredVillages([]);
        });
    }
    
    setIsEditing(true);
    setEditingId(booth.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this booth?')) {
      try {
        await dispatch(deleteBooth(id));
        setSuccess('Booth deleted successfully!');
      } catch (error) {
        console.error('Error deleting booth:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      loksabha_id: '',
      vidhansabha_id: '',
      block_id: '',
      panchayat_id: '',
      panchayat_choosing: '',
      village_id: '',
      village_choosing: '',
      booth_name: '',
      booth_status: '1',
      created_at: '',
      updated_at: ''
    });
    setFilteredVidhanSabhas([]);
    setFilteredBlocks([]);
    setFilteredPanchayats([]);
    setFilteredVillages([]);
    setIsEditing(false);
    setEditingId(null);
  };

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
    dispatch(fetchBooths(page));
  };

  return (
    <div className="booth-management">
      {/* Header */}
      <div className="booth-header">
        <div className="header-content">
          <h1>Booth Management</h1>
          <p>Manage booths and booth-level information</p>
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
            Add New Booth
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
            placeholder="Search Booths by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      {/* Booth List Section */}
      <div className="booth-list-section">
        <div className="list-header">
          <div className="list-header-left">
            <h2>Booths</h2>
            <div className="pagination-info">
              Showing {booths.length} booths
            </div>
          </div>
          <button 
            className="btn btn-secondary refresh-btn"
            onClick={() => dispatch(fetchBooths(pagination.current_page))}
            disabled={loading}
          >
            <RefreshIcon />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {loading && booths.length === 0 ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading booths...</p>
          </div>
        ) : booths.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏛️</div>
            <h3>No booths found</h3>
            <p>Add your first booth to get started.</p>
            <button 
              className="btn btn-primary"
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              <PlusIcon />
              Add First Booth
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
                  <th>Panchayat Type</th>
                  <th>Village</th>
                  <th>Village Type</th>
                  <th>Booth Name</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Updated At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {booths.map((booth) => (
                  <tr key={booth.id}>
                    <td className="id-cell">#{booth.id}</td>
                    <td className="loksabha-cell">
                      {booth.lok_sabha?.loksabha_name || 'N/A'}
                    </td>
                    <td className="vidhansabha-cell">
                      {booth.vidhan_sabha?.vidhansabha_name || 'N/A'}
                    </td>
                    <td className="block-cell">
                      {booth.block?.block_name || 'N/A'}
                    </td>
                    <td className="panchayat-cell">
                      {booth.panchayat?.panchayat_name || 'N/A'}
                    </td>
                    <td className="panchayat-type-cell">
                      {booth.panchayat_choosing_data?.name || getPanchayatTypeText(booth.panchayat_choosing_id || booth.panchayat_choosing)}
                    </td>
                    <td className="village-cell">
                       {booth.village?.village_name || 'N/A'}
                     </td>
                     <td className="village-type-cell">
                       {booth.village_choosing_data?.name || getVillageTypeText(booth.village_choosing_id || booth.village_choosing)}
                     </td>
                     <td className="name-cell">{booth.booth_name}</td>
                    <td className="status-cell">
                      {booth.booth_status === '1' ? 'Active' : 'Inactive'}
                    </td>
                    <td className="created-cell">
                      {new Date(booth.created_at).toLocaleDateString()}
                    </td>
                    <td className="updated-cell">
                      {new Date(booth.updated_at).toLocaleDateString()}
                    </td>
                    <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(booth)}
                        disabled={loading}
                        title="Edit booth"
                      >
                        <EditIcon />
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(booth.id)}
                        disabled={loading}
                        title="Delete booth"
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
              ({pagination.total} total booths)
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
              <h2>{isEditing ? 'Edit Booth' : 'Add New Booth'}</h2>
                {/* {navigationParams && navigationParams.selectedVillageName && (
                  <div className="selected-village-indicator">
                    <span className="indicator-label">Selected Village:</span>
                    <span className="indicator-value">{navigationParams.selectedVillageName}</span>
                  </div>
                )}
                {navigationParams && navigationParams.selectedPanchayatName && (
                  <div className="selected-panchayat-indicator">
                    <span className="indicator-label">Selected Panchayat:</span>
                    <span className="indicator-value">{navigationParams.selectedPanchayatName}</span>
                  </div>
                )}
                {navigationParams && navigationParams.selectedBlockName && (
                  <div className="selected-block-indicator">
                    <span className="indicator-label">Selected Block:</span>
                    <span className="indicator-value">{navigationParams.selectedBlockName}</span>
                  </div>
                )}
                {navigationParams && navigationParams.selectedVidhanSabhaName && (
                  <div className="selected-vidhan-sabha-indicator">
                    <span className="indicator-label">Selected Vidhan Sabha:</span>
                    <span className="indicator-value">{navigationParams.selectedVidhanSabhaName}</span>
                  </div>
                )}
                {navigationParams && navigationParams.selectedLokSabhaName && (
                  <div className="selected-lok-sabha-indicator">
                    <span className="indicator-label">Selected Lok Sabha:</span>
                    <span className="indicator-value">{navigationParams.selectedLokSabhaName}</span>
                  </div>
                )} */}
                {multipleNames && (
                  <div className="multiple-names-indicator">
                    <span className="indicator-label">Multiple Booths:</span>
                    <span className="indicator-value">
                      {formData.booth_name.split(',').filter(name => name.trim().length > 0).length} booths will be created
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
                    onChange={handlePanchayatChange}
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
                <div className="form-group">
                  <label htmlFor="panchayat_choosing">Panchayat Type *</label>
                  <select
                    id="panchayat_choosing"
                    name="panchayat_choosing"
                    value={formData.panchayat_choosing}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  >
                    <option value="">Select Panchayat Type</option>
                    {Array.isArray(panchayatChoosings) && panchayatChoosings.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                  {(!Array.isArray(panchayatChoosings) || panchayatChoosings.length === 0) && (
                    <small style={{color: 'orange'}}>
                      Loading panchayat types from database...
                    </small>
                  )}
                </div>
              </div>

                             <div className="form-row">
                 <div className="form-group">
                   <label htmlFor="village_id">Village *</label>
                   <select
                     id="village_id"
                     name="village_id"
                     value={formData.village_id}
                     onChange={handleVillageChange}
                     required
                     disabled={loading || !formData.panchayat_id}
                   >
                     <option value="">
                       {!formData.panchayat_id ? 'Select Panchayat first' : 
                        loading ? 'Loading Villages...' : 
                        filteredVillages.length === 0 ? 'No Villages found' : 
                        'Select Village'}
                     </option>
                     {Array.isArray(filteredVillages) && filteredVillages.map((village) => (
                       <option key={village.id} value={village.id}>
                         {village.village_name}
                       </option>
                     ))}
                   </select>
                 </div>
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
               </div>

               <div className="form-row">
                 <div className="form-group">
                   <label htmlFor="booth_name">Booth Name *</label>
                   <input
                     type="text"
                     id="booth_name"
                     name="booth_name"
                     value={formData.booth_name}
                     onChange={handleInputChange}
                    placeholder="Enter booth name (use comma to add multiple)"
                     required
                     disabled={loading}
                     autoFocus
                   />
                  <div className="form-hint">
                    💡 Tip: You can add multiple booths by separating names with commas (e.g., "Booth1, Booth2, Booth3")
                 </div>
                  {multipleNames && (
                    <div className="names-preview">
                      <div className="preview-label">Booths that will be created:</div>
                      <div className="preview-list">
                        {formData.booth_name.split(',').map((name, index) => name.trim()).filter(name => name.length > 0).map((name, index) => (
                          <div key={index} className="preview-item">
                            <span className="preview-number">#{index + 1}</span>
                            <span className="preview-name">{name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {/* <div className="form-group">
                   <label htmlFor="booth_status">Status</label>
                   <select
                     id="booth_status"
                     name="booth_status"
                     value={formData.booth_status}
                     onChange={handleInputChange}
                     disabled={loading}
                   >
                     <option value="1">Active</option>
                     <option value="0">Inactive</option>
                   </select>
                </div> */}
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
                  disabled={loading || !formData.booth_name.trim() || !formData.loksabha_id || !formData.vidhansabha_id || !formData.block_id || !formData.panchayat_id || !formData.panchayat_choosing || !formData.village_id || !formData.village_choosing}
                >
                  {loading ? 'Processing...' : (isEditing ? 'Update Booth' : 'Create Booth')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddBooth;
