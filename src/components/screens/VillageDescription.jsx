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
import { fetchVidhanSabhas } from '../../store/slices/vidhanSabhaSlice';
import { fetchBlocks } from '../../store/slices/blockSlice';
import { fetchPanchayats } from '../../store/slices/panchayatSlice';
import { fetchVillages } from '../../store/slices/villageSlice';
import { hasPermission } from '../../utils/permissions';
import './css/VillageDescription.css';

const PlusIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
const EditIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);
const DeleteIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>);
const RefreshIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23,4 23,10 17,10"/><polyline points="1,20 1,14 7,14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>);
const SearchIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>);
const FilterIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/></svg>);

const VillageDescription = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { items, pagination, loading, error, success } = useSelector((s) => s.villageDescriptions);
  const { lokSabhas = [] } = useSelector((s) => s.lokSabha || {});
  const { vidhanSabhas = [] } = useSelector((s) => s.vidhanSabha || {});
  const { blocks = [] } = useSelector((s) => s.block || {});
  const { panchayats = [] } = useSelector((s) => s.panchayat || {});
  const { villages = [] } = useSelector((s) => s.village || {});

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
      default:
        return item.name || item.title || `#${item.id}`;
    }
  };

  // Debug logging
  useEffect(() => {
    console.log('=== VILLAGE DESCRIPTION DATA STATE ===');
    console.log('Lok Sabhas:', lokSabhas);
    console.log('Lok Sabhas type:', typeof lokSabhas);
    console.log('Lok Sabhas length:', lokSabhas?.length);
    console.log('First Lok Sabha:', lokSabhas?.[0]);
    console.log('Vidhan Sabhas:', vidhanSabhas);
    console.log('Blocks:', blocks);
    console.log('Panchayats:', panchayats);
    console.log('Villages:', villages);
    console.log('=====================================');
  }, [lokSabhas, vidhanSabhas, blocks, panchayats, villages]);
  
  const canManage = user && hasPermission(user, 'manage_village_descriptions');

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
    panchayat_id: '',
    village_choosing: '',
    village_id: '',
    description: ''
  });

  // Fetch data on component mount
  useEffect(() => {
    console.log('=== VILLAGE DESCRIPTION COMPONENT MOUNT ===');
    console.log('Fetching all administrative data...');
    console.log('User:', user);
    console.log('Auth token:', localStorage.getItem('auth_token'));
    
    // Only fetch if user is authenticated
    if (user || localStorage.getItem('auth_token')) {
      dispatch(fetchVillageDescriptions({ page: 1, search, ...filters }));
      dispatch(fetchLokSabhas(1));
      dispatch(fetchVidhanSabhas(1));
      dispatch(fetchBlocks(1));
      dispatch(fetchPanchayats(1));
      dispatch(fetchVillages(1));
    } else {
      console.log('User not authenticated, skipping data fetch');
    }
  }, [dispatch, user]);

  // Clear success/error messages
  useEffect(() => {
    if (success) setTimeout(() => dispatch(clearVillageDescSuccess()), 2000);
  }, [success, dispatch]);
  
  useEffect(() => {
    if (error) setTimeout(() => dispatch(clearVillageDescError()), 3000);
  }, [error, dispatch]);

  // Filter villages based on selected panchayat
  const filteredVillages = (villages || []).filter(village => 
    !filters.panchayat_id || village.panchayat_id == filters.panchayat_id
  );

  // Filter panchayats based on selected block
  const filteredPanchayats = (panchayats || []).filter(panchayat => 
    !filters.block_id || panchayat.block_id == filters.block_id
  );

  // Filter blocks based on selected vidhan sabha
  const filteredBlocks = (blocks || []).filter(block => 
    !filters.vidhansabha_id || block.vidhansabha_id == filters.vidhansabha_id
  );

  // Filter vidhan sabhas based on selected lok sabha
  const filteredVidhanSabhas = (vidhanSabhas || []).filter(vidhanSabha => 
    !filters.loksabha_id || vidhanSabha.loksabha_id == filters.loksabha_id
  );

  const openCreate = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      loksabha_id: '',
      vidhansabha_id: '',
      block_id: '',
      panchayat_id: '',
      village_choosing: '',
      village_id: '',
      description: ''
    });
    setShowModal(true);
  };

  // Handle form field changes with hierarchical reset
  const handleFormFieldChange = (field, value) => {
    let newFormData = { ...formData, [field]: value };
    
    // Reset child fields when parent changes
    if (field === 'loksabha_id') {
      newFormData = {
        ...newFormData,
        vidhansabha_id: '',
        block_id: '',
        panchayat_id: '',
        village_choosing: '',
        village_id: ''
      };
    } else if (field === 'vidhansabha_id') {
      newFormData = {
        ...newFormData,
        block_id: '',
        panchayat_id: '',
        village_choosing: '',
        village_id: ''
      };
    } else if (field === 'block_id') {
      newFormData = {
        ...newFormData,
        panchayat_id: '',
        village_choosing: '',
        village_id: ''
      };
    } else if (field === 'panchayat_id') {
      newFormData = {
        ...newFormData,
        village_choosing: '',
        village_id: ''
      };
    }
    
    setFormData(newFormData);
  };

  const openEdit = (row) => {
    setIsEditing(true);
    setEditingId(row.id);
    setFormData({
      loksabha_id: row.loksabha_id || '',
      vidhansabha_id: row.vidhansabha_id || '',
      block_id: row.block_id || '',
      panchayat_id: row.panchayat_id || '',
      village_choosing: row.village_choosing || '',
      village_id: row.village_id || '',
      description: row.description || ''
    });
    setShowModal(true);
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
          <p>Manage village descriptions and information</p>
        </div>
                 <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
           <div style={{ fontSize: '12px', color: '#666', marginRight: '8px' }}>
             Data: LS({lokSabhas?.length || 0}) VS({vidhanSabhas?.length || 0}) B({blocks?.length || 0}) P({panchayats?.length || 0}) V({villages?.length || 0})
           </div>
           <button 
             className="btn btn-secondary" 
             onClick={() => {
               console.log('=== MANUAL TEST API CALLS ===');
               dispatch(fetchLokSabhas(1));
               dispatch(fetchVidhanSabhas(1));
               dispatch(fetchBlocks(1));
               dispatch(fetchPanchayats(1));
               dispatch(fetchVillages(1));
             }} 
             disabled={loading}
           >
             Test API Calls
           </button>
           {canManage && (
             <button className="btn btn-primary add-btn" onClick={openCreate} disabled={loading}>
               <PlusIcon />
               Add New Description
             </button>
           )}
         </div>
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
                {(filteredVidhanSabhas || []).map(vs => (
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
                {(filteredBlocks || []).map(block => (
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
                {(filteredPanchayats || []).map(panchayat => (
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
                {(filteredVillages || []).map(village => (
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
                <th>Description</th>
                <th>Created</th>
                {canManage && <th>Actions</th>}
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
                  <td className="description-cell">
                    <div className="description-text">
                      {row.description?.length > 100 
                        ? `${row.description.substring(0, 100)}...` 
                        : row.description || '-'
                      }
                    </div>
                  </td>
                  <td>{new Date(row.created_at).toLocaleString()}</td>
                  {canManage && (
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
              <div className="form-row">
                <div className="form-group">
                  <label>Lok Sabha *</label>
                  <select 
                     value={formData.loksabha_id} 
                     onChange={(e) => handleFormFieldChange('loksabha_id', e.target.value)} 
                     required
                   >
                     <option value="">Select Lok Sabha</option>
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
                  <label>Vidhan Sabha *</label>
                  <select 
                    value={formData.vidhansabha_id} 
                    onChange={(e) => handleFormFieldChange('vidhansabha_id', e.target.value)} 
                    required
                    disabled={!formData.loksabha_id}
                  >
                    <option value="">Select Vidhan Sabha</option>
                    {(vidhanSabhas || []).filter(vs => vs.loksabha_id == formData.loksabha_id).map(vs => (
                      <option key={vs.id} value={vs.id}>{getLabel(vs, 'vidhan')}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Block *</label>
                  <select 
                    value={formData.block_id} 
                    onChange={(e) => handleFormFieldChange('block_id', e.target.value)} 
                    required
                    disabled={!formData.vidhansabha_id}
                  >
                    <option value="">Select Block</option>
                    {(blocks || []).filter(block => block.vidhansabha_id == formData.vidhansabha_id).map(block => (
                      <option key={block.id} value={block.id}>{getLabel(block, 'block')}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Panchayat *</label>
                  <select 
                    value={formData.panchayat_id} 
                    onChange={(e) => handleFormFieldChange('panchayat_id', e.target.value)} 
                    required
                    disabled={!formData.block_id}
                  >
                    <option value="">Select Panchayat</option>
                    {(panchayats || []).filter(panchayat => panchayat.block_id == formData.block_id).map(panchayat => (
                      <option key={panchayat.id} value={panchayat.id}>{getLabel(panchayat, 'panchayat')}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Village Choosing *</label>
                  <select 
                    value={formData.village_choosing} 
                    onChange={(e) => handleFormFieldChange('village_choosing', e.target.value)} 
                    required
                    disabled={!formData.panchayat_id}
                  >
                    <option value="">Select Village</option>
                    {(villages || []).filter(village => village.panchayat_id == formData.panchayat_id).map(village => (
                      <option key={village.id} value={village.id}>{getLabel(village, 'village')}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Village *</label>
                  <select 
                    value={formData.village_id} 
                    onChange={(e) => handleFormFieldChange('village_id', e.target.value)} 
                    required
                    disabled={!formData.panchayat_id}
                  >
                    <option value="">Select Village</option>
                    {(villages || []).filter(village => village.panchayat_id == formData.panchayat_id).map(village => (
                      <option key={village.id} value={village.id}>{getLabel(village, 'village')}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  required 
                  rows={4}
                  maxLength={1000}
                  placeholder="Enter village description..."
                />
                <div className="char-count">{formData.description.length}/1000</div>
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
