import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApiUrl, getAuthHeaders } from '../../config/api';

// List employee types
export const fetchEmployeeTypes = createAsyncThunk(
  'employeeTypes/fetchAll',
  async (page = 1, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(getApiUrl(`/api/employee-types?page=${page}`), {
        method: 'GET',
        headers: getAuthHeaders(auth.token),
      });

      let json;
      try { json = await response.json(); } catch { return rejectWithValue('Invalid JSON response from server'); }
      if (!response.ok) return rejectWithValue(json?.message || 'Failed to fetch employee types');
      return {
        items: json.employee_types || [],
        pagination: json.pagination || { current_page: page, per_page: 10, total: 0, last_page: 1 },
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Create employee type
export const createEmployeeType = createAsyncThunk(
  'employeeTypes/create',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(getApiUrl('/api/employee-types'), {
        method: 'POST',
        headers: getAuthHeaders(auth.token),
        body: JSON.stringify(payload),
      });
      let json; try { json = await response.json(); } catch { return rejectWithValue('Invalid JSON response from server'); }
      if (!response.ok) return rejectWithValue(json?.message || 'Failed to create employee type');
      return json.employee_type;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Get by id
export const fetchEmployeeTypeById = createAsyncThunk(
  'employeeTypes/fetchById',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(getApiUrl(`/api/employee-types/${id}`), {
        method: 'GET',
        headers: getAuthHeaders(auth.token),
      });
      let json; try { json = await response.json(); } catch { return rejectWithValue('Invalid JSON response from server'); }
      if (!response.ok) return rejectWithValue(json?.message || 'Failed to fetch employee type');
      return json.employee_type;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Update
export const updateEmployeeType = createAsyncThunk(
  'employeeTypes/update',
  async ({ id, payload }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(getApiUrl(`/api/employee-types/${id}`), {
        method: 'PUT',
        headers: getAuthHeaders(auth.token),
        body: JSON.stringify(payload),
      });
      let json; try { json = await response.json(); } catch { return rejectWithValue('Invalid JSON response from server'); }
      if (!response.ok) return rejectWithValue(json?.message || 'Failed to update employee type');
      return json.employee_type;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Delete
export const deleteEmployeeType = createAsyncThunk(
  'employeeTypes/delete',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(getApiUrl(`/api/employee-types/${id}`), {
        method: 'DELETE',
        headers: getAuthHeaders(auth.token),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) return rejectWithValue(json?.message || 'Failed to delete employee type');
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  items: [],
  pagination: { current_page: 1, per_page: 10, total: 0, last_page: 1 },
  current: null,
  loading: false,
  error: null,
  success: null,
};

const employeeTypeSlice = createSlice({
  name: 'employeeTypes',
  initialState,
  reducers: {
    clearEmployeeTypeState: (state) => {
      state.current = null;
      state.error = null;
      state.success = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployeeTypes.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchEmployeeTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchEmployeeTypes.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(createEmployeeType.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createEmployeeType.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [action.payload, ...state.items];
        state.success = 'Employee type created';
      })
      .addCase(createEmployeeType.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchEmployeeTypeById.fulfilled, (state, action) => { state.current = action.payload; })

      .addCase(updateEmployeeType.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateEmployeeType.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.items.findIndex(i => i.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload; else state.items.unshift(action.payload);
        state.success = 'Employee type updated';
      })
      .addCase(updateEmployeeType.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(deleteEmployeeType.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteEmployeeType.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(i => i.id !== action.payload);
        state.success = 'Employee type deleted';
      })
      .addCase(deleteEmployeeType.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearEmployeeTypeState, clearError, clearSuccess } = employeeTypeSlice.actions;
export default employeeTypeSlice.reducer;


