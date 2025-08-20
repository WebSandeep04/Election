import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';
import dataReducer from './slices/dataSlice';
import casteReducer from './slices/casteSlice';
import lokSabhaReducer from './slices/lokSabhaSlice';
import vidhanSabhaReducer from './slices/vidhanSabhaSlice';
import blockReducer from './slices/blockSlice';
import panchayatReducer from './slices/panchayatSlice';
import villageReducer from './slices/villageSlice'; // Added for Village
import boothReducer from './slices/boothSlice'; // Added for Booth
import formReducer from './slices/formSlice'; // Added for Forms
import employeeTypeReducer from './slices/employeeTypeSlice'; // Added for Employee Types
import employeeReducer from './slices/employeeSlice'; // Added for Employees
import roleReducer from './slices/roleSlice'; // Added for Roles
import userReducer from './slices/userSlice'; // Added for Users

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    data: dataReducer,
    caste: casteReducer,
    lokSabha: lokSabhaReducer,
    vidhanSabha: vidhanSabhaReducer,
    block: blockReducer,
    panchayat: panchayatReducer,
    village: villageReducer, // Added for Village
    booth: boothReducer, // Added for Booth
    forms: formReducer, // Added for Forms
    employeeTypes: employeeTypeReducer, // Added for Employee Types
    employees: employeeReducer, // Added for Employees
    roles: roleReducer, // Added for Roles
    users: userReducer, // Added for Users
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});
