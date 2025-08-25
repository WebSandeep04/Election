import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApiUrl, getAuthHeaders } from '../../config/api';

// Async thunks for CRUD operations
export const fetchCastRatios = createAsyncThunk(
  'casteRatio/fetchCastRatios',
  async ({ page = 1, queryParams = '' } = {}, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const url = getApiUrl(`/api/cast-ratios?page=${page}&limit=10${queryParams ? `&${queryParams}` : ''}`);
      const response = await fetch(url, {
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
        return rejectWithValue(data.message || 'Failed to fetch cast ratios');
      }

      // Handle Laravel API response format with pagination
      const castRatios = data && Array.isArray(data.cast_ratios) ? data.cast_ratios : 
                        Array.isArray(data) ? data : 
                        data && Array.isArray(data.data) ? data.data : [];
      
      const pagination = data.pagination || data.meta || {};
      
      return {
        castRatios,
        pagination: {
          current_page: pagination.current_page || page,
          last_page: pagination.last_page || 1,
          per_page: pagination.per_page || 10,
          total: pagination.total || castRatios.length,
          from: pagination.from || 1,
          to: pagination.to || castRatios.length
        }
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const fetchCastRatioById = createAsyncThunk(
  'casteRatio/fetchCastRatioById',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(getApiUrl(`/api/cast-ratios/${id}`), {
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
        return rejectWithValue(data.message || 'Failed to fetch cast ratio');
      }

      // Handle Laravel API response format
      if (data && data.data) {
        return data.data;
      } else {
        return data;
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const createCastRatio = createAsyncThunk(
  'casteRatio/createCastRatio',
  async (castRatioData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(getApiUrl('/api/cast-ratios'), {
        method: 'POST',
        headers: getAuthHeaders(auth.token),
        body: JSON.stringify(castRatioData),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        return rejectWithValue('Invalid JSON response from server');
      }

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to create cast ratio');
      }

      // Handle Laravel API response format
      if (data && data.data) {
        return data.data;
      } else {
        return data;
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const updateCastRatio = createAsyncThunk(
  'casteRatio/updateCastRatio',
  async ({ id, castRatioData }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(getApiUrl(`/api/cast-ratios/${id}`), {
        method: 'PUT',
        headers: getAuthHeaders(auth.token),
        body: JSON.stringify(castRatioData),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        return rejectWithValue('Invalid JSON response from server');
      }

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to update cast ratio');
      }

      // Handle Laravel API response format
      if (data && data.data) {
        return { id, ...data.data };
      } else {
        return { id, ...data };
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const deleteCastRatio = createAsyncThunk(
  'casteRatio/deleteCastRatio',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(getApiUrl(`/api/cast-ratios/${id}`), {
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
        return rejectWithValue(data.message || 'Failed to delete cast ratio');
      }

      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const assignCastRatioToCategory = createAsyncThunk(
  'casteRatio/assignCastRatioToCategory',
  async ({ id, categoryId }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(getApiUrl(`/api/cast-ratios/${id}/assign-category`), {
        method: 'POST',
        headers: getAuthHeaders(auth.token),
        body: JSON.stringify({ category_id: categoryId }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        return rejectWithValue('Invalid JSON response from server');
      }

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to assign cast ratio to category');
      }

      return { id, ...data.data };
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const removeCastRatioFromCategory = createAsyncThunk(
  'casteRatio/removeCastRatioFromCategory',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(getApiUrl(`/api/cast-ratios/${id}/remove-category`), {
        method: 'POST',
        headers: getAuthHeaders(auth.token),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        return rejectWithValue('Invalid JSON response from server');
      }

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to remove cast ratio from category');
      }

      return { id, ...data.data };
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const initialState = {
  castRatios: [],
  currentCastRatio: null,
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

const casteRatioSlice = createSlice({
  name: 'casteRatio',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    setCurrentCastRatio: (state, action) => {
      state.currentCastRatio = action.payload;
    },
    clearCurrentCastRatio: (state) => {
      state.currentCastRatio = null;
    },
    setCurrentPage: (state, action) => {
      state.pagination.current_page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cast ratios
      .addCase(fetchCastRatios.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCastRatios.fulfilled, (state, action) => {
        state.loading = false;
        // Handle pagination response
        if (action.payload && action.payload.castRatios) {
          state.castRatios = Array.isArray(action.payload.castRatios) ? action.payload.castRatios : [];
          state.pagination = action.payload.pagination || state.pagination;
        } else {
          // Fallback for non-paginated response
          state.castRatios = Array.isArray(action.payload) ? action.payload : [];
        }
        state.error = null;
      })
      .addCase(fetchCastRatios.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch cast ratio by ID
      .addCase(fetchCastRatioById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCastRatioById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCastRatio = action.payload;
        state.error = null;
      })
      .addCase(fetchCastRatioById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create cast ratio
      .addCase(createCastRatio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCastRatio.fulfilled, (state, action) => {
        state.loading = false;
        state.castRatios.push(action.payload);
        state.success = 'Cast ratio created successfully';
        state.error = null;
      })
      .addCase(createCastRatio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update cast ratio
      .addCase(updateCastRatio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCastRatio.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.castRatios.findIndex(castRatio => castRatio.caste_ratio_id === action.payload.id);
        if (index !== -1) {
          state.castRatios[index] = action.payload;
        }
        state.success = 'Cast ratio updated successfully';
        state.error = null;
      })
      .addCase(updateCastRatio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete cast ratio
      .addCase(deleteCastRatio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCastRatio.fulfilled, (state, action) => {
        state.loading = false;
        state.castRatios = state.castRatios.filter(castRatio => castRatio.caste_ratio_id !== action.payload);
        state.success = 'Cast ratio deleted successfully';
        state.error = null;
      })
      .addCase(deleteCastRatio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Assign cast ratio to category
      .addCase(assignCastRatioToCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignCastRatioToCategory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.castRatios.findIndex(castRatio => castRatio.caste_ratio_id === action.payload.id);
        if (index !== -1) {
          state.castRatios[index] = action.payload;
        }
        state.success = 'Cast ratio assigned to category successfully';
        state.error = null;
      })
      .addCase(assignCastRatioToCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove cast ratio from category
      .addCase(removeCastRatioFromCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeCastRatioFromCategory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.castRatios.findIndex(castRatio => castRatio.caste_ratio_id === action.payload.id);
        if (index !== -1) {
          state.castRatios[index] = action.payload;
        }
        state.success = 'Cast ratio removed from category successfully';
        state.error = null;
      })
      .addCase(removeCastRatioFromCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  setCurrentCastRatio,
  clearCurrentCastRatio,
  setCurrentPage,
} = casteRatioSlice.actions;

export default casteRatioSlice.reducer;
