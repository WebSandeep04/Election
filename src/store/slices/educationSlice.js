import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApiUrl, getAuthHeaders } from '../../config/api';

const getToken = (getState) => {
  const { auth } = getState();
  return auth?.token || localStorage.getItem('auth_token') || null;
};

export const fetchEducations = createAsyncThunk(
  'educations/fetchEducations',
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const { page = 1, search = '', sort_by = 'created_at', sort_order = 'desc', per_page = 10 } = params;
      const qp = new URLSearchParams({ page: String(page), sort_by, sort_order, per_page: String(per_page) });
      if (search && String(search).trim()) qp.set('search', String(search).trim());
      const url = `${getApiUrl('/api/educations')}?${qp.toString()}`;
      const response = await fetch(url, { method: 'GET', headers: getAuthHeaders(token) });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const educations = data.educations || data.data || [];
      const pagination = data.pagination || data.meta || { current_page: page, last_page: 1, per_page: 10, total: educations.length, from: 1, to: educations.length };
      return { educations, pagination };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createEducation = createAsyncThunk(
  'educations/createEducation',
  async (payload, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const response = await fetch(getApiUrl('/api/educations'), { method: 'POST', headers: getAuthHeaders(token), body: JSON.stringify(payload) });
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to create education');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data || data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateEducation = createAsyncThunk(
  'educations/updateEducation',
  async ({ id, payload }, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const response = await fetch(`${getApiUrl('/api/educations')}/${id}`, { method: 'PUT', headers: getAuthHeaders(token), body: JSON.stringify(payload) });
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to update education');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data || data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteEducation = createAsyncThunk(
  'educations/deleteEducation',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const response = await fetch(`${getApiUrl('/api/educations')}/${id}`, { method: 'DELETE', headers: getAuthHeaders(token) });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const educationSlice = createSlice({
  name: 'educations',
  initialState: {
    items: [],
    pagination: { current_page: 1, last_page: 1, per_page: 10, total: 0 },
    loading: false,
    error: null,
    success: null,
  },
  reducers: {
    clearEduError: (state) => { state.error = null; },
    clearEduSuccess: (state) => { state.success = null; },
    setEduPage: (state, action) => { state.pagination.current_page = action.payload || 1; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEducations.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchEducations.fulfilled, (state, action) => { state.loading = false; state.items = action.payload.educations; state.pagination = action.payload.pagination; })
      .addCase(fetchEducations.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to fetch educations'; })
      .addCase(createEducation.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createEducation.fulfilled, (state, action) => { state.loading = false; state.success = 'Education created successfully'; state.items.unshift(action.payload); })
      .addCase(createEducation.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to create education'; })
      .addCase(updateEducation.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateEducation.fulfilled, (state, action) => { state.loading = false; state.success = 'Education updated successfully'; state.items = state.items.map(e => e.id === action.payload.id ? action.payload : e); })
      .addCase(updateEducation.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to update education'; })
      .addCase(deleteEducation.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteEducation.fulfilled, (state, action) => { state.loading = false; state.success = 'Education deleted successfully'; state.items = state.items.filter(e => e.id !== action.payload); state.pagination.total = Math.max(0, state.pagination.total - 1); })
      .addCase(deleteEducation.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to delete education'; });
  }
});

export const { clearEduError, clearEduSuccess, setEduPage } = educationSlice.actions;
export default educationSlice.reducer;


