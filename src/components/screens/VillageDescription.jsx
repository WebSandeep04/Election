import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchVillageDescriptions,
  createVillageDescription,
  updateVillageDescription,
  deleteVillageDescription,
  clearVillageDescError,
  clearVillageDescSuccess,
  setVillageDescPage,
} from '../../store/slices/villageDescriptionSlice';
import { fetchLokSabhas } from '../../store/slices/lokSabhaSlice';
import { fetchVidhanSabhas, fetchVidhanSabhasByLokSabha } from '../../store/slices/vidhanSabhaSlice';
import { fetchBlocks, fetchBlocksByVidhanSabha } from '../../store/slices/blockSlice';
import { fetchPanchayats, fetchPanchayatsByBlock } from '../../store/slices/panchayatSlice';
import { fetchVillages, fetchVillagesByPanchayat } from '../../store/slices/villageSlice';
import { fetchBooths, fetchBoothsByVillage } from '../../store/slices/boothSlice';
import { fetchPanchayatChoosings } from '../../store/slices/panchayatChoosingSlice';
import { fetchVillageChoosings } from '../../store/slices/villageChoosingSlice';
import { hasPermission } from '../../utils/permissions';
import './css/VillageDescription.css';

const PlusIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
const EditIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);
const DeleteIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>);
const RefreshIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23,4 23,10 17,10"/><polyline points="1,20 1,14 7,14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>);
const SearchIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>);
const FilterIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/></svg>);
const CloseIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);

