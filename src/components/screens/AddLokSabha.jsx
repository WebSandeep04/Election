import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './css/AddLokSabha.css';

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

const AddLokSabha = () => {
  const [lokSabhas, setLokSabhas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    constituency_name: '',
    state: '',
    mp_name: '',
    party: '',
    total_voters: '',
    description: ''
  });

  // Mock data for demonstration
  const mockLokSabhas = [
    {
      id: 1,
      constituency_name: 'Mumbai North',
      state: 'Maharashtra',
      mp_name: 'Gopal Shetty',
      party: 'BJP',
      total_voters: '1500000',
      description: 'Mumbai North Lok Sabha constituency',
      created_at: '2024-01-01T00:00:00.000000Z',
      updated_at: '2024-01-01T00:00:00.000000Z'
    },
    {
      id: 2,
      constituency_name: 'Delhi South',
      state: 'Delhi',
      mp_name: 'Ramesh Bidhuri',
      party: 'BJP',
      total_voters: '1200000',
      description: 'Delhi South Lok Sabha constituency',
      created_at: '2024-01-02T00:00:00.000000Z',
      updated_at: '2024-01-02T00:00:00.000000Z'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setLokSabhas(mockLokSabhas);
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
    
    if (!formData.constituency_name.trim()) {
      setError('Constituency name is required');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (isEditing) {
        // Update existing
        setLokSabhas(prev => prev.map(item => 
          item.id === editingId ? { ...item, ...formData, updated_at: new Date().toISOString() } : item
        ));
        setSuccess('Lok Sabha constituency updated successfully');
      } else {
        // Create new
        const newLokSabha = {
          id: Date.now(),
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setLokSabhas(prev => [...prev, newLokSabha]);
        setSuccess('Lok Sabha constituency created successfully');
      }
      
      resetForm();
      setShowModal(false);
      setLoading(false);
    }, 1000);
  };

  const handleEdit = (lokSabha) => {
    setFormData({
      constituency_name: lokSabha.constituency_name,
      state: lokSabha.state,
      mp_name: lokSabha.mp_name,
      party: lokSabha.party,
      total_voters: lokSabha.total_voters,
      description: lokSabha.description
    });
    setIsEditing(true);
    setEditingId(lokSabha.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this Lok Sabha constituency?')) {
      setLoading(true);
      setTimeout(() => {
        setLokSabhas(prev => prev.filter(item => item.id !== id));
        setSuccess('Lok Sabha constituency deleted successfully');
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
      constituency_name: '',
      state: '',
      mp_name: '',
      party: '',
      total_voters: '',
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
      setLokSabhas(mockLokSabhas);
      setLoading(false);
    }, 1000);
  };

  if (error && !loading) {
    return (
      <div className="lok-sabha-management">
        <div className="error-state">
          <h2>Error Loading Lok Sabha Data</h2>
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
    <div className="lok-sabha-management">
      <div className="lok-sabha-header">
        <div className="header-content">
          <h1>Lok Sabha Management</h1>
          <p>Manage Lok Sabha constituencies and MP information</p>
        </div>
        <button 
          className="btn btn-primary add-btn"
          onClick={handleAddNew}
          disabled={loading}
        >
          <PlusIcon />
          Add New Constituency
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

      {/* Lok Sabha List Section */}
      <div className="lok-sabha-list-section">
        <div className="list-header">
          <div className="list-header-left">
            <h2>Lok Sabha Constituencies</h2>
            <div className="pagination-info">
              Showing {lokSabhas.length} constituencies
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

        {loading && lokSabhas.length === 0 ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading Lok Sabha constituencies...</p>
          </div>
        ) : lokSabhas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏛️</div>
            <h3>No Lok Sabha constituencies found</h3>
            <p>Add your first Lok Sabha constituency to get started.</p>
            <button 
              className="btn btn-primary"
              onClick={handleAddNew}
            >
              <PlusIcon />
              Add First Constituency
            </button>
          </div>
        ) : (
          <div className="modern-table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Constituency</th>
                  <th>State</th>
                  <th>MP Name</th>
                  <th>Party</th>
                  <th>Total Voters</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {lokSabhas.map((lokSabha) => (
                  <tr key={lokSabha.id}>
                    <td className="id-cell">#{lokSabha.id}</td>
                    <td className="name-cell">{lokSabha.constituency_name}</td>
                    <td className="state-cell">{lokSabha.state}</td>
                    <td className="mp-cell">{lokSabha.mp_name}</td>
                    <td className="party-cell">{lokSabha.party}</td>
                    <td className="voters-cell">{lokSabha.total_voters}</td>
                    <td className="actions-cell">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(lokSabha)}
                        disabled={loading}
                        title="Edit constituency"
                      >
                        <EditIcon />
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(lokSabha.id)}
                        disabled={loading}
                        title="Delete constituency"
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
              <h2>{isEditing ? 'Edit Lok Sabha Constituency' : 'Add New Lok Sabha Constituency'}</h2>
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
                  <label htmlFor="constituency_name">Constituency Name</label>
                  <input
                    type="text"
                    id="constituency_name"
                    name="constituency_name"
                    value={formData.constituency_name}
                    onChange={handleInputChange}
                    placeholder="Enter constituency name"
                    required
                    disabled={loading}
                    autoFocus
                  />
                </div>
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
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="mp_name">MP Name</label>
                  <input
                    type="text"
                    id="mp_name"
                    name="mp_name"
                    value={formData.mp_name}
                    onChange={handleInputChange}
                    placeholder="Enter MP name"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="party">Political Party</label>
                  <input
                    type="text"
                    id="party"
                    name="party"
                    value={formData.party}
                    onChange={handleInputChange}
                    placeholder="Enter political party"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="total_voters">Total Voters</label>
                  <input
                    type="number"
                    id="total_voters"
                    name="total_voters"
                    value={formData.total_voters}
                    onChange={handleInputChange}
                    placeholder="Enter total voters"
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
                  placeholder="Enter constituency description"
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
                  disabled={loading || !formData.constituency_name.trim()}
                >
                  {loading ? 'Processing...' : (isEditing ? 'Update Constituency' : 'Create Constituency')}
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
          <li><strong>GET</strong> /api/lok-sabha - Fetch Lok Sabha constituencies</li>
          <li><strong>POST</strong> /api/lok-sabha - Create new constituency</li>
          <li><strong>PUT</strong> /api/lok-sabha/:id - Update constituency</li>
          <li><strong>DELETE</strong> /api/lok-sabha/:id - Delete constituency</li>
        </ul>
      </div>
    </div>
  );
};

export default AddLokSabha;
