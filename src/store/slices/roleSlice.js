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
export const fetchRoles = createAsyncThunk(
  'role/fetchRoles',
  async (page = 1, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.ROLES)}?page=${page}`;
      
      console.log('=== FETCH ROLES API CALL ===');
      console.log('Method: GET');
      console.log('URL:', url);
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('Headers:', getAuthHeaders(token));
      console.log('Page:', page);
      console.log('================================');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('=== FETCH ROLES API RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Response Data:', data);
      console.log('====================================');

      // Extract roles and pagination from the response
      const roles = data.roles || data.data || [];
      const pagination = data.pagination || data.meta || {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        from: 1,
        to: 0
      };

      return { roles, pagination };
    } catch (error) {
      console.error('Error fetching roles:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRoleById = createAsyncThunk(
  'role/fetchRoleById',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.ROLES)}/${id}`;
      
      console.log('=== FETCH ROLE BY ID API CALL ===');
      console.log('Method: GET');
      console.log('URL:', url);
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('Headers:', getAuthHeaders(token));
      console.log('ID:', id);
      console.log('=====================================');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('=== FETCH ROLE BY ID API RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Response Data:', data);
      console.log('========================================');

      // Extract role from the response
      return data.role || data;
    } catch (error) {
      console.error('Error fetching role by ID:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const createRole = createAsyncThunk(
  'role/createRole',
  async (roleData, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = getApiUrl(API_CONFIG.ENDPOINTS.ROLES);
      
      console.log('=== CREATE ROLE API CALL ===');
      console.log('Method: POST');
      console.log('URL:', url);
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('Headers:', getAuthHeaders(token));
      console.log('Request Data:', roleData);
      console.log('Request Body (JSON):', JSON.stringify(roleData, null, 2));
      console.log('================================');
      
      const headers = getAuthHeaders(token);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(roleData),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        // Check if response is HTML (error page) or JSON
        const contentType = response.headers.get('content-type');
        console.log('Response content-type:', contentType);
        
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
      console.log('=== CREATE ROLE API RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Response Data:', data);
      console.log('===================================');

      // Extract role from the response
      return data.role || data;
    } catch (error) {
      console.error('Error creating role:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateRole = createAsyncThunk(
  'role/updateRole',
  async ({ id, roleData }, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.ROLES)}/${id}`;
      
      console.log('=== UPDATE ROLE API CALL ===');
      console.log('Method: PUT');
      console.log('URL:', url);
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('Headers:', getAuthHeaders(token));
      console.log('ID:', id);
      console.log('Request Data:', roleData);
      console.log('Request Body (JSON):', JSON.stringify(roleData, null, 2));
      console.log('================================');
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(roleData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('=== UPDATE ROLE API RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Response Data:', data);
      console.log('===================================');

      // Extract role from the response
      return data.role || data;
    } catch (error) {
      console.error('Error updating role:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteRole = createAsyncThunk(
  'role/deleteRole',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.ROLES)}/${id}`;
      
      console.log('=== DELETE ROLE API CALL ===');
      console.log('Method: DELETE');
      console.log('URL:', url);
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('Headers:', getAuthHeaders(token));
      console.log('ID:', id);
      console.log('================================');
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('=== DELETE ROLE API ERROR ===');
        console.log('Status:', response.status);
        console.log('Error Data:', errorData);
        console.log('================================');
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      console.log('=== DELETE ROLE API SUCCESS ===');
      console.log('Status:', response.status);
      console.log('Deleted ID:', id);
      console.log('==================================');
      return id;
    } catch (error) {
      console.error('Error deleting role:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const activateRole = createAsyncThunk(
  'role/activateRole',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.ROLES)}/${id}/activate`;
      
      console.log('=== ACTIVATE ROLE API CALL ===');
      console.log('Method: POST');
      console.log('URL:', url);
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('Headers:', getAuthHeaders(token));
      console.log('ID:', id);
      console.log('================================');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('=== ACTIVATE ROLE API RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Response Data:', data);
      console.log('===================================');

      return data.role || data;
    } catch (error) {
      console.error('Error activating role:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const deactivateRole = createAsyncThunk(
  'role/deactivateRole',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.ROLES)}/${id}/deactivate`;
      
      console.log('=== DEACTIVATE ROLE API CALL ===');
      console.log('Method: POST');
      console.log('URL:', url);
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('Headers:', getAuthHeaders(token));
      console.log('ID:', id);
      console.log('================================');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('=== DEACTIVATE ROLE API RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Response Data:', data);
      console.log('===================================');

      return data.role || data;
    } catch (error) {
      console.error('Error deactivating role:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  roles: [],
  currentRole: null,
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
const roleSlice = createSlice({
  name: 'role',
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
    setCurrentRole: (state, action) => {
      state.currentRole = action.payload;
    },
    clearCurrentRole: (state) => {
      state.currentRole = null;
    },
    resetRoleState: (state) => {
      state.roles = [];
      state.currentRole = null;
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
    builder
      // Fetch Roles
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = Array.isArray(action.payload.roles) ? action.payload.roles : [];
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Role by ID
      .addCase(fetchRoleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoleById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRole = action.payload;
      })
      .addCase(fetchRoleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Role
      .addCase(createRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Role created successfully!';
        // Add the new role to the list
        state.roles.unshift(action.payload);
      })
      .addCase(createRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Role
      .addCase(updateRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Role updated successfully!';
        // Update the role in the list
        const index = state.roles.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.roles[index] = action.payload;
        }
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Role
      .addCase(deleteRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Role deleted successfully!';
        // Remove the role from the list
        state.roles = state.roles.filter(item => item.id !== action.payload);
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Activate Role
      .addCase(activateRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(activateRole.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Role activated successfully!';
        // Update the role in the list
        const index = state.roles.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.roles[index] = action.payload;
        }
      })
      .addCase(activateRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Deactivate Role
      .addCase(deactivateRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deactivateRole.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Role deactivated successfully!';
        // Update the role in the list
        const index = state.roles.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.roles[index] = action.payload;
        }
      })
      .addCase(deactivateRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearSuccess, 
  setCurrentPage, 
  setCurrentRole,
  clearCurrentRole,
  resetRoleState 
} = roleSlice.actions;

export default roleSlice.reducer;
