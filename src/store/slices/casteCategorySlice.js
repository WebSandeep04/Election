import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApiUrl, getAuthHeaders } from '../../config/api';

// Async thunk to fetch all caste categories
export const fetchCasteCategories = createAsyncThunk(
  'casteCategory/fetchCasteCategories',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(getApiUrl('/api/caste-categories'), {
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
        return rejectWithValue(data.message || 'Failed to fetch caste categories');
      }

      // Handle Laravel API response format
      const categories = data && Array.isArray(data.data) ? data.data : 
                       Array.isArray(data) ? data : 
                       data && Array.isArray(data.categories) ? data.categories : [];
      
      return categories;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const initialState = {
  categories: [],
  loading: false,
  error: null,
};

const casteCategorySlice = createSlice({
  name: 'casteCategory',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCasteCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCasteCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
        state.error = null;
      })
      .addCase(fetchCasteCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = casteCategorySlice.actions;
export default casteCategorySlice.reducer;
