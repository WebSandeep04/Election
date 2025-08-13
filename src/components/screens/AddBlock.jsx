import React, { useState, useEffect } from 'react';
import './css/AddBlock.css';

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

const AddBlock = () => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    block_name: '',
    district: '',
    state: '',
    block_officer: '',
    population: '',
    area_km2: '',
    description: ''
  });

  // Mock data for demonstration
  const mockBlocks = [
    {
      id: 1,
      block_name: 'Andheri Block',
      district: 'Mumbai',
      state: 'Maharashtra',
      block_officer: 'Rajesh Kumar',
      population: '500000',
      area_km2: '150',
      description: 'Andheri administrative block',
      created_at: '2024-01-01T00:00:00.000000Z',
      updated_at: '2024-01-01T00:00:00.000000Z'
    },
    {
      id: 2,
      block_name: 'Borivali Block',
      district: 'Mumbai',
      state: 'Maharashtra',
      block_officer: 'Priya Sharma',
      population: '350000',
      area_km2: '120',
      description: 'Borivali administrative block',
      created_at: '2024-01-02T00:00:00.000000Z',
      updated_at: '2024-01-02T00:00:00.000000Z'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setBlocks(mockBlocks);
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
    
    if (!formData.block_name.trim()) {
      setError('Block name is required');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (isEditing) {
        // Update existing
        setBlocks(prev => prev.map(item => 
          item.id === editingId ? { ...item, ...formData, updated_at: new Date().toISOString() } : item
        ));
        setSuccess('Block updated successfully');
      } else {
        // Create new
        const newBlock = {
          id: Date.now(),
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setBlocks(prev => [...prev, newBlock]);
        setSuccess('Block created successfully');
      }
      
      resetForm();
      setShowModal(false);
      setLoading(false);
    }, 1000);
  };

  const handleEdit = (block) => {
    setFormData({
      block_name: block.block_name,
      district: block.district,
      state: block.state,
      block_officer: block.block_officer,
      population: block.population,
      area_km2: block.area_km2,
      description: block.description
    });
    setIsEditing(true);
    setEditingId(block.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this block?')) {
      setLoading(true);
      setTimeout(() => {
        setBlocks(prev => prev.filter(item => item.id !== id));
        setSuccess('Block deleted successfully');
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
      block_name: '',
      district: '',
      state: '',
      block_officer: '',
      population: '',
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
      setBlocks(mockBlocks);
      setLoading(false);
    }, 1000);
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
          <p>Manage administrative blocks and block-level information</p>
        </div>
        <button 
          className="btn btn-primary add-btn"
          onClick={handleAddNew}
          disabled={loading}
        >
          <PlusIcon />
          Add New Block
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

      {/* Block List Section */}
      <div className="block-list-section">
        <div className="list-header">
          <div className="list-header-left">
            <h2>Administrative Blocks</h2>
            <div className="pagination-info">
              Showing {blocks.length} blocks
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
            <div className="empty-icon">🏛️</div>
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
          <div className="modern-table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Block Name</th>
                  <th>District</th>
                  <th>State</th>
                  <th>Block Officer</th>
                  <th>Population</th>
                  <th>Area (km²)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blocks.map((block) => (
                  <tr key={block.id}>
                    <td className="id-cell">#{block.id}</td>
                    <td className="name-cell">{block.block_name}</td>
                    <td className="district-cell">{block.district}</td>
                    <td className="state-cell">{block.state}</td>
                    <td className="officer-cell">{block.block_officer}</td>
                    <td className="population-cell">{block.population}</td>
                    <td className="area-cell">{block.area_km2}</td>
                    <td className="actions-cell">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(block)}
                        disabled={loading}
                        title="Edit block"
                      >
                        <EditIcon />
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(block.id)}
                        disabled={loading}
                        title="Delete block"
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
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="block_name">Block Name</label>
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
                  <label htmlFor="block_officer">Block Officer</label>
                  <input
                    type="text"
                    id="block_officer"
                    name="block_officer"
                    value={formData.block_officer}
                    onChange={handleInputChange}
                    placeholder="Enter block officer name"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="form-row">
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
                  placeholder="Enter block description"
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
                  disabled={loading || !formData.block_name.trim()}
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
          <li><strong>GET</strong> /api/blocks - Fetch administrative blocks</li>
          <li><strong>POST</strong> /api/blocks - Create new block</li>
          <li><strong>PUT</strong> /api/blocks/:id - Update block</li>
          <li><strong>DELETE</strong> /api/blocks/:id - Delete block</li>
        </ul>
      </div>
    </div>
  );
};

export default AddBlock;
