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
export const fetchLokSabhas = createAsyncThunk(
  'lokSabha/fetchLokSabhas',
  async (page = 1, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.LOK_SABHA)}?page=${page}`;
      
      
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();


      // Extract lok_sabhas and pagination from the response
      const lokSabhas = data.lok_sabhas || data.data || [];
      const pagination = data.pagination || data.meta || {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        from: 1,
        to: 0
      };

      return { lokSabhas, pagination };
    } catch (error) {
      console.error('Error fetching Lok Sabhas:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchLokSabhaById = createAsyncThunk(
  'lokSabha/fetchLokSabhaById',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.LOK_SABHA)}/${id}`;
      
      
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();


      // Extract lok_sabha from the response
      return data.lok_sabha || data;
    } catch (error) {
      console.error('Error fetching Lok Sabha by ID:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const createLokSabha = createAsyncThunk(
  'lokSabha/createLokSabha',
  async (lokSabhaData, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = getApiUrl(API_CONFIG.ENDPOINTS.LOK_SABHA);
      
      
      
      const headers = getAuthHeaders(token);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(lokSabhaData),
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

      // Extract lok_sabha from the response
      return data.lok_sabha || data;
    } catch (error) {
      console.error('Error creating Lok Sabha:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateLokSabha = createAsyncThunk(
  'lokSabha/updateLokSabha',
  async ({ id, lokSabhaData }, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.LOK_SABHA)}/${id}`;
      

      
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(lokSabhaData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Extract lok_sabha from the response
      return data.lok_sabha || data;
    } catch (error) {
      console.error('Error updating Lok Sabha:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteLokSabha = createAsyncThunk(
  'lokSabha/deleteLokSabha',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.LOK_SABHA)}/${id}`;
      

      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }


      return id;
    } catch (error) {
      console.error('Error deleting Lok Sabha:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  lokSabhas: [],
  currentLokSabha: null,
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
const lokSabhaSlice = createSlice({
  name: 'lokSabha',
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
    resetLokSabhaState: (state) => {
      state.lokSabhas = [];
      state.currentLokSabha = null;
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
      // Fetch Lok Sabhas
      .addCase(fetchLokSabhas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLokSabhas.fulfilled, (state, action) => {
        state.loading = false;
        state.lokSabhas = Array.isArray(action.payload.lokSabhas) ? action.payload.lokSabhas : [];
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchLokSabhas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Lok Sabha by ID
      .addCase(fetchLokSabhaById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLokSabhaById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLokSabha = action.payload;
      })
      .addCase(fetchLokSabhaById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Lok Sabha
      .addCase(createLokSabha.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLokSabha.fulfilled, (state, action) => {
        state.loading = false;
        // Add the new Lok Sabha to the list
        state.lokSabhas.unshift(action.payload);
      })
      .addCase(createLokSabha.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Lok Sabha
      .addCase(updateLokSabha.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLokSabha.fulfilled, (state, action) => {
        state.loading = false;
        // Update the Lok Sabha in the list
        const index = state.lokSabhas.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.lokSabhas[index] = action.payload;
        }
      })
      .addCase(updateLokSabha.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Lok Sabha
      .addCase(deleteLokSabha.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLokSabha.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the Lok Sabha from the list
        state.lokSabhas = state.lokSabhas.filter(item => item.id !== action.payload);
      })
      .addCase(deleteLokSabha.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearSuccess, 
  setCurrentPage, 
  resetLokSabhaState 
} = lokSabhaSlice.actions;

export default lokSabhaSlice.reducer;
