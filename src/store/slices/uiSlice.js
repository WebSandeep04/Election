import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarCollapsed: false,
  activeScreen: 'dashboard',
  expandedCategories: ['dashboard'],
  theme: 'light',
  notifications: [],
  loading: false,
  navigationParams: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    setActiveScreen: (state, action) => {
      state.activeScreen = action.payload;
    },
    setActiveScreenWithParams: (state, action) => {
      state.activeScreen = action.payload.screen;
      state.navigationParams = action.payload.params;
    },
    toggleCategory: (state, action) => {
      const categoryId = action.payload;
      if (state.expandedCategories.includes(categoryId)) {
        state.expandedCategories = state.expandedCategories.filter(id => id !== categoryId);
      } else {
        state.expandedCategories.push(categoryId);
      }
    },
    setExpandedCategories: (state, action) => {
      state.expandedCategories = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload,
        timestamp: new Date().toISOString(),
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  setActiveScreen,
  setActiveScreenWithParams,
  toggleCategory,
  setExpandedCategories,
  setTheme,
  addNotification,
  removeNotification,
  clearNotifications,
  setLoading,
} = uiSlice.actions;

export default uiSlice.reducer;
