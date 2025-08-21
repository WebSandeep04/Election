import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchExpenseCategories,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
  clearExpError,
  clearExpSuccess,
  setExpPage,
} from '../../store/slices/expenseCategorySlice';
import { hasPermission } from '../../utils/permissions';
import './css/ExpenseCategoryManagement.css';

const PlusIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
const EditIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);
const DeleteIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>);
const RefreshIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23,4 23,10 17,10"/><polyline points="1,20 1,14 7,14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>);
const SearchIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>);
const FilterIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/></svg>);

const ExpenseCategoryManagement = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { items, pagination, loading, error, success } = useSelector((s) => s.expenseCategories);
  const canManage = user && hasPermission(user, 'manage_categories');

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ sort_by: 'created_at', sort_order: 'desc' });
  const [formData, setFormData] = useState({ category: '' });

  useEffect(() => { dispatch(fetchExpenseCategories({ page: 1, search, ...filters })); }, [dispatch]);
  useEffect(() => { if (success) setTimeout(() => dispatch(clearExpSuccess()), 2000); }, [success, dispatch]);
  useEffect(() => { if (error) setTimeout(() => dispatch(clearExpError()), 3000); }, [error, dispatch]);

  const openCreate = () => { setIsEditing(false); setEditingId(null); setFormData({ category: '' }); setShowModal(true); };
  const openEdit = (row) => { setIsEditing(true); setEditingId(row.id); setFormData({ category: row.category || '' }); setShowModal(true); };

  const submitForm = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.category.trim()) return;
    if (isEditing) await dispatch(updateExpenseCategory({ id: editingId, payload: formData }));
    else await dispatch(createExpenseCategory(formData));
    setShowModal(false);
    dispatch(fetchExpenseCategories({ page: 1, search, ...filters }));
  };

  const handleDelete = async (id) => { if (!window.confirm('Delete this category?')) return; await dispatch(deleteExpenseCategory(id)); dispatch(fetchExpenseCategories({ page: pagination.current_page, search, ...filters })); };
  const handlePage = (page) => { dispatch(setExpPage(page)); dispatch(fetchExpenseCategories({ page, search, ...filters })); };
  const handleRefresh = () => { dispatch(fetchExpenseCategories({ page: pagination.current_page, search, ...filters })); };
  const handleFilterChange = (n, v) => { setFilters((p) => ({ ...p, [n]: v })); dispatch(fetchExpenseCategories({ page: 1, search, [n]: v })); };
  const clearAllFilters = () => { setFilters({ sort_by: 'created_at', sort_order: 'desc' }); setSearch(''); dispatch(fetchExpenseCategories({ page: 1 })); };
  const generatePageNumbers = () => { const pages=[]; const c=pagination.current_page, l=pagination.last_page; if (c>3){pages.push(1); if(c>4) pages.push('...');} for(let i=Math.max(1,c-1); i<=Math.min(l,c+1); i++) pages.push(i); if(c<l-2){ if(c<l-3) pages.push('...'); pages.push(l);} return pages; };

  useEffect(() => { const t=setTimeout(() => dispatch(fetchExpenseCategories({ page: 1, search, ...filters })), 500); return () => clearTimeout(t); }, [search, filters, dispatch]);

  return (
    <div className="expense-category-management">
      <div className="exp-header">
        <div className="header-content">
          <h1>Expense Category Management</h1>
          <p>Manage expense categories for financial tracking</p>
        </div>
        {canManage && (
          <button className="btn btn-primary add-btn" onClick={openCreate} disabled={loading}>
            <PlusIcon />
            Add New Category
          </button>
        )}
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="search-filters-section">
        <div className="search-box">
          <SearchIcon />
          <input type="text" placeholder="Search categories..." value={search} onChange={(e)=>setSearch(e.target.value)} disabled={loading} />
        </div>
        <button className="btn btn-secondary filter-toggle" onClick={() => setFilters((f)=>({ ...f, _show: !f._show }))} disabled={loading}>
          <FilterIcon />
          Filters
        </button>
      </div>

      {filters._show && (
        <div className="advanced-filters">
          <div className="filter-row">
            <div className="filter-group">
              <label>Sort By</label>
              <select value={filters.sort_by} onChange={(e)=>handleFilterChange('sort_by', e.target.value)} disabled={loading}>
                <option value="created_at">Created Date</option>
                <option value="category">Category</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Order</label>
              <select value={filters.sort_order} onChange={(e)=>handleFilterChange('sort_order', e.target.value)} disabled={loading}>
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
            <button className="btn btn-outline" onClick={clearAllFilters} disabled={loading}>Clear Filters</button>
          </div>
        </div>
      )}

      <div className="exp-list-section">
        <div className="list-header">
          <div className="list-header-left">
            <h2>Expense Categories</h2>
            <div className="pagination-info">Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} categories</div>
          </div>
          <button className="btn btn-secondary refresh-btn" onClick={handleRefresh} disabled={loading}>
            <RefreshIcon />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        <div className="modern-table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Category</th>
                <th>Created</th>
                <th>Updated</th>
                {canManage && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id}>
                  <td className="id-cell">#{row.id}</td>
                  <td className="cat-name"><strong>{row.category}</strong></td>
                  <td>{new Date(row.created_at).toLocaleString()}</td>
                  <td>{new Date(row.updated_at).toLocaleString()}</td>
                  {canManage && (
                    <td className="actions-cell">
                      <button className="btn btn-icon btn-edit" onClick={() => openEdit(row)} title="Edit"><EditIcon /></button>
                      <button className="btn btn-icon btn-delete" onClick={() => handleDelete(row.id)} title="Delete"><DeleteIcon /></button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && pagination.last_page > 1 && (
        <div className="pagination-section">
          <div className="pagination-info">Page {pagination.current_page} of {pagination.last_page}</div>
          <div className="pagination-controls">
            <button className="btn btn-outline pagination-btn" onClick={() => handlePage(pagination.current_page - 1)} disabled={pagination.current_page <= 1}>Previous</button>
            <div className="page-numbers">
              {generatePageNumbers().map((page, idx) => (
                <button key={idx} className={`page-btn ${page === pagination.current_page ? 'active' : ''}`} onClick={() => typeof page === 'number' && handlePage(page)} disabled={page === '...'}>
                  {page}
                </button>
              ))}
            </div>
            <button className="btn btn-outline pagination-btn" onClick={() => handlePage(pagination.current_page + 1)} disabled={pagination.current_page >= pagination.last_page}>Next</button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Category' : 'Add New Category'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form className="modal-form" onSubmit={submitForm}>
              <div className="form-group">
                <label>Category</label>
                <input value={formData.category} onChange={(e) => setFormData({ category: e.target.value })} required maxLength={255} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseCategoryManagement;


