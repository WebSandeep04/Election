import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApiUrl, getAuthHeaders, API_CONFIG } from '../../config/api';

// Async thunks for API calls
export const fetchForms = createAsyncThunk(
  'forms/fetchForms',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth?.token || localStorage.getItem('auth_token') || undefined;
      const { page = 1, perPage = 10, search = '' } = params;
      const q = new URLSearchParams({ page: String(page), per_page: String(perPage), ...(search ? { search } : {}) });

      const response = await fetch(getApiUrl(`/api/forms?${q.toString()}`), {
        headers: getAuthHeaders(token),
        credentials: API_CONFIG.USE_COOKIE_AUTH ? 'include' : 'same-origin',
      });

      const json = await response.json();
      if (!response.ok) {
        return rejectWithValue(json?.error?.message || 'Failed to fetch forms');
      }

      return { data: json.data || [], meta: json.meta || { page, per_page: perPage, total: 0, total_pages: 0 } };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createForm = createAsyncThunk(
  'forms/createForm',
  async (formData, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth?.token || localStorage.getItem('auth_token') || undefined;
      const response = await fetch(getApiUrl('/api/forms'), {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(formData),
        credentials: API_CONFIG.USE_COOKIE_AUTH ? 'include' : 'same-origin',
      });

      const json = await response.json();
      if (!response.ok) {
        const message = json?.error?.message || json?.message || 'Failed to create form';
        const details = json?.error?.details;
        return rejectWithValue(details ? `${message}: ${JSON.stringify(details)}` : message);
      }

      return json;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateForm = createAsyncThunk(
  'forms/updateForm',
  async ({ id, formData }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth?.token || localStorage.getItem('auth_token') || undefined;
      const response = await fetch(getApiUrl(`/api/forms/${id}`), {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(formData),
        credentials: API_CONFIG.USE_COOKIE_AUTH ? 'include' : 'same-origin',
      });

      const json = await response.json();
      if (!response.ok) {
        const message = json?.error?.message || json?.message || 'Failed to update form';
        const details = json?.error?.details;
        return rejectWithValue(details ? `${message}: ${JSON.stringify(details)}` : message);
      }

      return json;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteForm = createAsyncThunk(
  'forms/deleteForm',
  async (id, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth?.token || localStorage.getItem('auth_token') || undefined;
      const response = await fetch(getApiUrl(`/api/forms/${id}`), {
        method: 'DELETE',
        headers: getAuthHeaders(token),
        credentials: API_CONFIG.USE_COOKIE_AUTH ? 'include' : 'same-origin',
      });

      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        return rejectWithValue(json?.error?.message || 'Failed to delete form');
      }

      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchFormById = createAsyncThunk(
  'forms/fetchFormById',
  async (id, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth?.token || localStorage.getItem('auth_token') || undefined;
      const response = await fetch(getApiUrl(`/api/forms/${id}`), {
        headers: getAuthHeaders(token),
        credentials: API_CONFIG.USE_COOKIE_AUTH ? 'include' : 'same-origin',
      });

      const json = await response.json();
      if (!response.ok) {
        return rejectWithValue(json?.error?.message || 'Failed to fetch form');
      }
      return json;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  forms: [],
  meta: { page: 1, per_page: 10, total: 0, total_pages: 0 },
  currentForm: null,
  loading: false,
  error: null,
  success: null,
};

const formSlice = createSlice({
  name: 'forms',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    setCurrentForm: (state, action) => {
      state.currentForm = action.payload;
    },
    clearCurrentForm: (state) => {
      state.currentForm = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Forms
      .addCase(fetchForms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchForms.fulfilled, (state, action) => {
        state.loading = false;
        state.forms = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchForms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Form
      .addCase(createForm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createForm.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(state.forms)) {
          state.forms.unshift(action.payload);
        } else {
          state.forms = [action.payload];
        }
        state.success = 'Form created successfully!';
      })
      .addCase(createForm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Form
      .addCase(updateForm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateForm.fulfilled, (state, action) => {
        state.loading = false;
        if (!Array.isArray(state.forms)) {
          state.forms = [action.payload];
        } else {
          const index = state.forms.findIndex(form => form.id === action.payload.id);
          if (index !== -1) {
            state.forms[index] = action.payload;
          } else {
            state.forms.unshift(action.payload);
          }
        }
        state.success = 'Form updated successfully!';
      })
      .addCase(updateForm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Form
      .addCase(deleteForm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteForm.fulfilled, (state, action) => {
        state.loading = false;
        state.forms = Array.isArray(state.forms)
          ? state.forms.filter(form => form.id !== action.payload)
          : [];
        state.success = 'Form deleted successfully!';
      })
      .addCase(deleteForm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Form by ID
      .addCase(fetchFormById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFormById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentForm = action.payload;
      })
      .addCase(fetchFormById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, setCurrentForm, clearCurrentForm } = formSlice.actions;
export default formSlice.reducer;
