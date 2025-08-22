import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_CONFIG, getApiUrl, getAuthHeaders } from '../../config/api';

// Simplified getToken helper
const getToken = (getState) => {
  const reduxToken = getState().auth.token;
  if (reduxToken) return reduxToken;
  const localToken = localStorage.getItem('auth_token');
  if (localToken) return localToken;
  return null;
};

// Async thunks
export const fetchVillages = createAsyncThunk(
  'village/fetchVillages',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const { page = 1, search = '' } = params;
      
      let url = `${getApiUrl(API_CONFIG.ENDPOINTS.VILLAGE)}?page=${page}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createVillage = createAsyncThunk(
  'village/createVillage',
  async (villageData, { rejectWithValue, getState }) => {
    const token = getToken(getState);
    const url = getApiUrl(API_CONFIG.ENDPOINTS.VILLAGE);
    
    try {
      const response = await fetch(url, { 
        method: 'POST', 
        headers: getAuthHeaders(token), 
        body: JSON.stringify(villageData) 
      });
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          const errorText = await response.text();
          throw new Error(`Server Error (${response.status}): Laravel returned HTML error page.`);
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
      }
      
      const data = await response.json();
      
      return data.village || data;
    } catch (error) {
      console.error('=== CREATE VILLAGE API ERROR ===');
      console.error('Error:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const updateVillage = createAsyncThunk(
  'village/updateVillage',
  async ({ id, villageData }, { rejectWithValue, getState }) => {
    const token = getToken(getState);
    const url = `${getApiUrl(API_CONFIG.ENDPOINTS.VILLAGE)}/${id}`;
    
    try {
      const response = await fetch(url, { 
        method: 'PUT', 
        headers: getAuthHeaders(token), 
        body: JSON.stringify(villageData) 
      });
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          const errorText = await response.text();
          throw new Error(`Server Error (${response.status}): Laravel returned HTML error page.`);
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
      }
      
      const data = await response.json();
      
      return data.village || data;
    } catch (error) {
      console.error('=== UPDATE VILLAGE API ERROR ===');
      console.error('Error:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteVillage = createAsyncThunk(
  'village/deleteVillage',
  async (id, { rejectWithValue, getState }) => {
    const token = getToken(getState);
    const url = `${getApiUrl(API_CONFIG.ENDPOINTS.VILLAGE)}/${id}`;
    
    try {
      const response = await fetch(url, { 
        method: 'DELETE', 
        headers: getAuthHeaders(token) 
      });
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          const errorText = await response.text();
          throw new Error(`Server Error (${response.status}): Laravel returned HTML error page.`);
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
      }
      
      const data = await response.json();
      
      return { id, message: data.message || 'Village deleted successfully' };
    } catch (error) {
      console.error('=== DELETE VILLAGE API ERROR ===');
      console.error('Error:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchVillagesByPanchayat = createAsyncThunk(
  'village/fetchVillagesByPanchayat',
  async (panchayatId, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.VILLAGE)}/panchayat/${panchayatId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.villages || data.data || [];
    } catch (error) {
      console.error('Error fetching Villages by Panchayat:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  villages: [],
  currentVillage: null,
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

// Village slice
const villageSlice = createSlice({
  name: 'village',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    setCurrentPage: (state, action) => {
      state.pagination.current_page = action.payload;
    },
    resetVillageState: (state) => {
      state.villages = [];
      state.currentVillage = null;
      state.loading = false;
      state.error = null;
      state.success = null;
      state.pagination = {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        from: 1,
        to: 0
      };
    }
  },
  extraReducers: (builder) => {
    // Fetch villages
    builder
      .addCase(fetchVillages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVillages.fulfilled, (state, action) => {
        state.loading = false;
        state.villages = action.payload.villages || action.payload.data || [];
        state.pagination = action.payload.pagination || action.payload.meta || { 
          current_page: action.payload.page || 1, 
          last_page: action.payload.last_page || 1, 
          per_page: action.payload.per_page || 10, 
          total: action.payload.total || 0, 
          from: action.payload.from || 1, 
          to: action.payload.to || 0 
        };
      })
      .addCase(fetchVillages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch villages';
      });

    // Create village
    builder
      .addCase(createVillage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVillage.fulfilled, (state, action) => {
        state.loading = false;
        // Don't add to state immediately - let the component refresh the list
        state.success = 'Village created successfully';
        state.pagination.total += 1;
      })
      .addCase(createVillage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create village';
      });

    // Update village
    builder
      .addCase(updateVillage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVillage.fulfilled, (state, action) => {
        state.loading = false;
        // Don't update in state immediately - let the component refresh the list
        state.success = 'Village updated successfully';
      })
      .addCase(updateVillage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update village';
      });

    // Delete village
    builder
      .addCase(deleteVillage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVillage.fulfilled, (state, action) => {
        state.loading = false;
        // Don't update state immediately - let the component refresh the list
        state.success = action.payload.message;
        state.pagination.total -= 1;
      })
      .addCase(deleteVillage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete village';
      })

      // Fetch Villages by Panchayat
      .addCase(fetchVillagesByPanchayat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVillagesByPanchayat.fulfilled, (state, action) => {
        state.loading = false;
        // This doesn't update the main villages state, just returns the filtered villages
      })
      .addCase(fetchVillagesByPanchayat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  clearError, 
  clearSuccess, 
  setCurrentPage, 
  resetVillageState 
} = villageSlice.actions;

export default villageSlice.reducer;
