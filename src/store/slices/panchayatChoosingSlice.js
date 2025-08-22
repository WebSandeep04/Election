import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_CONFIG, getApiUrl } from '../../config/api';

// Async thunk to fetch panchayat choosing options
export const fetchPanchayatChoosings = createAsyncThunk(
  'panchayatChoosing/fetchPanchayatChoosings',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.PANCHAYAT_CHOOSING)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch panchayat choosing options');
      }

             const data = await response.json();
       // Handle the API response structure: { panchayat_choosings: [...], pagination: {...} }
       return data.panchayat_choosings || data.data || data;
    } catch (error) {
      console.error('Error fetching panchayat choosing options:', error);
      return rejectWithValue(error.message || 'Failed to fetch panchayat choosing options');
    }
  }
);

const initialState = {
  panchayatChoosings: [],
  loading: false,
  error: null
};

const panchayatChoosingSlice = createSlice({
  name: 'panchayatChoosing',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPanchayatChoosings: (state) => {
      state.panchayatChoosings = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPanchayatChoosings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPanchayatChoosings.fulfilled, (state, action) => {
        state.loading = false;
        state.panchayatChoosings = action.payload;
        state.error = null;
      })
      .addCase(fetchPanchayatChoosings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch panchayat choosing options';
      });
  }
});

export const { clearError, clearPanchayatChoosings } = panchayatChoosingSlice.actions;
export default panchayatChoosingSlice.reducer;
