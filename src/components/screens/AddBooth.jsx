import React, { useState, useEffect } from 'react';
import './css/AddBooth.css';

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

const AddBooth = () => {
  const [booths, setBooths] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    booth_number: '',
    booth_name: '',
    village: '',
    panchayat: '',
    constituency: '',
    total_voters: '',
    male_voters: '',
    female_voters: '',
    other_voters: '',
    location: '',
    description: ''
  });

  // Mock data for demonstration
  const mockBooths = [
    {
      id: 1,
      booth_number: '001',
      booth_name: 'Andheri Primary School',
      village: 'Andheri Village',
      panchayat: 'Andheri Gram Panchayat',
      constituency: 'Mumbai North',
      total_voters: '1200',
      male_voters: '580',
      female_voters: '620',
      other_voters: '0',
      location: 'Andheri Primary School, Andheri Village',
      description: 'Polling booth at Andheri Primary School',
      created_at: '2024-01-01T00:00:00.000000Z',
      updated_at: '2024-01-01T00:00:00.000000Z'
    },
    {
      id: 2,
      booth_number: '002',
      booth_name: 'Borivali Community Hall',
      village: 'Borivali Village',
      panchayat: 'Borivali Gram Panchayat',
      constituency: 'Mumbai North',
      total_voters: '950',
      male_voters: '460',
      female_voters: '490',
      other_voters: '0',
      location: 'Borivali Community Hall, Borivali Village',
      description: 'Polling booth at Borivali Community Hall',
      created_at: '2024-01-02T00:00:00.000000Z',
      updated_at: '2024-01-02T00:00:00.000000Z'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setBooths(mockBooths);
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
    
    if (!formData.booth_number.trim()) {
      setError('Booth number is required');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (isEditing) {
        // Update existing
        setBooths(prev => prev.map(item => 
          item.id === editingId ? { ...item, ...formData, updated_at: new Date().toISOString() } : item
        ));
        setSuccess('Polling booth updated successfully');
      } else {
        // Create new
        const newBooth = {
          id: Date.now(),
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setBooths(prev => [...prev, newBooth]);
        setSuccess('Polling booth created successfully');
      }
      
      resetForm();
      setShowModal(false);
      setLoading(false);
    }, 1000);
  };

  const handleEdit = (booth) => {
    setFormData({
      booth_number: booth.booth_number,
      booth_name: booth.booth_name,
      village: booth.village,
      panchayat: booth.panchayat,
      constituency: booth.constituency,
      total_voters: booth.total_voters,
      male_voters: booth.male_voters,
      female_voters: booth.female_voters,
      other_voters: booth.other_voters,
      location: booth.location,
      description: booth.description
    });
    setIsEditing(true);
    setEditingId(booth.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this polling booth?')) {
      setLoading(true);
      setTimeout(() => {
        setBooths(prev => prev.filter(item => item.id !== id));
        setSuccess('Polling booth deleted successfully');
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
      booth_number: '',
      booth_name: '',
      village: '',
      panchayat: '',
      constituency: '',
      total_voters: '',
      male_voters: '',
      female_voters: '',
      other_voters: '',
      location: '',
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
      setBooths(mockBooths);
      setLoading(false);
    }, 1000);
  };

  if (error && !loading) {
    return (
      <div className="booth-management">
        <div className="error-state">
          <h2>Error Loading Booth Data</h2>
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
    <div className="booth-management">
      <div className="booth-header">
        <div className="header-content">
          <h1>Polling Booth Management</h1>
          <p>Manage polling booths and electoral information</p>
        </div>
        <button 
          className="btn btn-primary add-btn"
          onClick={handleAddNew}
          disabled={loading}
        >
          <PlusIcon />
          Add New Booth
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

      {/* Booth List Section */}
      <div className="booth-list-section">
        <div className="list-header">
          <div className="list-header-left">
            <h2>Polling Booths</h2>
            <div className="pagination-info">
              Showing {booths.length} booths
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

        {loading && booths.length === 0 ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading polling booths...</p>
          </div>
        ) : booths.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No polling booths found</h3>
            <p>Add your first polling booth to get started.</p>
            <button 
              className="btn btn-primary"
              onClick={handleAddNew}
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
                  <th>Booth No.</th>
                  <th>Booth Name</th>
                  <th>Village</th>
                  <th>Constituency</th>
                  <th>Total Voters</th>
                  <th>Male</th>
                  <th>Female</th>
                  <th>Other</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {booths.map((booth) => (
                  <tr key={booth.id}>
                    <td className="id-cell">#{booth.id}</td>
                    <td className="booth-number-cell">{booth.booth_number}</td>
                    <td className="booth-name-cell">{booth.booth_name}</td>
                    <td className="village-cell">{booth.village}</td>
                    <td className="constituency-cell">{booth.constituency}</td>
                    <td className="total-voters-cell">{booth.total_voters}</td>
                    <td className="male-voters-cell">{booth.male_voters}</td>
                    <td className="female-voters-cell">{booth.female_voters}</td>
                    <td className="other-voters-cell">{booth.other_voters}</td>
                    <td className="actions-cell">
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Polling Booth' : 'Add New Polling Booth'}</h2>
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
                  <label htmlFor="booth_number">Booth Number</label>
                  <input
                    type="text"
                    id="booth_number"
                    name="booth_number"
                    value={formData.booth_number}
                    onChange={handleInputChange}
                    placeholder="Enter booth number"
                    required
                    disabled={loading}
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="booth_name">Booth Name</label>
                  <input
                    type="text"
                    id="booth_name"
                    name="booth_name"
                    value={formData.booth_name}
                    onChange={handleInputChange}
                    placeholder="Enter booth name"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="village">Village</label>
                  <input
                    type="text"
                    id="village"
                    name="village"
                    value={formData.village}
                    onChange={handleInputChange}
                    placeholder="Enter village name"
                    required
                    disabled={loading}
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
                  <label htmlFor="constituency">Constituency</label>
                  <input
                    type="text"
                    id="constituency"
                    name="constituency"
                    value={formData.constituency}
                    onChange={handleInputChange}
                    placeholder="Enter constituency"
                    required
                    disabled={loading}
                  />
                </div>
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
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="male_voters">Male Voters</label>
                  <input
                    type="number"
                    id="male_voters"
                    name="male_voters"
                    value={formData.male_voters}
                    onChange={handleInputChange}
                    placeholder="Enter male voters"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="female_voters">Female Voters</label>
                  <input
                    type="number"
                    id="female_voters"
                    name="female_voters"
                    value={formData.female_voters}
                    onChange={handleInputChange}
                    placeholder="Enter female voters"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="other_voters">Other Voters</label>
                  <input
                    type="number"
                    id="other_voters"
                    name="other_voters"
                    value={formData.other_voters}
                    onChange={handleInputChange}
                    placeholder="Enter other voters"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter booth location"
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
                  placeholder="Enter booth description"
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
                  disabled={loading || !formData.booth_number.trim()}
                >
                  {loading ? 'Processing...' : (isEditing ? 'Update Booth' : 'Create Booth')}
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
          <li><strong>GET</strong> /api/booths - Fetch polling booths</li>
          <li><strong>POST</strong> /api/booths - Create new booth</li>
          <li><strong>PUT</strong> /api/booths/:id - Update booth</li>
          <li><strong>DELETE</strong> /api/booths/:id - Delete booth</li>
        </ul>
      </div>
    </div>
  );
};

export default AddBooth;
