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
      
      
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();


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
      
      
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();


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
      
      
      
      const headers = getAuthHeaders(token);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(roleData),
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
      

      
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

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
      

      
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return data.role || data;
    } catch (error) {
      console.error('Error deactivating role:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Permissions thunks
export const fetchPermissions = createAsyncThunk(
  'role/fetchPermissions',
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const { page = 1, search = '' } = params;
      const qp = new URLSearchParams({ page: String(page) });
      if (search && String(search).trim().length > 0) qp.set('search', String(search).trim());
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.PERMISSIONS)}?${qp.toString()}`;
      const response = await fetch(url, { method: 'GET', headers: getAuthHeaders(token) });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      const permissions = data.permissions || data.data || [];
      const pagination = data.pagination || data.meta || { current_page: page, last_page: 1, per_page: 10, total: permissions.length };
      return { permissions, pagination };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRolePermissions = createAsyncThunk(
  'role/fetchRolePermissions',
  async (roleId, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.ROLES)}/${roleId}/permissions`;
      const response = await fetch(url, { method: 'GET', headers: getAuthHeaders(token) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      const permissions = data.permissions || data.data || data || [];
      return { roleId, permissions };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const syncRolePermissions = createAsyncThunk(
  'role/syncRolePermissions',
  async ({ roleId, permissionIds }, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.ROLES)}/${roleId}/permissions`;
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ permission_ids: permissionIds })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      // backend returns role with permissions
      return data.data || data.role || data;
    } catch (error) {
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
  permissions: [],
  permissionsPagination: { current_page: 1, last_page: 1, per_page: 10, total: 0 },
  // Cache of assigned permissions per role id
  rolePermissionsById: {},
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
      })
      
      // Fetch Permissions
      .addCase(fetchPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = Array.isArray(action.payload.permissions) ? action.payload.permissions : [];
        state.permissionsPagination = action.payload.pagination;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch assigned permissions for a role
      .addCase(fetchRolePermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRolePermissions.fulfilled, (state, action) => {
        state.loading = false;
        const { roleId, permissions } = action.payload;
        state.rolePermissionsById[roleId] = Array.isArray(permissions) ? permissions : [];
      })
      .addCase(fetchRolePermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Sync Role Permissions
      .addCase(syncRolePermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncRolePermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Permissions updated successfully!';
        const updatedRole = action.payload;
        const index = state.roles.findIndex(r => r.id === updatedRole.id);
        if (index !== -1) state.roles[index] = updatedRole;
        if (state.currentRole && state.currentRole.id === updatedRole.id) state.currentRole = updatedRole;
      })
      .addCase(syncRolePermissions.rejected, (state, action) => {
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
