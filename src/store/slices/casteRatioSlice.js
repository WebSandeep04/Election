import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApiUrl, getAuthHeaders } from '../../config/api';

// Helper function to get token from state
const getToken = (getState) => {
  const { auth } = getState();
  const localToken = localStorage.getItem('auth_token');
  if (auth?.token) return auth.token;
  if (localToken) return localToken;
  return null;
};

// Async thunks for CRUD operations
export const fetchCasteRatios = createAsyncThunk(
  'casteRatio/fetchCasteRatios',
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const { 
        page = 1, 
        search = '', 
        caste_id, 
        loksabha_id, 
        vidhansabha_id, 
        block_id, 
        panchayat_id, 
        village_id, 
        booth_id,
        sort_by = 'created_at',
        sort_order = 'desc',
        per_page = 10
      } = params;
      
      const qp = new URLSearchParams({ 
        page: String(page),
        sort_by,
        sort_order,
        per_page: String(per_page)
      });
      
      if (search && String(search).trim().length > 0) qp.set('search', String(search).trim());
      if (caste_id) qp.set('caste_id', String(caste_id));
      if (loksabha_id) qp.set('loksabha_id', String(loksabha_id));
      if (vidhansabha_id) qp.set('vidhansabha_id', String(vidhansabha_id));
      if (block_id) qp.set('block_id', String(block_id));
      if (panchayat_id) qp.set('panchayat_id', String(panchayat_id));
      if (village_id) qp.set('village_id', String(village_id));
      if (booth_id) qp.set('booth_id', String(booth_id));
      
             const url = `${getApiUrl('/api/cast-ratios')}?${qp.toString()}`;
      
      console.log('=== FETCH CASTE RATIOS API CALL ===');
      console.log('Method: GET, URL:', url, 'Token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('=== FETCH CASTE RATIOS API RESPONSE ===');
      console.log('Status:', response.status, 'Data:', data);

      const castRatios = data.cast_ratios || data.data || [];
      const pagination = data.pagination || data.meta || {
        current_page: page, 
        last_page: 1, 
        per_page: 10, 
        total: castRatios.length, 
        from: 1, 
        to: castRatios.length
      };

      return { castRatios, pagination };
    } catch (error) {
      console.error('Error fetching Caste Ratios:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCasteRatioById = createAsyncThunk(
  'casteRatio/fetchCasteRatioById',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl('/api/cast-ratios')}/${id}`;
      
      console.log('=== FETCH CASTE RATIO BY ID API CALL ===');
      console.log('Method: GET, URL:', url, 'Token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('=== FETCH CASTE RATIO BY ID API RESPONSE ===');
      console.log('Status:', response.status, 'Data:', data);

      return data.data || data;
    } catch (error) {
      console.error('Error fetching Caste Ratio by ID:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const createCasteRatio = createAsyncThunk(
  'casteRatio/createCasteRatio',
  async (casteRatioData, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = getApiUrl('/api/cast-ratios');
      
      console.log('=== CREATE CASTE RATIO API CALL ===');
      console.log('Method: POST, URL:', url, 'Data:', casteRatioData);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(casteRatioData),
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
      console.log('=== CREATE CASTE RATIO API RESPONSE ===');
      console.log('Status:', response.status, 'Data:', data);

      return data.data || data;
    } catch (error) {
      console.error('Error creating Caste Ratio:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateCasteRatio = createAsyncThunk(
  'casteRatio/updateCasteRatio',
  async ({ id, casteRatioData }, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl('/api/cast-ratios')}/${id}`;
      
      console.log('=== UPDATE CASTE RATIO API CALL ===');
      console.log('Method: PUT, URL:', url, 'Data:', casteRatioData);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(casteRatioData),
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
      console.log('=== UPDATE CASTE RATIO API RESPONSE ===');
      console.log('Status:', response.status, 'Data:', data);

      return data.data || data;
    } catch (error) {
      console.error('Error updating Caste Ratio:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCasteRatio = createAsyncThunk(
  'casteRatio/deleteCasteRatio',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl('/api/cast-ratios')}/${id}`;
      
      console.log('=== DELETE CASTE RATIO API CALL ===');
      console.log('Method: DELETE, URL:', url, 'Token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('=== DELETE CASTE RATIO API RESPONSE ===');
      console.log('Status:', response.status, 'Data:', data);

      return { id, message: data.message || 'Caste ratio deleted successfully' };
    } catch (error) {
      console.error('Error deleting Caste Ratio:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  castRatios: [],
  currentCasteRatio: null,
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

// Slice
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
    setCurrentCasteRatio: (state, action) => {
      state.currentCasteRatio = action.payload;
    },
    clearCurrentCasteRatio: (state) => {
      state.currentCasteRatio = null;
    },
    setCurrentPage: (state, action) => {
      state.pagination.current_page = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Caste Ratios
      .addCase(fetchCasteRatios.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCasteRatios.fulfilled, (state, action) => {
        state.loading = false;
        state.castRatios = action.payload.castRatios;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchCasteRatios.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Caste Ratio by ID
      .addCase(fetchCasteRatioById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCasteRatioById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCasteRatio = action.payload;
        state.error = null;
      })
      .addCase(fetchCasteRatioById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Caste Ratio
      .addCase(createCasteRatio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCasteRatio.fulfilled, (state, action) => {
        state.loading = false;
        state.castRatios.unshift(action.payload);
        state.success = 'Caste ratio created successfully';
        state.error = null;
      })
      .addCase(createCasteRatio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Caste Ratio
      .addCase(updateCasteRatio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCasteRatio.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.castRatios.findIndex(cr => cr.caste_ratio_id === action.payload.caste_ratio_id);
        if (index !== -1) {
          state.castRatios[index] = action.payload;
        }
        state.success = 'Caste ratio updated successfully';
        state.error = null;
      })
      .addCase(updateCasteRatio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Caste Ratio
      .addCase(deleteCasteRatio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCasteRatio.fulfilled, (state, action) => {
        state.loading = false;
        state.castRatios = state.castRatios.filter(cr => cr.caste_ratio_id !== action.payload.id);
        state.success = action.payload.message;
        state.error = null;
      })
      .addCase(deleteCasteRatio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearError,
  clearSuccess,
  setCurrentCasteRatio,
  clearCurrentCasteRatio,
  setCurrentPage
} = casteRatioSlice.actions;

export default casteRatioSlice.reducer;