const VillageDescription = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { items, pagination, loading, error, success } = useSelector((s) => s.villageDescriptions);
  const { lokSabhas = [] } = useSelector((s) => s.lokSabha || {});
  const { vidhanSabhas = [] } = useSelector((s) => s.vidhanSabha || {});
  const { blocks = [] } = useSelector((s) => s.block || {});
  const { panchayats = [] } = useSelector((s) => s.panchayat || {});
  const { villages = [] } = useSelector((s) => s.village || {});
  const { booths = [] } = useSelector((s) => s.booth || {});
  const { panchayatChoosings = [] } = useSelector((s) => s.panchayatChoosing || {});
  const { villageChoosings = [] } = useSelector((s) => s.villageChoosing || {});

  // Filtered data for hierarchical dropdowns
  const [filteredVidhanSabhas, setFilteredVidhanSabhas] = useState([]);
  const [filteredBlocks, setFilteredBlocks] = useState([]);
  const [filteredPanchayats, setFilteredPanchayats] = useState([]);
  const [filteredVillages, setFilteredVillages] = useState([]);
  const [filteredBooths, setFilteredBooths] = useState([]);

  // Resolve display labels across varying backend field names
  const getLabel = (item, type) => {
    if (!item) return '';
    switch (type) {
      case 'lok':
        return (
          item.name || item.loksabha_name || item.lok_sabha_name || item.title || `#${item.id}`
        );
      case 'vidhan':
        return (
          item.name || item.vidhansabha_name || item.vidhan_sabha_name || `#${item.id}`
        );
      case 'block':
        return item.name || item.block_name || `#${item.id}`;
      case 'panchayat':
        return item.name || item.panchayat_name || `#${item.id}`;
      case 'village':
        return item.name || item.village_name || `#${item.id}`;
      case 'booth':
        return item.name || item.booth_name || `#${item.id}`;
      default:
        return item.name || item.title || `#${item.id}`;
    }
  };

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
  
  const canManageVillageDescription = user && hasPermission(user, 'manage_village_descriptions');

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ 
    sort_by: 'created_at', 
    sort_order: 'desc',
    loksabha_id: '',
    vidhansabha_id: '',
    block_id: '',
    panchayat_id: '',
    village_id: ''
  });
  const [formData, setFormData] = useState({
    loksabha_id: '',
    vidhansabha_id: '',
    block_id: '',
    panchayat_choosing_id: '',
    panchayat_id: '',
    village_choosing_id: '',
    village_id: '',
    booth_id: '',
    description: ''
  });

  // Fetch data on component mount
  useEffect(() => {
    if (user || localStorage.getItem('auth_token')) {
      dispatch(fetchVillageDescriptions({ page: 1, search, ...filters }));
      dispatch(fetchLokSabhas(1));
      dispatch(fetchVidhanSabhas(1));
      dispatch(fetchBlocks(1));
      dispatch(fetchPanchayats(1));
      dispatch(fetchVillages(1));
      dispatch(fetchBooths(1));
      dispatch(fetchPanchayatChoosings());
      dispatch(fetchVillageChoosings());
    }
  }, [dispatch, user]);

  // Clear success/error messages
  useEffect(() => {
    if (success) setTimeout(() => dispatch(clearVillageDescSuccess()), 2000);
  }, [success, dispatch]);
  
  useEffect(() => {
    if (error) setTimeout(() => dispatch(clearVillageDescError()), 3000);
  }, [error, dispatch]);

  // Handle Lok Sabha selection and fetch related Vidhan Sabhas
  const handleLokSabhaChange = async (e) => {
    const loksabhaId = e.target.value;
    
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
        
        if (selectedPanchayat && selectedPanchayat.panchayat_choosing_id) {
          setFormData(prev => ({
            ...prev,
            panchayat_choosing_id: selectedPanchayat.panchayat_choosing_id.toString()
          }));
        }
      } catch (error) {
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
        
        if (selectedVillage && selectedVillage.village_choosing_id) {
          setFormData(prev => ({
            ...prev,
            village_choosing_id: selectedVillage.village_choosing_id.toString()
          }));
        }
      } catch (error) {
        setFilteredBooths([]);
      }
    } else {
      setFilteredBooths([]);
    }
  };

  // Handle form field changes
  const handleFormFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const openCreate = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      loksabha_id: '',
      vidhansabha_id: '',
      block_id: '',
      panchayat_choosing_id: '',
      panchayat_id: '',
      village_choosing_id: '',
      village_id: '',
      booth_id: '',
      description: ''
    });
    setFilteredVidhanSabhas([]);
    setFilteredBlocks([]);
    setFilteredPanchayats([]);
    setFilteredVillages([]);
    setFilteredBooths([]);
    setShowModal(true);
  };

  const openEdit = (row) => {
    setIsEditing(true);
    setEditingId(row.id);
    setFormData({
      loksabha_id: row.loksabha_id || '',
      vidhansabha_id: row.vidhansabha_id || '',
      block_id: row.block_id || '',
      panchayat_choosing_id: row.panchayat_choosing_id || '',
      panchayat_id: row.panchayat_id || '',
      village_choosing_id: row.village_choosing_id || '',
      village_id: row.village_id || '',
      booth_id: row.booth_id || '',
      description: row.description || ''
    });
    setShowModal(true);
    
    // Load hierarchical data for editing
    loadHierarchicalDataForEdit(row);
  };

  // Load hierarchical data for editing
  const loadHierarchicalDataForEdit = async (villageDescription) => {
    if (villageDescription.loksabha_id) {
      try {
        const result = await dispatch(fetchVidhanSabhasByLokSabha(villageDescription.loksabha_id));
        if (result.payload) {
          setFilteredVidhanSabhas(result.payload);
        }
      } catch (error) {
        setFilteredVidhanSabhas([]);
      }
    }

    if (villageDescription.vidhansabha_id) {
      try {
        const result = await dispatch(fetchBlocksByVidhanSabha(villageDescription.vidhansabha_id));
        if (result.payload) {
          setFilteredBlocks(result.payload);
        }
      } catch (error) {
        setFilteredBlocks([]);
      }
    }

    if (villageDescription.block_id) {
      try {
        const result = await dispatch(fetchPanchayatsByBlock(villageDescription.block_id));
        if (result.payload) {
          setFilteredPanchayats(result.payload);
        }
      } catch (error) {
        setFilteredPanchayats([]);
      }
    }

    if (villageDescription.panchayat_id) {
      try {
        const result = await dispatch(fetchVillagesByPanchayat(villageDescription.panchayat_id));
        if (result.payload) {
          setFilteredVillages(result.payload);
        }
      } catch (error) {
        setFilteredVillages([]);
      }
    }

    if (villageDescription.village_id) {
      try {
        const result = await dispatch(fetchBoothsByVillage(villageDescription.village_id));
        if (result.payload) {
          setFilteredBooths(result.payload);
        }
      } catch (error) {
        setFilteredBooths([]);
      }
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (!formData.description || !formData.description.trim()) return;
    
    if (isEditing) {
      await dispatch(updateVillageDescription({ id: editingId, payload: formData }));
    } else {
      await dispatch(createVillageDescription(formData));
    }
    
    setShowModal(false);
    dispatch(fetchVillageDescriptions({ page: 1, search, ...filters }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this village description?')) return;
    await dispatch(deleteVillageDescription(id));
    dispatch(fetchVillageDescriptions({ page: pagination.current_page, search, ...filters }));
  };

  const handlePage = (page) => {
    dispatch(setVillageDescPage(page));
    dispatch(fetchVillageDescriptions({ page, search, ...filters }));
  };

  const handleRefresh = () => {
    dispatch(fetchVillageDescriptions({ page: pagination.current_page, search, ...filters }));
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    dispatch(fetchVillageDescriptions({ page: 1, search, [name]: value }));
  };

  const clearAllFilters = () => {
    setFilters({ 
      sort_by: 'created_at', 
      sort_order: 'desc',
      loksabha_id: '',
      vidhansabha_id: '',
      block_id: '',
      panchayat_id: '',
      village_id: ''
    });
    setSearch('');
    dispatch(fetchVillageDescriptions({ page: 1 }));
  };

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

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(fetchVillageDescriptions({ page: 1, search, ...filters }));
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [search, filters, dispatch]);

  return (
    <div className="village-description">
      <div className="vd-header">
        <div className="header-content">
          <h1>Village Description Management</h1>
          <p>Manage village descriptions and information across different administrative levels</p>
        </div>
        {canManageVillageDescription && (
          <button 
            className="btn btn-primary add-btn"
            onClick={openCreate}
            disabled={loading}
          >
            <PlusIcon />
            Add Village Description
          </button>
        )}
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="search-filters-section">
        <div className="search-box">
          <SearchIcon />
          <input 
            type="text" 
            placeholder="Search descriptions..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            disabled={loading} 
          />
        </div>
        <button 
          className="btn btn-secondary filter-toggle" 
          onClick={() => setFilters(f => ({ ...f, _show: !f._show }))} 
          disabled={loading}
        >
          <FilterIcon />
          Filters
        </button>
      </div>

      {filters._show && (
        <div className="advanced-filters">
          <div className="filter-row">
            <div className="filter-group">
              <label>Lok Sabha</label>
              <select 
                value={filters.loksabha_id} 
                onChange={(e) => handleFilterChange('loksabha_id', e.target.value)} 
                disabled={loading}
              >
                <option value="">All Lok Sabhas</option>
                {(lokSabhas || []).map(ls => (
                  <option key={ls.id} value={ls.id}>{getLabel(ls, 'lok')}</option>
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
                {(vidhanSabhas || []).map(vs => (
                  <option key={vs.id} value={vs.id}>{getLabel(vs, 'vidhan')}</option>
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
                {(blocks || []).map(block => (
                  <option key={block.id} value={block.id}>{getLabel(block, 'block')}</option>
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
                {(panchayats || []).map(panchayat => (
                  <option key={panchayat.id} value={panchayat.id}>{getLabel(panchayat, 'panchayat')}</option>
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
                {(villages || []).map(village => (
                  <option key={village.id} value={village.id}>{getLabel(village, 'village')}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="filter-row">
            <div className="filter-group">
              <label>Sort By</label>
              <select 
                value={filters.sort_by} 
                onChange={(e) => handleFilterChange('sort_by', e.target.value)} 
                disabled={loading}
              >
                <option value="created_at">Created Date</option>
                <option value="description">Description</option>
                <option value="village_id">Village</option>
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
            <button className="btn btn-outline" onClick={clearAllFilters} disabled={loading}>
              Clear Filters
            </button>
          </div>
        </div>
      )}

      <div className="vd-list-section">
        <div className="list-header">
          <div className="list-header-left">
            <h2>Village Descriptions</h2>
            <div className="pagination-info">
              Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} descriptions
            </div>
          </div>
          <div className="list-header-right">
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

        <div className="modern-table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Lok Sabha</th>
                <th>Vidhan Sabha</th>
                <th>Block</th>
                <th>Panchayat</th>
                <th>Village</th>
                <th>Booth</th>
                <th>Description</th>
                <th>Created</th>
                {canManageVillageDescription && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {(items || []).map((row) => (
                <tr key={row.id}>
                  <td className="id-cell">#{row.id}</td>
                  <td>{row.loksabha?.loksabha_name || row.lok_sabha?.name || '-'}</td>
                  <td>{row.vidhansabha?.vidhansabha_name || row.vidhan_sabha?.name || '-'}</td>
                  <td>{row.block?.block_name || row.block?.name || '-'}</td>
                  <td>{row.panchayat?.panchayat_name || row.panchayat?.name || '-'}</td>
                  <td>{row.village_data?.village_name || row.village?.name || '-'}</td>
                  <td>{row.booth_data?.booth_name || row.booth?.name || '-'}</td>
                  <td className="description-cell">
                    <div className="description-text">
                      {row.description?.length > 100 
                        ? `${row.description.substring(0, 100)}...` 
                        : row.description || '-'
                      }
                    </div>
                  </td>
                  <td>{new Date(row.created_at).toLocaleString()}</td>
                  {canManageVillageDescription && (
                    <td className="actions-cell">
                      <button 
                        className="btn btn-icon btn-edit" 
                        onClick={() => openEdit(row)} 
                        title="Edit"
                      >
                        <EditIcon />
                      </button>
                      <button 
                        className="btn btn-icon btn-delete" 
                        onClick={() => handleDelete(row.id)} 
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
      </div>

      {pagination && pagination.last_page > 1 && pagination.total > 0 && (
        <div className="pagination-section">
          <div className="pagination-info">Page {pagination.current_page} of {pagination.last_page}</div>
          <div className="pagination-controls">
            <button 
              className="btn btn-outline pagination-btn" 
              onClick={() => handlePage(pagination.current_page - 1)} 
              disabled={pagination.current_page <= 1}
            >
              Previous
            </button>
            <div className="page-numbers">
              {generatePageNumbers().map((page, idx) => (
                <button 
                  key={idx} 
                  className={`page-btn ${page === pagination.current_page ? 'active' : ''}`} 
                  onClick={() => typeof page === 'number' && handlePage(page)} 
                  disabled={page === '...'}
                >
                  {page}
                </button>
              ))}
            </div>
            <button 
              className="btn btn-outline pagination-btn" 
              onClick={() => handlePage(pagination.current_page + 1)} 
              disabled={pagination.current_page >= pagination.last_page}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Village Description' : 'Add New Village Description'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form className="modal-form" onSubmit={submitForm}>
              {/* Parliamentary Hierarchy Section */}
              <div className="hierarchy-section">
                <h3>Parliamentary Hierarchy (Optional)</h3>
                <p className="section-description">
                  Select the administrative levels where this village description will apply.
                </p>
              </div>

              <div className="hierarchy-note">
                <p><strong>Note:</strong> Select the parliamentary hierarchy below to specify where this description applies. All fields are optional - you can select any combination of levels.</p>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="loksabha_id">Lok Sabha</label>
                  <select 
                    id="loksabha_id"
                    value={formData.loksabha_id} 
                    onChange={handleLokSabhaChange} 
                  >
                    <option value="">Select Lok Sabha (Optional)</option>
                    {lokSabhas && lokSabhas.length > 0 ? (
                      lokSabhas.map(ls => (
                        <option key={ls.id} value={ls.id}>{getLabel(ls, 'lok')}</option>
                      ))
                    ) : (
                      <option value="" disabled>No Lok Sabhas available</option>
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="vidhansabha_id">Vidhan Sabha</label>
                  <select 
                    id="vidhansabha_id"
                    value={formData.vidhansabha_id} 
                    onChange={handleVidhanSabhaChange} 
                    disabled={!formData.loksabha_id}
                  >
                    <option value="">
                      {!formData.loksabha_id ? 'Select Lok Sabha first' : 
                       loading ? 'Loading Vidhan Sabhas...' : 
                       filteredVidhanSabhas.length === 0 ? 'No Vidhan Sabhas found' : 
                       'Select Vidhan Sabha (Optional)'}
                    </option>
                    {filteredVidhanSabhas.map(vs => (
                      <option key={vs.id} value={vs.id}>{getLabel(vs, 'vidhan')}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="block_id">Block</label>
                  <select 
                    id="block_id"
                    value={formData.block_id} 
                    onChange={handleBlockChange} 
                    disabled={!formData.vidhansabha_id}
                  >
                    <option value="">
                      {!formData.vidhansabha_id ? 'Select Vidhan Sabha first' : 
                       loading ? 'Loading Blocks...' : 
                       filteredBlocks.length === 0 ? 'No Blocks found' : 
                       'Select Block (Optional)'}
                    </option>
                    {filteredBlocks.map(block => (
                      <option key={block.id} value={block.id}>{getLabel(block, 'block')}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="panchayat_choosing_id">Panchayat Choosing</label>
                  <select 
                    id="panchayat_choosing_id"
                    value={formData.panchayat_choosing_id} 
                    onChange={(e) => handleFormFieldChange('panchayat_choosing_id', e.target.value)} 
                  >
                    <option value="">Select Panchayat Choosing (Optional)</option>
                    {panchayatChoosings.map(choosing => (
                      <option key={choosing.id} value={choosing.id}>
                        {choosing.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="panchayat_id">Panchayat</label>
                  <select 
                    id="panchayat_id"
                    value={formData.panchayat_id} 
                    onChange={handlePanchayatChange} 
                    disabled={!formData.block_id}
                  >
                    <option value="">
                      {!formData.block_id ? 'Select Block first' : 
                       loading ? 'Loading Panchayats...' : 
                       filteredPanchayats.length === 0 ? 'No Panchayats found' : 
                       'Select Panchayat (Optional)'}
                    </option>
                    {filteredPanchayats.map(panchayat => (
                      <option key={panchayat.id} value={panchayat.id}>{getLabel(panchayat, 'panchayat')}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="village_choosing_id">Village Choosing</label>
                  <select 
                    id="village_choosing_id"
                    value={formData.village_choosing_id} 
                    onChange={(e) => handleFormFieldChange('village_choosing_id', e.target.value)} 
                  >
                    <option value="">Select Village Choosing (Optional)</option>
                    {villageChoosings.map(choosing => (
                      <option key={choosing.id} value={choosing.id}>
                        {choosing.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="village_id">Village</label>
                  <select 
                    id="village_id"
                    value={formData.village_id} 
                    onChange={handleVillageChange} 
                    disabled={!formData.panchayat_id}
                  >
                    <option value="">
                      {!formData.panchayat_id ? 'Select Panchayat first' : 
                       loading ? 'Loading Villages...' : 
                       filteredVillages.length === 0 ? 'No Villages found' : 
                       'Select Village (Optional)'}
                    </option>
                    {filteredVillages.map(village => (
                      <option key={village.id} value={village.id}>{getLabel(village, 'village')}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="booth_id">Booth</label>
                  <select 
                    id="booth_id"
                    value={formData.booth_id} 
                    onChange={(e) => handleFormFieldChange('booth_id', e.target.value)} 
                    disabled={!formData.village_id}
                  >
                    <option value="">
                      {!formData.village_id ? 'Select Village first' : 
                       loading ? 'Loading Booths...' : 
                       filteredBooths.length === 0 ? 'No Booths found' : 
                       'Select Booth (Optional)'}
                    </option>
                    {filteredBooths.map(booth => (
                      <option key={booth.id} value={booth.id}>{getLabel(booth, 'booth')}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description Section */}
              <div className="description-section">
                <h3>Village Description</h3>
                <p className="section-description">
                  Enter the description for the selected location.
                </p>
                
                <div className="form-group">
                  <label htmlFor="description">Description *</label>
                  <textarea 
                    id="description"
                    value={formData.description} 
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                    required 
                    rows={4}
                    maxLength={1000}
                    placeholder="Enter village description..."
                  />
                  <div className="char-count">{formData.description.length}/1000</div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VillageDescription;
