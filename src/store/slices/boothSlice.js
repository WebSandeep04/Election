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
export const fetchBooths = createAsyncThunk(
  'booth/fetchBooths',
  async (params = {}, { rejectWithValue, getState }) => {
    const token = getToken(getState);
    const { page = 1, search = '' } = params;
    const qp = new URLSearchParams({ page: String(page) });
    if (search && String(search).trim().length > 0) qp.set('search', String(search).trim());
    const url = `${getApiUrl(API_CONFIG.ENDPOINTS.BOOTH)}?${qp.toString()}`;
    console.log('=== FETCH BOOTHS API CALL ===');
    console.log('Method: GET, URL:', url, 'Token:', token ? 'Present' : 'Missing');
    
    try {
      const response = await fetch(url, { 
        method: 'GET', 
        headers: getAuthHeaders(token) 
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('=== FETCH BOOTHS API RESPONSE ===');
      console.log('Status:', response.status, 'Data:', data);
      
      const booths = data.booths || data.data || [];
      const pagination = data.pagination || data.meta || { 
        current_page: page, 
        last_page: 1, 
        per_page: 10, 
        total: booths.length, 
        from: 1, 
        to: booths.length 
      };
      
      return { booths, pagination };
    } catch (error) {
      console.error('=== FETCH BOOTHS API ERROR ===');
      console.error('Error:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const createBooth = createAsyncThunk(
  'booth/createBooth',
  async (boothData, { rejectWithValue, getState }) => {
    const token = getToken(getState);
    const url = getApiUrl(API_CONFIG.ENDPOINTS.BOOTH);
    console.log('=== CREATE BOOTH API CALL ===');
    console.log('Method: POST, URL:', url, 'Data:', boothData);
    
    try {
      const response = await fetch(url, { 
        method: 'POST', 
        headers: getAuthHeaders(token), 
        body: JSON.stringify(boothData) 
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
      console.log('=== CREATE BOOTH API RESPONSE ===');
      console.log('Status:', response.status, 'Data:', data);
      
      return data.booth || data;
    } catch (error) {
      console.error('=== CREATE BOOTH API ERROR ===');
      console.error('Error:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const updateBooth = createAsyncThunk(
  'booth/updateBooth',
  async ({ id, boothData }, { rejectWithValue, getState }) => {
    const token = getToken(getState);
    const url = `${getApiUrl(API_CONFIG.ENDPOINTS.BOOTH)}/${id}`;
    console.log('=== UPDATE BOOTH API CALL ===');
    console.log('Method: PUT, URL:', url, 'ID:', id, 'Data:', boothData);
    
    try {
      const response = await fetch(url, { 
        method: 'PUT', 
        headers: getAuthHeaders(token), 
        body: JSON.stringify(boothData) 
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
      console.log('=== UPDATE BOOTH API RESPONSE ===');
      console.log('Status:', response.status, 'Data:', data);
      
      return data.booth || data;
    } catch (error) {
      console.error('=== UPDATE BOOTH API ERROR ===');
      console.error('Error:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteBooth = createAsyncThunk(
  'booth/deleteBooth',
  async (id, { rejectWithValue, getState }) => {
    const token = getToken(getState);
    const url = `${getApiUrl(API_CONFIG.ENDPOINTS.BOOTH)}/${id}`;
    console.log('=== DELETE BOOTH API CALL ===');
    console.log('Method: DELETE, URL:', url, 'ID:', id);
    
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
      
      console.log('=== DELETE BOOTH API SUCCESS ===');
      console.log('Status:', response.status, 'Deleted ID:', id);
      return id;
    } catch (error) {
      console.error('=== DELETE BOOTH API ERROR ===');
      console.error('Error:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBoothsByVillage = createAsyncThunk(
  'booth/fetchBoothsByVillage',
  async (villageId, { rejectWithValue, getState }) => {
    const token = getToken(getState);
    const url = `${getApiUrl(API_CONFIG.ENDPOINTS.BOOTH)}/village/${villageId}`;
    
    try {
      const response = await fetch(url, { 
        method: 'GET', 
        headers: getAuthHeaders(token) 
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || data.booths || [];
    } catch (error) {
      console.error('Error fetching Booths by Village:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  booths: [],
  currentBooth: null,
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

// Booth slice
const boothSlice = createSlice({
  name: 'booth',
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
    resetBoothState: (state) => {
      state.booths = [];
      state.currentBooth = null;
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
    // Fetch booths
    builder
      .addCase(fetchBooths.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooths.fulfilled, (state, action) => {
        state.loading = false;
        state.booths = action.payload.booths;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBooths.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch booths';
      });

    // Create booth
    builder
      .addCase(createBooth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooth.fulfilled, (state, action) => {
        state.loading = false;
        // Don't add to state immediately - let the component refresh the list
        state.success = 'Booth created successfully';
        state.pagination.total += 1;
      })
      .addCase(createBooth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create booth';
      });

    // Update booth
    builder
      .addCase(updateBooth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBooth.fulfilled, (state, action) => {
        state.loading = false;
        // Don't update in state immediately - let the component refresh the list
        state.success = 'Booth updated successfully';
      })
      .addCase(updateBooth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update booth';
      });

    // Delete booth
    builder
      .addCase(deleteBooth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBooth.fulfilled, (state, action) => {
        state.loading = false;
        // Don't update state immediately - let the component refresh the list
        state.success = 'Booth deleted successfully';
        state.pagination.total -= 1;
      })
      .addCase(deleteBooth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete booth';
      });

    // Fetch booths by village
    builder
      .addCase(fetchBoothsByVillage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoothsByVillage.fulfilled, (state, action) => {
        state.loading = false;
        // This is for filtered data, don't update the main booths array
      })
      .addCase(fetchBoothsByVillage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch booths by village';
      });
  }
});

export const { 
  clearError, 
  clearSuccess, 
  setCurrentPage, 
  resetBoothState 
} = boothSlice.actions;

export default boothSlice.reducer;
