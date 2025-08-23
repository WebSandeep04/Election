import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApiUrl, getAuthHeaders } from '../../config/api';

// Async thunks for CRUD operations
export const fetchCastes = createAsyncThunk(
  'caste/fetchCastes',
  async (page = 1, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(getApiUrl(`/api/castes?page=${page}&limit=10`), {
        method: 'GET',
        headers: getAuthHeaders(auth.token),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        return rejectWithValue('Invalid JSON response from server');
      }

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch castes');
      }

      // Handle Laravel API response format with pagination
      
      
      // Extract castes array and pagination info
      const castes = data && Array.isArray(data.castes) ? data.castes : 
                    Array.isArray(data) ? data : 
                    data && Array.isArray(data.data) ? data.data : [];
      
      const pagination = data.pagination || data.meta || {};
      
      return {
        castes,
        pagination: {
          current_page: pagination.current_page || page,
          last_page: pagination.last_page || 1,
          per_page: pagination.per_page || 10,
          total: pagination.total || castes.length,
          from: pagination.from || 1,
          to: pagination.to || castes.length
        }
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const fetchCasteById = createAsyncThunk(
  'caste/fetchCasteById',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(getApiUrl(`/api/castes/${id}`), {
        method: 'GET',
        headers: getAuthHeaders(auth.token),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        return rejectWithValue('Invalid JSON response from server');
      }

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch caste');
      }

      // Handle Laravel API response format
      
      if (data && data.caste) {
        return data.caste;
      } else {
        return data;
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const createCaste = createAsyncThunk(
  'caste/createCaste',
  async (casteData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(getApiUrl('/api/castes'), {
        method: 'POST',
        headers: getAuthHeaders(auth.token),
        body: JSON.stringify(casteData),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        return rejectWithValue('Invalid JSON response from server');
      }

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to create caste');
      }

      // Handle Laravel API response format
      
      if (data && data.caste) {
        return data.caste;
      } else {
        return data;
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const updateCaste = createAsyncThunk(
  'caste/updateCaste',
  async ({ id, casteData }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(getApiUrl(`/api/castes/${id}`), {
        method: 'PUT',
        headers: getAuthHeaders(auth.token),
        body: JSON.stringify(casteData),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        return rejectWithValue('Invalid JSON response from server');
      }

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to update caste');
      }

      // Handle Laravel API response format
      
      if (data && data.caste) {
        return { id, ...data.caste };
      } else {
        return { id, ...data };
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const deleteCaste = createAsyncThunk(
  'caste/deleteCaste',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(getApiUrl(`/api/castes/${id}`), {
        method: 'DELETE',
        headers: getAuthHeaders(auth.token),
      });

      if (!response.ok) {
        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          return rejectWithValue('Invalid JSON response from server');
        }
        return rejectWithValue(data.message || 'Failed to delete caste');
      }

      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const initialState = {
  castes: [],
  currentCaste: null,
  loading: false,
  error: null,
  success: null,
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 1,
    to: 0
  }
};

const casteSlice = createSlice({
  name: 'caste',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    setCurrentCaste: (state, action) => {
      state.currentCaste = action.payload;
    },
    clearCurrentCaste: (state) => {
      state.currentCaste = null;
    },
    setCurrentPage: (state, action) => {
      state.pagination.current_page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch castes
      .addCase(fetchCastes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCastes.fulfilled, (state, action) => {
        state.loading = false;
        // Handle pagination response
        if (action.payload && action.payload.castes) {
          state.castes = Array.isArray(action.payload.castes) ? action.payload.castes : [];
          state.pagination = action.payload.pagination || state.pagination;
        } else {
          // Fallback for non-paginated response
          state.castes = Array.isArray(action.payload) ? action.payload : [];
        }
        state.error = null;
      })
      .addCase(fetchCastes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch caste by ID
      .addCase(fetchCasteById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCasteById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCaste = action.payload;
        state.error = null;
      })
      .addCase(fetchCasteById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create caste
      .addCase(createCaste.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCaste.fulfilled, (state, action) => {
        state.loading = false;
        state.castes.push(action.payload);
        state.success = 'Caste created successfully';
        state.error = null;
      })
      .addCase(createCaste.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update caste
      .addCase(updateCaste.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCaste.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.castes.findIndex(caste => caste.id === action.payload.id);
        if (index !== -1) {
          state.castes[index] = action.payload;
        }
        state.success = 'Caste updated successfully';
        state.error = null;
      })
      .addCase(updateCaste.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete caste
      .addCase(deleteCaste.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCaste.fulfilled, (state, action) => {
        state.loading = false;
        state.castes = state.castes.filter(caste => caste.id !== action.payload);
        state.success = 'Caste deleted successfully';
        state.error = null;
      })
      .addCase(deleteCaste.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  setCurrentCaste,
  clearCurrentCaste,
  setCurrentPage,
} = casteSlice.actions;

export default casteSlice.reducer;
