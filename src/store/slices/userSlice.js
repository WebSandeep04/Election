import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApiUrl, getAuthHeaders, API_CONFIG } from '../../config/api';

// Helper function to get token from state
const getToken = (getState) => {
  const { auth } = getState();
  return auth.token;
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const { page = 1, search = '', is_active = undefined, role_id = undefined, sort_by = 'created_at', sort_order = 'desc' } = params;
      
      const queryParamsObj = {
        page: page.toString(),
        per_page: '10',
        sort_by,
        sort_order,
      };
      if (search && String(search).trim().length > 0) queryParamsObj.search = String(search).trim();
      const isActiveDefined = (
        is_active === '1' || is_active === '0' || is_active === 1 || is_active === 0 || typeof is_active === 'boolean'
      );
      if (isActiveDefined) {
        queryParamsObj.is_active = (is_active === '1' || is_active === 1 || is_active === true) ? '1' : '0';
      }
      if (role_id !== undefined && role_id !== null && String(role_id).trim() !== '') queryParamsObj.role_id = String(role_id);

      const queryParams = new URLSearchParams(queryParamsObj);
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.USERS)}?${queryParams}`;

      const response = await fetch(url, { method: 'GET', headers: getAuthHeaders(token) });
      let data;
      try {
        data = await response.json();
      } catch (_) {
        data = null;
      }
      if (!response.ok) {
        const message = (data && (data.message || data.error)) || `HTTP error! status: ${response.status}`;
        throw new Error(message);
      }

      // Defensive extraction for various API shapes
      // Candidates: { data: [...] }, { data: { data: [...], meta: {...} } }, { users: [...] }, [...]
      const top = data || {};
      const inner = top.data && typeof top.data === 'object' && !Array.isArray(top.data) ? top.data : null;

      const usersArray = Array.isArray(top.data)
        ? top.data
        : Array.isArray(top.users)
          ? top.users
          : Array.isArray(top)
            ? top
            : Array.isArray(inner?.data)
              ? inner.data
              : [];

      const meta = top.meta || inner?.meta || top.pagination || inner?.pagination || {};

      return {
        users: usersArray,
        pagination: {
          current_page: Number(meta.current_page) || Number(queryParamsObj.page) || 1,
          last_page: Number(meta.last_page) || 1,
          per_page: Number(meta.per_page) || Number(queryParamsObj.per_page) || 10,
          total: Number(meta.total) || usersArray.length,
          from: Number(meta.from) || (usersArray.length > 0 ? 1 : 0),
          to: Number(meta.to) || usersArray.length,
        },
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'user/fetchUserById',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.USERS)}/${id}`;
      
      
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();


      // Extract user from the response
      return data.data || data;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const createUser = createAsyncThunk(
  'user/createUser',
  async (userData, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = getApiUrl(API_CONFIG.ENDPOINTS.USERS);
      
      
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(userData),
      });

      const data = await response.json();


      if (!response.ok) {
        throw new Error(data.message || 'Failed to create user');
      }

      // Extract user from the response
      return data.data || data;
    } catch (error) {
      console.error('Error creating user:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ id, userData }, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.USERS)}/${id}`;
      
      
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(userData),
      });

      const data = await response.json();


      if (!response.ok) {
        throw new Error(data.message || 'Failed to update user');
      }

      // Extract user from the response
      return data.data || data;
    } catch (error) {
      console.error('Error updating user:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.USERS)}/${id}`;
      
      
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete user');
      }

      return { id };
    } catch (error) {
      console.error('Error deleting user:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const activateUser = createAsyncThunk(
  'user/activateUser',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.USERS)}/${id}/activate`;
      

      
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(token),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to activate user');
      }

      return data.data || data;
    } catch (error) {
      console.error('Error activating user:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const deactivateUser = createAsyncThunk(
  'user/deactivateUser',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.USERS)}/${id}/deactivate`;
      

      
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(token),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to deactivate user');
      }

      return data.data || data;
    } catch (error) {
      console.error('Error deactivating user:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const assignRoleToUser = createAsyncThunk(
  'user/assignRoleToUser',
  async ({ userId, roleId }, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.USERS)}/${userId}/roles`;
      

      
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ role_id: roleId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to assign role to user');
      }

      return data.data || data;
    } catch (error) {
      console.error('Error assigning role to user:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const removeRoleFromUser = createAsyncThunk(
  'user/removeRoleFromUser',
  async ({ userId, roleId }, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.USERS)}/${userId}/roles/${roleId}`;
      

      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove role from user');
      }

      return data.data || data;
    } catch (error) {
      console.error('Error removing role from user:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  users: [],
  currentUser: null,
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
const userSlice = createSlice({
  name: 'user',
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
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
    resetUserState: (state) => {
      state.users = [];
      state.currentUser = null;
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
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = Array.isArray(action.payload.users) ? action.payload.users : [];
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch User by ID
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create User
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'User created successfully!';
        // Add the new user to the list
        state.users.unshift(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update User
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'User updated successfully!';
        // Update the user in the list
        const index = state.users.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'User deleted successfully!';
        // Remove the user from the list
        state.users = state.users.filter(item => item.id !== action.payload.id);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Activate User
      .addCase(activateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(activateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'User activated successfully!';
        // Update the user in the list
        const index = state.users.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(activateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Deactivate User
      .addCase(deactivateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deactivateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'User deactivated successfully!';
        // Update the user in the list
        const index = state.users.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(deactivateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Assign Role to User
      .addCase(assignRoleToUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignRoleToUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Role assigned to user successfully!';
        // Update the user in the list
        const index = state.users.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(assignRoleToUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Remove Role from User
      .addCase(removeRoleFromUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeRoleFromUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Role removed from user successfully!';
        // Update the user in the list
        const index = state.users.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(removeRoleFromUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearSuccess, 
  setCurrentPage, 
  setCurrentUser,
  clearCurrentUser,
  resetUserState 
} = userSlice.actions;

export default userSlice.reducer;
