import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCasteRatios,
  createCasteRatio,
  updateCasteRatio,
  deleteCasteRatio,
  fetchCasteRatioById,
  clearError,
  clearSuccess,
  setCurrentCasteRatio,
  clearCurrentCasteRatio,
  setCurrentPage,
} from '../../store/slices/casteRatioSlice';
import { fetchCastes } from '../../store/slices/casteSlice';
import { fetchLokSabhas } from '../../store/slices/lokSabhaSlice';
import { fetchVidhanSabhas, fetchVidhanSabhasByLokSabha } from '../../store/slices/vidhanSabhaSlice';
import { fetchBlocks, fetchBlocksByVidhanSabha } from '../../store/slices/blockSlice';
import { fetchPanchayats, fetchPanchayatsByBlock } from '../../store/slices/panchayatSlice';
import { fetchVillages, fetchVillagesByPanchayat } from '../../store/slices/villageSlice';
import { fetchBooths, fetchBoothsByVillage } from '../../store/slices/boothSlice';
import { fetchPanchayatChoosings } from '../../store/slices/panchayatChoosingSlice';
import { fetchVillageChoosings } from '../../store/slices/villageChoosingSlice';
import { hasPermission } from '../../utils/permissions';
import './css/CasteRatio.css';

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

const CasteRatio = () => {
  const dispatch = useDispatch();
  const { castRatios, currentCasteRatio, loading, error, success, pagination } = useSelector((state) => state.casteRatio);
  const { castes } = useSelector((state) => state.caste);
  const { lokSabhas } = useSelector((state) => state.lokSabha);
  const { vidhanSabhas } = useSelector((state) => state.vidhanSabha);
  const { blocks } = useSelector((state) => state.block);
  const { panchayats } = useSelector((state) => state.panchayat);
  const { villages } = useSelector((state) => state.village);
  const { booths } = useSelector((state) => state.booth);
  const { panchayatChoosings } = useSelector((state) => state.panchayatChoosing);
  const { villageChoosings } = useSelector((state) => state.villageChoosing);
  const { user } = useSelector((state) => state.auth);
  const { token } = useSelector((state) => state.auth);

  // Debug logging
  useEffect(() => {
    console.log('CasteRatio Redux State:', {
      castes: castes?.length || 0,
      lokSabhas: lokSabhas?.length || 0,
      vidhanSabhas: vidhanSabhas?.length || 0,
      blocks: blocks?.length || 0,
      panchayats: panchayats?.length || 0,
      villages: villages?.length || 0,
      booths: booths?.length || 0,
      panchayatChoosings: panchayatChoosings?.length || 0,
      villageChoosings: villageChoosings?.length || 0
    });
  }, [castes, lokSabhas, vidhanSabhas, blocks, panchayats, villages, booths, panchayatChoosings, villageChoosings]);

  // Filtered data for hierarchical dropdowns
  const [filteredVidhanSabhas, setFilteredVidhanSabhas] = useState([]);
  const [filteredBlocks, setFilteredBlocks] = useState([]);
  const [filteredPanchayats, setFilteredPanchayats] = useState([]);
  const [filteredVillages, setFilteredVillages] = useState([]);
  const [filteredBooths, setFilteredBooths] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    loksabha_id: '',
    vidhansabha_id: '',
    block_id: '',
    panchayat_choosing_id: '',
    panchayat_id: '',
    village_choosing_id: '',
    village_id: '',
    booth_id: '',
    caste_id: '',
    caste_ratio: ''
  });

  // Multiple caste ratios state
  const [casteRatios, setCasteRatios] = useState([]);
  const [selectedCaste, setSelectedCaste] = useState('');
  const [casteRatio, setCasteRatio] = useState('');

  // Helper function to get panchayat type display text
  const getPanchayatTypeText = (type) => {
    if (Array.isArray(panchayatChoosings)) {
      const choosingOption = panchayatChoosings.find(option => option.id == type);
      if (choosingOption) {
        return choosingOption.name;
      }
    }
    if (type == 1) return 'Mahanagar Pallika';
    if (type == 2) return 'Gram Panchayat';
    return type;
  };

  // Helper function to get village type display text
  const getVillageTypeText = (type) => {
    if (Array.isArray(villageChoosings)) {
      const choosingOption = villageChoosings.find(option => option.id == type);
      if (choosingOption) {
        return choosingOption.name;
      }
    }
    if (type == 1) return 'Ward';
    if (type == 2) return 'Village';
    return type;
  };

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    caste_id: '',
    loksabha_id: '',
    vidhansabha_id: '',
    block_id: '',
    panchayat_id: '',
    village_id: '',
    booth_id: '',
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  // Check permissions
  const canManageCastRatios = user && hasPermission(user, 'manage_cast_ratios');

  // Fetch data on component mount
  useEffect(() => {
    if (token) {
      console.log('CasteRatio: Loading initial data...');
      dispatch(fetchCasteRatios({ page: pagination.current_page, search, ...filters }));
      dispatch(fetchCastes(1));
      dispatch(fetchLokSabhas(1));
      dispatch(fetchVidhanSabhas(1));
      dispatch(fetchBlocks(1));
      dispatch(fetchPanchayats(1));
      dispatch(fetchVillages(1));
      dispatch(fetchBooths(1));
      dispatch(fetchPanchayatChoosings());
      dispatch(fetchVillageChoosings());
    }
  }, [dispatch, token, pagination.current_page]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (token) {
        dispatch(fetchCasteRatios({ page: 1, search, ...filters }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search, filters, token, dispatch]);

  // Clear success/error messages
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

  // Handle Lok Sabha selection and fetch related Vidhan Sabhas
  const handleLokSabhaChange = async (e) => {
    const loksabhaId = e.target.value;
    console.log('CasteRatio: Lok Sabha changed to:', loksabhaId);
    
    setFormData(prev => ({
      ...prev,
      loksabha_id: loksabhaId,
      vidhansabha_id: '',
      block_id: '',
      panchayat_choosing_id: '',
      panchayat_id: '',
      village_choosing_id: '',
      village_id: '',
      booth_id: ''
    }));

    if (loksabhaId) {
      try {
        console.log('CasteRatio: Fetching Vidhan Sabhas for Lok Sabha:', loksabhaId);
        const result = await dispatch(fetchVidhanSabhasByLokSabha(loksabhaId));
        console.log('CasteRatio: Vidhan Sabhas result:', result);
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
      setFilteredBooths([]);
    }
  };

  // Handle Vidhan Sabha selection and fetch related Blocks
  const handleVidhanSabhaChange = async (e) => {
    const vidhansabhaId = e.target.value;
    
    setFormData(prev => ({
      ...prev,
      vidhansabha_id: vidhansabhaId,
      block_id: '',
      panchayat_choosing_id: '',
      panchayat_id: '',
      village_choosing_id: '',
      village_id: '',
      booth_id: ''
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
      setFilteredBooths([]);
    }
  };

  // Handle Block selection and fetch related Panchayats
  const handleBlockChange = async (e) => {
    const blockId = e.target.value;
    
    setFormData(prev => ({
      ...prev,
      block_id: blockId,
      panchayat_choosing_id: '',
      panchayat_id: '',
      village_choosing_id: '',
      village_id: '',
      booth_id: ''
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
      setFilteredBooths([]);
    }
  };

  // Handle Panchayat selection and fetch related Villages
  const handlePanchayatChange = async (e) => {
    const panchayatId = e.target.value;
    
    setFormData(prev => ({
      ...prev,
      panchayat_id: panchayatId,
      village_choosing_id: '',
      village_id: '',
      booth_id: ''
    }));

    if (panchayatId) {
      try {
        const result = await dispatch(fetchVillagesByPanchayat(panchayatId));
        if (result.payload) {
          setFilteredVillages(result.payload);
        }

        // Auto-select panchayat choosing based on selected panchayat
        const selectedPanchayat = Array.isArray(filteredPanchayats) 
          ? filteredPanchayats.find(p => p.id == panchayatId)
          : null;
        
        console.log('CasteRatio: Selected panchayat:', selectedPanchayat);
        
        if (selectedPanchayat && selectedPanchayat.panchayat_choosing_id) {
          console.log('CasteRatio: Auto-setting panchayat_choosing_id to:', selectedPanchayat.panchayat_choosing_id);
          setFormData(prev => ({
            ...prev,
            panchayat_choosing_id: selectedPanchayat.panchayat_choosing_id.toString()
          }));
        }
      } catch (error) {
        console.error('Error fetching Villages by Panchayat:', error);
        setFilteredVillages([]);
      }
    } else {
      setFilteredVillages([]);
      setFilteredBooths([]);
    }
  };

  // Handle Village selection and fetch related Booths
  const handleVillageChange = async (e) => {
    const villageId = e.target.value;
    
    setFormData(prev => ({
      ...prev,
      village_id: villageId,
      booth_id: ''
    }));

    if (villageId) {
      try {
        const result = await dispatch(fetchBoothsByVillage(villageId));
        if (result.payload) {
          setFilteredBooths(result.payload);
        }

        // Auto-select village choosing based on selected village
        const selectedVillage = Array.isArray(filteredVillages) 
          ? filteredVillages.find(v => v.id == villageId)
          : null;
        
        console.log('CasteRatio: Selected village:', selectedVillage);
        
        if (selectedVillage && selectedVillage.village_choosing_id) {
          console.log('CasteRatio: Auto-setting village_choosing_id to:', selectedVillage.village_choosing_id);
          setFormData(prev => ({
            ...prev,
            village_choosing_id: selectedVillage.village_choosing_id.toString()
          }));
        }
      } catch (error) {
        console.error('Error fetching Booths by Village:', error);
        setFilteredBooths([]);
      }
    } else {
      setFilteredBooths([]);
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

  // Handle adding caste ratio to the list
  const handleAddCasteRatio = () => {
    if (!selectedCaste || !casteRatio) {
      alert('Please select a caste and enter a ratio');
      return;
    }

    const ratio = parseInt(casteRatio);
    if (isNaN(ratio) || ratio < 0) {
      alert('Please enter a valid positive number for the ratio');
      return;
    }

    // Check if caste is already added
    const existingCaste = casteRatios.find(cr => cr.caste_id === selectedCaste);
    if (existingCaste) {
      alert('This caste is already added. Please remove it first or update the ratio.');
      return;
    }

    const selectedCasteData = Array.isArray(castes) 
      ? castes.find(c => c.id == selectedCaste)
      : null;

    const newCasteRatio = {
      caste_id: selectedCaste,
      caste_name: selectedCasteData?.caste || 'Unknown',
      caste_ratio: ratio
    };

    setCasteRatios(prev => [...prev, newCasteRatio]);
    setSelectedCaste('');
    setCasteRatio('');
  };

  // Handle removing caste ratio from the list
  const handleRemoveCasteRatio = (casteId) => {
    setCasteRatios(prev => prev.filter(cr => cr.caste_id !== casteId));
  };

  // Calculate total ratio
  const totalRatio = casteRatios.reduce((sum, cr) => sum + cr.caste_ratio, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (casteRatios.length === 0) {
      alert('Please add at least one caste ratio');
      return;
    }

    // Prepare the data with choosing fields
    const selectedPanchayatChoosing = Array.isArray(panchayatChoosings)
      ? panchayatChoosings.find(option => option.id == formData.panchayat_choosing_id)
      : null;
    
    const selectedVillageChoosing = Array.isArray(villageChoosings)
      ? villageChoosings.find(option => option.id == formData.village_choosing_id)
      : null;

    try {
      // Create multiple caste ratios
      const promises = casteRatios.map(casteRatioData => {
        const submitData = {
          ...formData,
          panchayat_choosing_id: parseInt(formData.panchayat_choosing_id) || formData.panchayat_choosing_id,
          panchayat_choosing: selectedPanchayatChoosing ? selectedPanchayatChoosing.name : formData.panchayat_choosing_id,
          village_choosing_id: parseInt(formData.village_choosing_id) || formData.village_choosing_id,
          village_choosing: selectedVillageChoosing ? selectedVillageChoosing.name : formData.village_choosing_id,
          caste_id: casteRatioData.caste_id,
          caste_ratio: casteRatioData.caste_ratio
        };

        return dispatch(createCasteRatio(submitData));
      });

      await Promise.all(promises);
      
      // Show success message
      const successMessage = `Successfully created ${casteRatios.length} caste ratio${casteRatios.length > 1 ? 's' : ''}!`;
      alert(successMessage);
      
      setShowModal(false);
      resetForm();
      setCasteRatios([]);
      dispatch(fetchCasteRatios({ page: pagination.current_page, search, ...filters }));
    } catch (error) {
      console.error('Error saving caste ratios:', error);
    }
  };

  // Load hierarchical data for editing (without clearing form)
  const loadHierarchicalDataForEdit = async (casteRatio) => {
    if (casteRatio.loksabha_id) {
      try {
        const result = await dispatch(fetchVidhanSabhasByLokSabha(casteRatio.loksabha_id));
        if (result.payload) {
          setFilteredVidhanSabhas(result.payload);
        }
      } catch (error) {
        console.error('Error loading Vidhan Sabhas for edit:', error);
      }
    }

    if (casteRatio.vidhansabha_id) {
      try {
        const result = await dispatch(fetchBlocksByVidhanSabha(casteRatio.vidhansabha_id));
        if (result.payload) {
          setFilteredBlocks(result.payload);
        }
      } catch (error) {
        console.error('Error loading Blocks for edit:', error);
      }
    }

    if (casteRatio.block_id) {
      try {
        const result = await dispatch(fetchPanchayatsByBlock(casteRatio.block_id));
        if (result.payload) {
          setFilteredPanchayats(result.payload);
        }
      } catch (error) {
        console.error('Error loading Panchayats for edit:', error);
      }
    }

    if (casteRatio.panchayat_id) {
      try {
        const result = await dispatch(fetchVillagesByPanchayat(casteRatio.panchayat_id));
        if (result.payload) {
          setFilteredVillages(result.payload);
        }
      } catch (error) {
        console.error('Error loading Villages for edit:', error);
      }
    }

    if (casteRatio.village_id) {
      try {
        const result = await dispatch(fetchBoothsByVillage(casteRatio.village_id));
        if (result.payload) {
          setFilteredBooths(result.payload);
        }
      } catch (error) {
        console.error('Error loading Booths for edit:', error);
      }
    }
  };

  const handleEdit = (casteRatio) => {
    setFormData({
      loksabha_id: casteRatio.loksabha_id || '',
      vidhansabha_id: casteRatio.vidhansabha_id || '',
      block_id: casteRatio.block_id || '',
      panchayat_choosing_id: casteRatio.panchayat_choosing_id || casteRatio.panchayat_choosing || '',
      panchayat_id: casteRatio.panchayat_id || '',
      village_choosing_id: casteRatio.village_choosing_id || casteRatio.village_choosing || '',
      village_id: casteRatio.village_id || '',
      booth_id: casteRatio.booth_id || '',
      caste_id: casteRatio.caste_id || '',
      caste_ratio: casteRatio.caste_ratio || ''
    });
    setIsEditing(true);
    setEditingId(casteRatio.caste_ratio_id);
    setShowModal(true);

    // Load hierarchical data for editing
    loadHierarchicalDataForEdit(casteRatio);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this caste ratio?')) {
      try {
        await dispatch(deleteCasteRatio(id));
        dispatch(fetchCasteRatios({ page: pagination.current_page, search, ...filters }));
      } catch (error) {
        console.error('Error deleting caste ratio:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      loksabha_id: '',
      vidhansabha_id: '',
      block_id: '',
      panchayat_choosing_id: '',
      panchayat_id: '',
      village_choosing_id: '',
      village_id: '',
      booth_id: '',
      caste_id: '',
      caste_ratio: ''
    });
    setIsEditing(false);
    setEditingId(null);
    setCasteRatios([]);
    setSelectedCaste('');
    setCasteRatio('');
    setFilteredVidhanSabhas([]);
    setFilteredBlocks([]);
    setFilteredPanchayats([]);
    setFilteredVillages([]);
    setFilteredBooths([]);
  };

  const handlePageChange = (newPage) => {
    dispatch(setCurrentPage(newPage));
    dispatch(fetchCasteRatios({ page: newPage, search, ...filters }));
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      caste_id: '',
      loksabha_id: '',
      vidhansabha_id: '',
      block_id: '',
      panchayat_id: '',
      village_id: '',
      booth_id: '',
      sort_by: 'created_at',
      sort_order: 'desc'
    });
    setSearch('');
  };

  const handleRefresh = () => {
    dispatch(fetchCasteRatios({ page: pagination.current_page, search, ...filters }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLocationDisplay = (casteRatio) => {
    const parts = [];
    if (casteRatio.loksabha?.loksabha_name) parts.push(casteRatio.loksabha.loksabha_name);
    if (casteRatio.vidhansabha?.vidhansabha_name) parts.push(casteRatio.vidhansabha.vidhansabha_name);
    if (casteRatio.block?.block_name) parts.push(casteRatio.block.block_name);
    if (casteRatio.panchayat?.panchayat_name) parts.push(casteRatio.panchayat.panchayat_name);
    if (casteRatio.village_data?.village_name) parts.push(casteRatio.village_data.village_name);
    if (casteRatio.booth_data?.booth_name) parts.push(casteRatio.booth_data.booth_name);
    
    return parts.length > 0 ? parts.join(' → ') : 'All Levels';
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

  // Error state
  if (error && !loading) {
    return (
      <div className="caste-ratio-management">
        <div className="error-state">
          <h2>Error Loading Caste Ratios</h2>
          <p>{error}</p>
          <button 
            className="btn btn-primary"
            onClick={() => dispatch(fetchCasteRatios({ page: 1 }))}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="caste-ratio-management">
      {/* Header */}
      <div className="caste-ratio-header">
        <div className="header-content">
          <h1>Caste Ratio Management</h1>
          <p>Manage multiple caste distribution ratios across different administrative levels</p>
        </div>
        {canManageCastRatios && (
          <button 
            className="btn btn-primary add-btn"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            disabled={loading}
          >
            <PlusIcon />
            Add Multiple Caste Ratios
          </button>
        )}
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
            placeholder="Search by caste name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
              <label>Caste</label>
              <select
                value={filters.caste_id}
                onChange={(e) => handleFilterChange('caste_id', e.target.value)}
                disabled={loading}
              >
                <option value="">All Castes</option>
                {Array.isArray(castes) && castes.map((caste) => (
                  <option key={caste.id} value={caste.id}>
                    {caste.caste}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Lok Sabha</label>
              <select
                value={filters.loksabha_id}
                onChange={(e) => handleFilterChange('loksabha_id', e.target.value)}
                disabled={loading}
              >
                <option value="">All Lok Sabhas</option>
                {Array.isArray(lokSabhas) && lokSabhas.map((lokSabha) => (
                  <option key={lokSabha.id} value={lokSabha.id}>
                    {lokSabha.loksabha_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Vidhan Sabha</label>
              <select
                value={filters.vidhansabha_id}
                onChange={(e) => handleFilterChange('vidhansabha_id', e.target.value)}
                disabled={loading}
              >
                <option value="">All Vidhan Sabhas</option>
                {Array.isArray(vidhanSabhas) && vidhanSabhas.map((vidhanSabha) => (
                  <option key={vidhanSabha.id} value={vidhanSabha.id}>
                    {vidhanSabha.vidhansabha_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Block</label>
              <select
                value={filters.block_id}
                onChange={(e) => handleFilterChange('block_id', e.target.value)}
                disabled={loading}
              >
                <option value="">All Blocks</option>
                {Array.isArray(blocks) && blocks.map((block) => (
                  <option key={block.id} value={block.id}>
                    {block.block_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Panchayat</label>
              <select
                value={filters.panchayat_id}
                onChange={(e) => handleFilterChange('panchayat_id', e.target.value)}
                disabled={loading}
              >
                <option value="">All Panchayats</option>
                {Array.isArray(panchayats) && panchayats.map((panchayat) => (
                  <option key={panchayat.id} value={panchayat.id}>
                    {panchayat.panchayat_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Village</label>
              <select
                value={filters.village_id}
                onChange={(e) => handleFilterChange('village_id', e.target.value)}
                disabled={loading}
              >
                <option value="">All Villages</option>
                {Array.isArray(villages) && villages.map((village) => (
                  <option key={village.id} value={village.id}>
                    {village.village_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Booth</label>
              <select
                value={filters.booth_id}
                onChange={(e) => handleFilterChange('booth_id', e.target.value)}
                disabled={loading}
              >
                <option value="">All Booths</option>
                {Array.isArray(booths) && booths.map((booth) => (
                  <option key={booth.id} value={booth.id}>
                    {booth.booth_name}
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
                <option value="caste_ratio">Caste Ratio</option>
                <option value="caste_id">Caste</option>
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
              onClick={clearAllFilters}
              disabled={loading}
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Caste Ratio List */}
      <div className="caste-ratio-list-section">
        <div className="list-header">
          <div className="list-header-left">
            <h2>Multiple Caste Ratios List</h2>
            <div className="pagination-info">
              Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} caste ratio entries
            </div>
          </div>
          <div className="list-header-right">
            {/* {canManageCastRatios && (
              <button 
                className="btn btn-primary add-btn"
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                disabled={loading}
                title="Create a new caste ratio"
              >
                <PlusIcon />
                Add New
              </button>
            )} */}
            <button 
              className="btn btn-secondary refresh-btn" 
              onClick={handleRefresh} 
              disabled={loading}
            >
              <RefreshIcon />
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {loading && castRatios.length === 0 ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading caste ratio entries...</p>
          </div>
        ) : castRatios.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No caste ratios found</h3>
            <p>Add your first set of caste ratios to get started.</p>
            {canManageCastRatios && (
              <button className="btn btn-primary" onClick={() => {
                resetForm();
                setShowModal(true);
              }}>
                <PlusIcon />
                Add First Caste Ratios
              </button>
            )}
          </div>
        ) : (
          <div className="modern-table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Caste</th>
                  <th>Ratio</th>
                  <th>Location</th>
                  <th>Panchayat Type</th>
                  <th>Village Type</th>
                  <th>Created</th>
                  <th>Updated</th>
                  {canManageCastRatios && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {castRatios.map((casteRatio) => (
                  <tr key={casteRatio.caste_ratio_id}>
                    <td className="id-cell">#{casteRatio.caste_ratio_id}</td>
                    <td className="caste-cell">
                      <div className="caste-name">
                        <strong>{casteRatio.caste?.caste_name || 'N/A'}</strong>
                      </div>
                    </td>
                    <td className="ratio-cell">
                      <span className="ratio-badge">{casteRatio.caste_ratio}</span>
                    </td>
                    <td className="location-cell">{getLocationDisplay(casteRatio)}</td>
                    <td className="panchayat-type-cell">
                      {casteRatio.panchayat_choosing_data?.name || getPanchayatTypeText(casteRatio.panchayat_choosing_id || casteRatio.panchayat_choosing)}
                    </td>
                    <td className="village-type-cell">
                      {casteRatio.village_choosing_data?.name || getVillageTypeText(casteRatio.village_choosing_id || casteRatio.village_choosing)}
                    </td>
                    <td className="created-cell">{formatDate(casteRatio.created_at)}</td>
                    <td className="updated-cell">{formatDate(casteRatio.updated_at)}</td>
                    {canManageCastRatios && (
                      <td className="actions-cell">
                        <button
                          onClick={() => handleEdit(casteRatio)}
                          className="btn btn-icon btn-edit"
                          title="Edit"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => handleDelete(casteRatio.caste_ratio_id)}
                          className="btn btn-icon btn-delete"
                          title="Delete"
                        >
                          <DeleteIcon />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="pagination-section">
            <div className="pagination-info">
              Page {pagination.current_page} of {pagination.last_page}
            </div>
            <div className="pagination-controls">
              <button
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page <= 1}
                className="btn btn-outline pagination-btn"
              >
                <ChevronLeftIcon />
                Previous
              </button>
              
              <div className="page-numbers">
                {generatePageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                    disabled={page === '...'}
                    className={`btn btn-outline page-btn ${page === pagination.current_page ? 'active' : ''}`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page >= pagination.last_page}
                className="btn btn-outline pagination-btn"
              >
                Next
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Caste Ratio' : 'Add Multiple Caste Ratios'}</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="btn btn-icon close-btn"
              >
                <CloseIcon />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              {/* Instructions Section */}
              <div className="instructions-section">
                <h3>How to Add Multiple Caste Ratios</h3>
                <ol className="instructions-list">
                  <li>Select a caste from the dropdown</li>
                  <li>Enter the ratio value (any positive number)</li>
                  <li>Click "Add" to add it to the list</li>
                  <li>Repeat for all castes you want to add</li>
                  <li>Optionally select parliamentary hierarchy levels</li>
                  <li>Click "Create Caste Ratios" to submit</li>
                </ol>
              </div>

              {/* Multiple Caste Ratios Section */}
              <div className="caste-ratios-section">
                <h3>Add Caste Ratios</h3>
                <p className="section-description">
                  Select castes and enter their ratios. You can add multiple castes one by one.
                </p>
                
                <div className="caste-ratio-input-row">
                  <div className="form-group">
                    <label htmlFor="selected_caste">Select Caste</label>
                    <select
                      id="selected_caste"
                      value={selectedCaste}
                      onChange={(e) => setSelectedCaste(e.target.value)}
                      disabled={loading}
                    >
                      <option value="">Choose a caste</option>
                      {Array.isArray(castes) && castes.map((caste) => (
                        <option key={caste.id} value={caste.id}>
                          {caste.caste}
                        </option>
                      ))}
                    </select>
                    {(!Array.isArray(castes) || castes.length === 0) && (
                      <small className="input-hint" style={{color: 'orange'}}>
                        Loading castes from database...
                      </small>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="caste_ratio_input">Ratio</label>
                    <input
                      type="number"
                      id="caste_ratio_input"
                      value={casteRatio}
                      onChange={(e) => setCasteRatio(e.target.value)}
                      min="0"
                      disabled={loading}
                      placeholder="Enter ratio value"
                    />
                    <small className="input-hint">Enter ratio value (any positive number)</small>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleAddCasteRatio}
                    className="btn btn-primary add-caste-btn"
                    disabled={loading || !selectedCaste || !casteRatio}
                  >
                    <PlusIcon />
                    Add
                  </button>
                </div>

                {/* Caste Ratios List */}
                {casteRatios.length > 0 && (
                  <div className="caste-ratios-list">
                    <h4>Added Caste Ratios</h4>
                    <div className="caste-ratios-grid">
                      {casteRatios.map((cr) => (
                        <div key={cr.caste_id} className="caste-ratio-item">
                          <span className="caste-name">{cr.caste_name}</span>
                          <span className="ratio-value">{cr.caste_ratio}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCasteRatio(cr.caste_id)}
                            className="btn btn-icon btn-remove"
                            title="Remove"
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="total-ratio">
                      <strong>Total: {totalRatio}</strong>
                    </div>
                    
                  </div>
                )}
              </div>

              <div className="hierarchy-note">
                <p><strong>Note:</strong> Select the parliamentary hierarchy below to specify where these caste ratios apply. All fields are optional - you can select any combination of levels.</p>
              </div>

              <div className="hierarchy-section">
                <h3>Parliamentary Hierarchy (Optional)</h3>
                <p className="section-description">
                  Select the administrative levels where these caste ratios will apply.
                </p>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="loksabha_id">Lok Sabha</label>
                  <select
                    id="loksabha_id"
                    name="loksabha_id"
                    value={formData.loksabha_id}
                    onChange={handleLokSabhaChange}
                    disabled={loading}
                  >
                    <option value="">Select Lok Sabha (Optional)</option>
                    {Array.isArray(lokSabhas) && lokSabhas.map((lokSabha) => (
                      <option key={lokSabha.id} value={lokSabha.id}>
                        {lokSabha.loksabha_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="vidhansabha_id">Vidhan Sabha</label>
                  <select
                    id="vidhansabha_id"
                    name="vidhansabha_id"
                    value={formData.vidhansabha_id}
                    onChange={handleVidhanSabhaChange}
                    disabled={loading || !formData.loksabha_id}
                  >
                    <option value="">
                      {!formData.loksabha_id ? 'Select Lok Sabha first' : 
                       loading ? 'Loading Vidhan Sabhas...' : 
                       filteredVidhanSabhas.length === 0 ? 'No Vidhan Sabhas found' : 
                       'Select Vidhan Sabha (Optional)'}
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
                  <label htmlFor="block_id">Block</label>
                  <select
                    id="block_id"
                    name="block_id"
                    value={formData.block_id}
                    onChange={handleBlockChange}
                    disabled={loading || !formData.vidhansabha_id}
                  >
                    <option value="">
                      {!formData.vidhansabha_id ? 'Select Vidhan Sabha first' : 
                       loading ? 'Loading Blocks...' : 
                       filteredBlocks.length === 0 ? 'No Blocks found' : 
                       'Select Block (Optional)'}
                    </option>
                    {Array.isArray(filteredBlocks) && filteredBlocks.map((block) => (
                      <option key={block.id} value={block.id}>
                        {block.block_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="panchayat_choosing_id">Panchayat Choosing</label>
                  <select
                    id="panchayat_choosing_id"
                    name="panchayat_choosing_id"
                    value={formData.panchayat_choosing_id}
                    onChange={handleInputChange}
                    disabled={loading}
                  >
                    <option value="">Select Panchayat Choosing (Optional)</option>
                    {Array.isArray(panchayatChoosings) && panchayatChoosings.map((choosing) => (
                      <option key={choosing.id} value={choosing.id}>
                        {choosing.name}
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
                  <label htmlFor="panchayat_id">Panchayat</label>
                  <select
                    id="panchayat_id"
                    name="panchayat_id"
                    value={formData.panchayat_id}
                    onChange={handlePanchayatChange}
                    disabled={loading || !formData.block_id}
                  >
                    <option value="">
                      {!formData.block_id ? 'Select Block first' : 
                       loading ? 'Loading Panchayats...' : 
                       filteredPanchayats.length === 0 ? 'No Panchayats found' : 
                       'Select Panchayat (Optional)'}
                    </option>
                    {Array.isArray(filteredPanchayats) && filteredPanchayats.map((panchayat) => (
                      <option key={panchayat.id} value={panchayat.id}>
                        {panchayat.panchayat_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="village_choosing_id">Village Choosing</label>
                  <select
                    id="village_choosing_id"
                    name="village_choosing_id"
                    value={formData.village_choosing_id}
                    onChange={handleInputChange}
                    disabled={loading}
                  >
                    <option value="">Select Village Choosing (Optional)</option>
                    {Array.isArray(villageChoosings) && villageChoosings.map((choosing) => (
                      <option key={choosing.id} value={choosing.id}>
                        {choosing.name}
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
                  <label htmlFor="village_id">Village</label>
                  <select
                    id="village_id"
                    name="village_id"
                    value={formData.village_id}
                    onChange={handleVillageChange}
                    disabled={loading || !formData.panchayat_id}
                  >
                    <option value="">
                      {!formData.panchayat_id ? 'Select Panchayat first' : 
                       loading ? 'Loading Villages...' : 
                       filteredVillages.length === 0 ? 'No Villages found' : 
                       'Select Village (Optional)'}
                    </option>
                    {Array.isArray(filteredVillages) && filteredVillages.map((village) => (
                      <option key={village.id} value={village.id}>
                        {village.village_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="booth_id">Booth</label>
                  <select
                    id="booth_id"
                    name="booth_id"
                    value={formData.booth_id}
                    onChange={handleInputChange}
                    disabled={loading || !formData.village_id}
                  >
                    <option value="">
                      {!formData.village_id ? 'Select Village first' : 
                       loading ? 'Loading Booths...' : 
                       filteredBooths.length === 0 ? 'No Booths found' : 
                       'Select Booth (Optional)'}
                    </option>
                    {Array.isArray(filteredBooths) && filteredBooths.map((booth) => (
                      <option key={booth.id} value={booth.id}>
                        {booth.booth_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || casteRatios.length === 0}
                >
                  {loading ? 'Saving...' : (isEditing ? 'Update' : 'Create Caste Ratios')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CasteRatio;
