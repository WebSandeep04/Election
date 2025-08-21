import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApiUrl, getAuthHeaders } from '../../config/api';

const getToken = (getState) => getState()?.auth?.token || localStorage.getItem('auth_token') || null;

export const fetchExpenseCategories = createAsyncThunk(
  'expenseCategories/fetch',
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const { page = 1, search = '', sort_by = 'created_at', sort_order = 'desc', per_page = 10 } = params;
      const qp = new URLSearchParams({ page: String(page), sort_by, sort_order, per_page: String(per_page) });
      if (search && String(search).trim()) qp.set('search', String(search).trim());
      const url = `${getApiUrl('/api/expense-categories')}?${qp.toString()}`;
      const res = await fetch(url, { headers: getAuthHeaders(token) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const items = data.expense_categories || data.data || [];
      const pagination = data.pagination || data.meta || { current_page: page, last_page: 1, per_page: 10, total: items.length, from: 1, to: items.length };
      return { items, pagination };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const createExpenseCategory = createAsyncThunk(
  'expenseCategories/create',
  async (payload, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const res = await fetch(getApiUrl('/api/expense-categories'), { method: 'POST', headers: getAuthHeaders(token), body: JSON.stringify(payload) });
      if (!res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) { const j = await res.json(); throw new Error(j.message || 'Create failed'); }
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      return data.data || data;
    } catch (e) { return rejectWithValue(e.message); }
  }
);

export const updateExpenseCategory = createAsyncThunk(
  'expenseCategories/update',
  async ({ id, payload }, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const res = await fetch(`${getApiUrl('/api/expense-categories')}/${id}`, { method: 'PUT', headers: getAuthHeaders(token), body: JSON.stringify(payload) });
      if (!res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) { const j = await res.json(); throw new Error(j.message || 'Update failed'); }
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      return data.data || data;
    } catch (e) { return rejectWithValue(e.message); }
  }
);

export const deleteExpenseCategory = createAsyncThunk(
  'expenseCategories/delete',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const res = await fetch(`${getApiUrl('/api/expense-categories')}/${id}`, { method: 'DELETE', headers: getAuthHeaders(token) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return id;
    } catch (e) { return rejectWithValue(e.message); }
  }
);

const slice = createSlice({
  name: 'expenseCategories',
  initialState: { items: [], pagination: { current_page: 1, last_page: 1, per_page: 10, total: 0 }, loading: false, error: null, success: null },
  reducers: {
    clearExpError: (s) => { s.error = null; },
    clearExpSuccess: (s) => { s.success = null; },
    setExpPage: (s, a) => { s.pagination.current_page = a.payload || 1; },
  },
  extraReducers: (b) => {
    b
      .addCase(fetchExpenseCategories.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchExpenseCategories.fulfilled, (s, a) => { s.loading = false; s.items = a.payload.items; s.pagination = a.payload.pagination; })
      .addCase(fetchExpenseCategories.rejected, (s, a) => { s.loading = false; s.error = a.payload || 'Failed to fetch categories'; })
      .addCase(createExpenseCategory.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(createExpenseCategory.fulfilled, (s, a) => { s.loading = false; s.success = 'Category created successfully'; s.items.unshift(a.payload); s.pagination.total += 1; })
      .addCase(createExpenseCategory.rejected, (s, a) => { s.loading = false; s.error = a.payload || 'Failed to create category'; })
      .addCase(updateExpenseCategory.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(updateExpenseCategory.fulfilled, (s, a) => { s.loading = false; s.success = 'Category updated successfully'; s.items = s.items.map(i => i.id === a.payload.id ? a.payload : i); })
      .addCase(updateExpenseCategory.rejected, (s, a) => { s.loading = false; s.error = a.payload || 'Failed to update category'; })
      .addCase(deleteExpenseCategory.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(deleteExpenseCategory.fulfilled, (s, a) => { s.loading = false; s.success = 'Category deleted successfully'; s.items = s.items.filter(i => i.id !== a.payload); s.pagination.total = Math.max(0, s.pagination.total - 1); })
      .addCase(deleteExpenseCategory.rejected, (s, a) => { s.loading = false; s.error = a.payload || 'Failed to delete category'; });
  }
});

export const { clearExpError, clearExpSuccess, setExpPage } = slice.actions;
export default slice.reducer;


