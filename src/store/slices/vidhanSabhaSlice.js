import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_CONFIG, getApiUrl, getAuthHeaders } from '../../config/api';

// Helper function to get token from localStorage or Redux state
const getToken = (getState) => {
  // First try to get from Redux state
  const reduxToken = getState().auth.token;
  if (reduxToken) return reduxToken;
  
  // Fallback to localStorage
  const localToken = localStorage.getItem('auth_token');
  if (localToken) return localToken;
  
  return null;
};

// Async thunks
export const fetchVidhanSabhas = createAsyncThunk(
  'vidhanSabha/fetchVidhanSabhas',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const { page = 1, search = '' } = params;
      
      let url = `${getApiUrl(API_CONFIG.ENDPOINTS.VIDHAN_SABHA)}?page=${page}`;
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

export const fetchVidhanSabhaById = createAsyncThunk(
  'vidhanSabha/fetchVidhanSabhaById',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.VIDHAN_SABHA)}/${id}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Extract vidhan_sabha from the response
      return data.vidhan_sabha || data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchVidhanSabhasByLokSabha = createAsyncThunk(
  'vidhanSabha/fetchVidhanSabhasByLokSabha',
  async (loksabhaId, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.VIDHAN_SABHA)}/lok-sabha/${loksabhaId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.vidhan_sabhas || data.data || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createVidhanSabha = createAsyncThunk(
  'vidhanSabha/createVidhanSabha',
  async (vidhanSabhaData, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = getApiUrl(API_CONFIG.ENDPOINTS.VIDHAN_SABHA);
      
      const headers = getAuthHeaders(token);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(vidhanSabhaData),
      });

      if (!response.ok) {
        // Check if response is HTML (error page) or JSON
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('text/html')) {
          // Laravel returned an HTML error page
          const errorText = await response.text();
          console.error('HTML Error Response:', errorText);
          throw new Error(`Server Error (${response.status}): Laravel returned HTML error page. Check server logs.`);
        } else {
          // Try to parse as JSON
          const errorData = await response.json().catch(() => ({}));
          console.error('JSON Error Response:', errorData);
          throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();
      // Extract vidhan_sabha from the response
      return data.vidhan_sabha || data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateVidhanSabha = createAsyncThunk(
  'vidhanSabha/updateVidhanSabha',
  async ({ id, vidhanSabhaData }, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.VIDHAN_SABHA)}/${id}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(vidhanSabhaData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Extract vidhan_sabha from the response
      return data.vidhan_sabha || data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteVidhanSabha = createAsyncThunk(
  'vidhanSabha/deleteVidhanSabha',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.VIDHAN_SABHA)}/${id}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('=== DELETE VIDHAN SABHA API ERROR ===');
        console.log('Status:', response.status);
        console.log('Error Data:', errorData);
        console.log('================================');
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      console.log('=== DELETE VIDHAN SABHA API SUCCESS ===');
      console.log('Status:', response.status);
      console.log('Deleted ID:', id);
      console.log('==================================');
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  vidhanSabhas: [],
  currentVidhanSabha: null,
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
const vidhanSabhaSlice = createSlice({
  name: 'vidhanSabha',
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
    resetVidhanSabhaState: (state) => {
      state.vidhanSabhas = [];
      state.currentVidhanSabha = null;
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
      // Fetch Vidhan Sabhas
      .addCase(fetchVidhanSabhas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVidhanSabhas.fulfilled, (state, action) => {
        state.loading = false;
        state.vidhanSabhas = Array.isArray(action.payload.vidhan_sabhas) ? action.payload.vidhan_sabhas : [];
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchVidhanSabhas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Vidhan Sabha by ID
      .addCase(fetchVidhanSabhaById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVidhanSabhaById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVidhanSabha = action.payload;
      })
      .addCase(fetchVidhanSabhaById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Vidhan Sabhas by Lok Sabha
      .addCase(fetchVidhanSabhasByLokSabha.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVidhanSabhasByLokSabha.fulfilled, (state, action) => {
        state.loading = false;
        state.vidhanSabhas = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchVidhanSabhasByLokSabha.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Vidhan Sabha
      .addCase(createVidhanSabha.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVidhanSabha.fulfilled, (state, action) => {
        state.loading = false;
        // Add the new Vidhan Sabha to the list
        state.vidhanSabhas.unshift(action.payload);
      })
      .addCase(createVidhanSabha.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Vidhan Sabha
      .addCase(updateVidhanSabha.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVidhanSabha.fulfilled, (state, action) => {
        state.loading = false;
        // Update the Vidhan Sabha in the list
        const index = state.vidhanSabhas.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.vidhanSabhas[index] = action.payload;
        }
      })
      .addCase(updateVidhanSabha.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Vidhan Sabha
      .addCase(deleteVidhanSabha.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVidhanSabha.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the Vidhan Sabha from the list
        state.vidhanSabhas = state.vidhanSabhas.filter(item => item.id !== action.payload);
      })
      .addCase(deleteVidhanSabha.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearSuccess, 
  setCurrentPage, 
  resetVidhanSabhaState 
} = vidhanSabhaSlice.actions;

export default vidhanSabhaSlice.reducer;
