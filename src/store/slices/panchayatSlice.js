import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_CONFIG, getApiUrl, getAuthHeaders } from '../../config/api';

// Helper function to get token from localStorage or Redux state
const getToken = (getState) => {
  const reduxToken = getState().auth.token;
  if (reduxToken) return reduxToken;
  const localToken = localStorage.getItem('auth_token');
  if (localToken) return localToken;
  return null;
};

// Async thunks
export const fetchPanchayats = createAsyncThunk(
  'panchayat/fetchPanchayats',
  async (page = 1, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.PANCHAYAT)}?page=${page}`;
      
      console.log('=== FETCH PANCHAYATS API CALL ===');
      console.log('Method: GET, URL:', url, 'Token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('=== FETCH PANCHAYATS API RESPONSE ===');
      console.log('Status:', response.status, 'Data:', data);

      const panchayats = data.panchayats || data.data || [];
      const pagination = data.pagination || data.meta || {
        current_page: 1, last_page: 1, per_page: 10, total: 0, from: 1, to: 0
      };

      return { panchayats, pagination };
    } catch (error) {
      console.error('Error fetching Panchayats:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const createPanchayat = createAsyncThunk(
  'panchayat/createPanchayat',
  async (panchayatData, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = getApiUrl(API_CONFIG.ENDPOINTS.PANCHAYAT);
      
      console.log('=== CREATE PANCHAYAT API CALL ===');
      console.log('Method: POST, URL:', url, 'Data:', panchayatData);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(panchayatData),
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
      console.log('=== CREATE PANCHAYAT API RESPONSE ===');
      console.log('Status:', response.status, 'Data:', data);

      return data.panchayat || data;
    } catch (error) {
      console.error('Error creating Panchayat:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const updatePanchayat = createAsyncThunk(
  'panchayat/updatePanchayat',
  async ({ id, panchayatData }, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.PANCHAYAT)}/${id}`;
      
      console.log('=== UPDATE PANCHAYAT API CALL ===');
      console.log('Method: PUT, URL:', url, 'ID:', id, 'Data:', panchayatData);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(panchayatData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('=== UPDATE PANCHAYAT API RESPONSE ===');
      console.log('Status:', response.status, 'Data:', data);

      return data.panchayat || data;
    } catch (error) {
      console.error('Error updating Panchayat:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const deletePanchayat = createAsyncThunk(
  'panchayat/deletePanchayat',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.PANCHAYAT)}/${id}`;
      
      console.log('=== DELETE PANCHAYAT API CALL ===');
      console.log('Method: DELETE, URL:', url, 'ID:', id);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      console.log('=== DELETE PANCHAYAT API SUCCESS ===');
      console.log('Status:', response.status, 'Deleted ID:', id);
      return id;
    } catch (error) {
      console.error('Error deleting Panchayat:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  panchayats: [],
  currentPanchayat: null,
  loading: false,
  error: null,
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 1,
    to: 0
  }
};

// Slice
const panchayatSlice = createSlice({
  name: 'panchayat',
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
    resetPanchayatState: (state) => {
      state.panchayats = [];
      state.currentPanchayat = null;
      state.loading = false;
      state.error = null;
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
    builder
      // Fetch Panchayats
      .addCase(fetchPanchayats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPanchayats.fulfilled, (state, action) => {
        state.loading = false;
        state.panchayats = Array.isArray(action.payload.panchayats) ? action.payload.panchayats : [];
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPanchayats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Panchayat
      .addCase(createPanchayat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPanchayat.fulfilled, (state, action) => {
        state.loading = false;
        state.panchayats.unshift(action.payload);
      })
      .addCase(createPanchayat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Panchayat
      .addCase(updatePanchayat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePanchayat.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.panchayats.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.panchayats[index] = action.payload;
        }
      })
      .addCase(updatePanchayat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Panchayat
      .addCase(deletePanchayat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePanchayat.fulfilled, (state, action) => {
        state.loading = false;
        state.panchayats = state.panchayats.filter(item => item.id !== action.payload);
      })
      .addCase(deletePanchayat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearSuccess, 
  setCurrentPage, 
  resetPanchayatState 
} = panchayatSlice.actions;

export default panchayatSlice.reducer;
