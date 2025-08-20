import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApiUrl, getAuthHeaders } from '../../config/api';

// Async thunk for login
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl('/api/login'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(credentials),
      });

      let data;
      try {
        data = await response.json();
      } catch (_) {
        data = null;
      }

      if (!response.ok) {
        // Prefer backend-provided message (e.g., 403 inactive user)
        const message = (data && (data.message || data.error)) ||
          (response.status === 403 ? 'Your account is inactive. Please contact the administrator.' : 'Login failed');
        return rejectWithValue(message);
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Initialize state from localStorage if available
const getInitialState = () => {
  const token = localStorage.getItem('auth_token');
  const user = localStorage.getItem('auth_user');
  
  return {
    user: user ? JSON.parse(user) : null,
    isAuthenticated: !!token,
    token: token,
    loginError: null,
    registerError: null,
    loading: false,
  };
};

const initialState = getInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    loginStart: (state) => {
      state.loading = true;
      state.loginError = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.loginError = null;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.loginError = action.payload;
    },
    registerStart: (state) => {
      state.loading = true;
      state.registerError = null;
    },
    registerSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.registerError = null;
    },
    registerFailure: (state, action) => {
      state.loading = false;
      state.registerError = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      state.loginError = null;
      state.registerError = null;
      // Clear token and user from localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    },
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    clearErrors: (state) => {
      state.loginError = null;
      state.registerError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.loginError = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.loginError = null;
        // Store token and user in localStorage for persistence
        localStorage.setItem('auth_token', action.payload.token);
        localStorage.setItem('auth_user', JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.loginError = action.payload;
      });
  },
});

export const {
  setUser,
  setAuthenticated,
  setToken,
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logout,
  updateProfile,
  clearErrors,
} = authSlice.actions;

export default authSlice.reducer;
