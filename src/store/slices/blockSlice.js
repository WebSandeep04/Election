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
export const fetchBlocks = createAsyncThunk(
  'block/fetchBlocks',
  async (page = 1, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.BLOCK)}?page=${page}`;
      
      console.log('=== FETCH BLOCKS API CALL ===');
      console.log('Method: GET, URL:', url, 'Token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('=== FETCH BLOCKS API RESPONSE ===');
      console.log('Status:', response.status, 'Data:', data);

      const blocks = data.blocks || data.data || [];
      const pagination = data.pagination || data.meta || {
        current_page: 1, last_page: 1, per_page: 10, total: 0, from: 1, to: 0
      };

      return { blocks, pagination };
    } catch (error) {
      console.error('Error fetching Blocks:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const createBlock = createAsyncThunk(
  'block/createBlock',
  async (blockData, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = getApiUrl(API_CONFIG.ENDPOINTS.BLOCK);
      
      console.log('=== CREATE BLOCK API CALL ===');
      console.log('Method: POST, URL:', url, 'Data:', blockData);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(blockData),
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
      console.log('=== CREATE BLOCK API RESPONSE ===');
      console.log('Status:', response.status, 'Data:', data);

      return data.block || data;
    } catch (error) {
      console.error('Error creating Block:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateBlock = createAsyncThunk(
  'block/updateBlock',
  async ({ id, blockData }, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.BLOCK)}/${id}`;
      
      console.log('=== UPDATE BLOCK API CALL ===');
      console.log('Method: PUT, URL:', url, 'ID:', id, 'Data:', blockData);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(blockData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('=== UPDATE BLOCK API RESPONSE ===');
      console.log('Status:', response.status, 'Data:', data);

      return data.block || data;
    } catch (error) {
      console.error('Error updating Block:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteBlock = createAsyncThunk(
  'block/deleteBlock',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.BLOCK)}/${id}`;
      
      console.log('=== DELETE BLOCK API CALL ===');
      console.log('Method: DELETE, URL:', url, 'ID:', id);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      console.log('=== DELETE BLOCK API SUCCESS ===');
      console.log('Status:', response.status, 'Deleted ID:', id);
      return id;
    } catch (error) {
      console.error('Error deleting Block:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBlocksByVidhanSabha = createAsyncThunk(
  'block/fetchBlocksByVidhanSabha',
  async (vidhansabhaId, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.BLOCK)}/vidhan-sabha/${vidhansabhaId}`;
      
      console.log('=== FETCH BLOCKS BY VIDHAN SABHA API CALL ===');
      console.log('Method: GET, URL:', url, 'Vidhan Sabha ID:', vidhansabhaId, 'Token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('=== FETCH BLOCKS BY VIDHAN SABHA API RESPONSE ===');
      console.log('Status:', response.status, 'Data:', data);

      const blocks = data.blocks || data.data || [];
      return blocks;
    } catch (error) {
      console.error('Error fetching Blocks by Vidhan Sabha:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  blocks: [],
  currentBlock: null,
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
const blockSlice = createSlice({
  name: 'block',
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
    resetBlockState: (state) => {
      state.blocks = [];
      state.currentBlock = null;
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
      // Fetch Blocks
      .addCase(fetchBlocks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlocks.fulfilled, (state, action) => {
        state.loading = false;
        state.blocks = Array.isArray(action.payload.blocks) ? action.payload.blocks : [];
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBlocks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Block
      .addCase(createBlock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBlock.fulfilled, (state, action) => {
        state.loading = false;
        state.blocks.unshift(action.payload);
      })
      .addCase(createBlock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Block
      .addCase(updateBlock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBlock.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.blocks.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.blocks[index] = action.payload;
        }
      })
      .addCase(updateBlock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Block
      .addCase(deleteBlock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBlock.fulfilled, (state, action) => {
        state.loading = false;
        state.blocks = state.blocks.filter(item => item.id !== action.payload);
      })
      .addCase(deleteBlock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Blocks by Vidhan Sabha
      .addCase(fetchBlocksByVidhanSabha.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlocksByVidhanSabha.fulfilled, (state, action) => {
        state.loading = false;
        // This doesn't update the main blocks state, just returns the filtered blocks
      })
      .addCase(fetchBlocksByVidhanSabha.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearSuccess, 
  setCurrentPage, 
  resetBlockState 
} = blockSlice.actions;

export default blockSlice.reducer;
