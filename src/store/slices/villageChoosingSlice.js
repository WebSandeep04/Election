import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_CONFIG, getApiUrl } from '../../config/api';

// Async thunk to fetch village choosing options
export const fetchVillageChoosings = createAsyncThunk(
  'villageChoosing/fetchVillageChoosings',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.VILLAGE_CHOOSING)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch village choosing options');
      }

             const data = await response.json();
       // Handle the API response structure: { village_choosings: [...], pagination: {...} }
       return data.village_choosings || data.data || data;
    } catch (error) {
      console.error('Error fetching village choosing options:', error);
      return rejectWithValue(error.message || 'Failed to fetch village choosing options');
    }
  }
);

const initialState = {
  villageChoosings: [],
  loading: false,
  error: null
};

const villageChoosingSlice = createSlice({
  name: 'villageChoosing',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearVillageChoosings: (state) => {
      state.villageChoosings = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVillageChoosings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVillageChoosings.fulfilled, (state, action) => {
        state.loading = false;
        state.villageChoosings = action.payload;
        state.error = null;
      })
      .addCase(fetchVillageChoosings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch village choosing options';
      });
  }
});

export const { clearError, clearVillageChoosings } = villageChoosingSlice.actions;
export default villageChoosingSlice.reducer;
