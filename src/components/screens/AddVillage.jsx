import React, { useState, useEffect } from 'react';
import './css/AddVillage.css';

// Icons (using simple SVG icons)
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

const AddVillage = () => {
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    village_name: '',
    panchayat: '',
    block: '',
    district: '',
    state: '',
    population: '',
    total_households: '',
    area_km2: '',
    description: ''
  });

  // Mock data for demonstration
  const mockVillages = [
    {
      id: 1,
      village_name: 'Andheri Village',
      panchayat: 'Andheri Gram Panchayat',
      block: 'Andheri Block',
      district: 'Mumbai',
      state: 'Maharashtra',
      population: '25000',
      total_households: '5000',
      area_km2: '25',
      description: 'Andheri village in Mumbai',
      created_at: '2024-01-01T00:00:00.000000Z',
      updated_at: '2024-01-01T00:00:00.000000Z'
    },
    {
      id: 2,
      village_name: 'Borivali Village',
      panchayat: 'Borivali Gram Panchayat',
      block: 'Borivali Block',
      district: 'Mumbai',
      state: 'Maharashtra',
      population: '18000',
      total_households: '3500',
      area_km2: '18',
      description: 'Borivali village in Mumbai',
      created_at: '2024-01-02T00:00:00.000000Z',
      updated_at: '2024-01-02T00:00:00.000000Z'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setVillages(mockVillages);
      setLoading(false);
    }, 1000);
  }, []);

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
        setError(null);
      }, 5000);
    }
  }, [error]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.village_name.trim()) {
      setError('Village name is required');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (isEditing) {
        // Update existing
        setVillages(prev => prev.map(item => 
          item.id === editingId ? { ...item, ...formData, updated_at: new Date().toISOString() } : item
        ));
        setSuccess('Village updated successfully');
      } else {
        // Create new
        const newVillage = {
          id: Date.now(),
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setVillages(prev => [...prev, newVillage]);
        setSuccess('Village created successfully');
      }
      
      resetForm();
      setShowModal(false);
      setLoading(false);
    }, 1000);
  };

  const handleEdit = (village) => {
    setFormData({
      village_name: village.village_name,
      panchayat: village.panchayat,
      block: village.block,
      district: village.district,
      state: village.state,
      population: village.population,
      total_households: village.total_households,
      area_km2: village.area_km2,
      description: village.description
    });
    setIsEditing(true);
    setEditingId(village.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this village?')) {
      setLoading(true);
      setTimeout(() => {
        setVillages(prev => prev.filter(item => item.id !== id));
        setSuccess('Village deleted successfully');
        setLoading(false);
      }, 500);
    }
  };

  const handleCancel = () => {
    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setFormData({
      village_name: '',
      panchayat: '',
      block: '',
      district: '',
      state: '',
      population: '',
      total_households: '',
      area_km2: '',
      description: ''
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setVillages(mockVillages);
      setLoading(false);
    }, 1000);
  };

  if (error && !loading) {
    return (
      <div className="village-management">
        <div className="error-state">
          <h2>Error Loading Village Data</h2>
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
    <div className="village-management">
      <div className="village-header">
        <div className="header-content">
          <h1>Village Management</h1>
          <p>Manage villages and village-level information</p>
        </div>
        <button 
          className="btn btn-primary add-btn"
          onClick={handleAddNew}
          disabled={loading}
        >
          <PlusIcon />
          Add New Village
        </button>
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
            onClick={handleRefresh}
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
              onClick={handleAddNew}
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
                  <th>Village Name</th>
                  <th>Panchayat</th>
                  <th>Block</th>
                  <th>District</th>
                  <th>Population</th>
                  <th>Households</th>
                  <th>Area (km²)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {villages.map((village) => (
                  <tr key={village.id}>
                    <td className="id-cell">#{village.id}</td>
                    <td className="name-cell">{village.village_name}</td>
                    <td className="panchayat-cell">{village.panchayat}</td>
                    <td className="block-cell">{village.block}</td>
                    <td className="district-cell">{village.district}</td>
                    <td className="population-cell">{village.population}</td>
                    <td className="households-cell">{village.total_households}</td>
                    <td className="area-cell">{village.area_km2}</td>
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Village' : 'Add New Village'}</h2>
              <button 
                className="btn-icon btn-close"
                onClick={handleCancel}
                title="Close modal"
              >
                <CloseIcon />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="village_name">Village Name</label>
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
                <div className="form-group">
                  <label htmlFor="panchayat">Panchayat</label>
                  <input
                    type="text"
                    id="panchayat"
                    name="panchayat"
                    value={formData.panchayat}
                    onChange={handleInputChange}
                    placeholder="Enter panchayat name"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="block">Block</label>
                  <input
                    type="text"
                    id="block"
                    name="block"
                    value={formData.block}
                    onChange={handleInputChange}
                    placeholder="Enter block name"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="district">District</label>
                  <input
                    type="text"
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    placeholder="Enter district"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="state">State</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Enter state"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="population">Population</label>
                  <input
                    type="number"
                    id="population"
                    name="population"
                    value={formData.population}
                    onChange={handleInputChange}
                    placeholder="Enter population"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="total_households">Total Households</label>
                  <input
                    type="number"
                    id="total_households"
                    name="total_households"
                    value={formData.total_households}
                    onChange={handleInputChange}
                    placeholder="Enter total households"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="area_km2">Area (km²)</label>
                  <input
                    type="number"
                    id="area_km2"
                    name="area_km2"
                    value={formData.area_km2}
                    onChange={handleInputChange}
                    placeholder="Enter area in km²"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter village description"
                  rows="3"
                  disabled={loading}
                />
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
                  disabled={loading || !formData.village_name.trim()}
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
          <li><strong>GET</strong> /api/villages - Fetch villages</li>
          <li><strong>POST</strong> /api/villages - Create new village</li>
          <li><strong>PUT</strong> /api/villages/:id - Update village</li>
          <li><strong>DELETE</strong> /api/villages/:id - Delete village</li>
        </ul>
      </div>
    </div>
  );
};

export default AddVillage;
