import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';
import dataReducer from './slices/dataSlice';
import casteReducer from './slices/casteSlice';
import lokSabhaReducer from './slices/lokSabhaSlice';
import vidhanSabhaReducer from './slices/vidhanSabhaSlice';
import blockReducer from './slices/blockSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    data: dataReducer,
    caste: casteReducer,
    lokSabha: lokSabhaReducer,
    vidhanSabha: vidhanSabhaReducer,
    block: blockReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});
