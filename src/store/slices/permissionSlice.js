import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_CONFIG, getApiUrl, getAuthHeaders } from '../../config/api';

// Helper: resolve token
const getToken = (getState) => {
  const reduxToken = getState().auth?.token;
  if (reduxToken) return reduxToken;
  const ls = localStorage.getItem('auth_token');
  return ls || null;
};

// Fetch list with pagination + search
export const fetchPermissions = createAsyncThunk(
  'permission/fetchPermissions',
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const { page = 1, per_page = 10, search = '' } = params;
      const qp = new URLSearchParams({ page: String(page), per_page: String(per_page) });
      if (search && String(search).trim().length > 0) qp.set('search', String(search).trim());
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.PERMISSIONS)}?${qp.toString()}`;
      const response = await fetch(url, { method: 'GET', headers: getAuthHeaders(token) });
      let data = null;
      try { data = await response.json(); } catch (_) {}
      if (!response.ok) {
        const message = (data && (data.message || data.error)) || `HTTP error! status: ${response.status}`;
        throw new Error(message);
      }
      const top = data || {};
      const inner = top.data && typeof top.data === 'object' && !Array.isArray(top.data) ? top.data : null;
      const items = Array.isArray(top.data)
        ? top.data
        : Array.isArray(top.permissions)
          ? top.permissions
          : Array.isArray(top)
            ? top
            : Array.isArray(inner?.data)
              ? inner.data
              : [];
      const meta = top.meta || inner?.meta || top.pagination || inner?.pagination || {};
      return {
        items,
        pagination: {
          current_page: Number(meta.current_page) || Number(page) || 1,
          last_page: Number(meta.last_page) || 1,
          per_page: Number(meta.per_page) || Number(per_page) || 10,
          total: Number(meta.total) || items.length,
          from: Number(meta.from) || (items.length > 0 ? 1 : 0),
          to: Number(meta.to) || items.length,
        },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPermissionById = createAsyncThunk(
  'permission/fetchPermissionById',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.PERMISSIONS)}/${id}`;
      const response = await fetch(url, { method: 'GET', headers: getAuthHeaders(token) });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      return data.data || data.permission || data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createPermission = createAsyncThunk(
  'permission/createPermission',
  async (payload, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = getApiUrl(API_CONFIG.ENDPOINTS.PERMISSIONS);
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create permission');
      }
      return data.data || data.permission || data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePermission = createAsyncThunk(
  'permission/updatePermission',
  async ({ id, payload }, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.PERMISSIONS)}/${id}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update permission');
      }
      return data.data || data.permission || data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deletePermission = createAsyncThunk(
  'permission/deletePermission',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.PERMISSIONS)}/${id}`;
      const response = await fetch(url, { method: 'DELETE', headers: getAuthHeaders(token) });
      if (!response.ok) {
        let data = {};
        try { data = await response.json(); } catch (_) {}
        throw new Error(data.message || 'Failed to delete permission');
      }
      return { id };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  items: [],
  current: null,
  loading: false,
  error: null,
  success: null,
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 1,
    to: 0,
  },
};

const permissionSlice = createSlice({
  name: 'permission',
  initialState,
  reducers: {
    clearPermissionError: (state) => { state.error = null; },
    clearPermissionSuccess: (state) => { state.success = null; },
    setPermissionPage: (state, action) => { state.pagination.current_page = action.payload; },
    setCurrentPermission: (state, action) => { state.current = action.payload; },
    clearCurrentPermission: (state) => { state.current = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPermissions.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload.items) ? action.payload.items : [];
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPermissions.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchPermissionById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPermissionById.fulfilled, (state, action) => { state.loading = false; state.current = action.payload; })
      .addCase(fetchPermissionById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(createPermission.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createPermission.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Permission created successfully!';
        state.items.unshift(action.payload);
      })
      .addCase(createPermission.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(updatePermission.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updatePermission.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Permission updated successfully!';
        const idx = state.items.findIndex(p => p.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.current && state.current.id === action.payload.id) state.current = action.payload;
      })
      .addCase(updatePermission.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(deletePermission.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deletePermission.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Permission deleted successfully!';
        state.items = state.items.filter(p => p.id !== action.payload.id);
      })
      .addCase(deletePermission.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const {
  clearPermissionError,
  clearPermissionSuccess,
  setPermissionPage,
  setCurrentPermission,
  clearCurrentPermission,
} = permissionSlice.actions;

export default permissionSlice.reducer;


