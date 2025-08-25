import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';
import dataReducer from './slices/dataSlice';
import casteReducer from './slices/casteSlice';
import casteRatioReducer from './slices/casteRatioSlice';
import lokSabhaReducer from './slices/lokSabhaSlice';
import vidhanSabhaReducer from './slices/vidhanSabhaSlice';
import blockReducer from './slices/blockSlice';
import panchayatReducer from './slices/panchayatSlice';
import panchayatChoosingReducer from './slices/panchayatChoosingSlice'; // Added for Panchayat Choosing
import villageReducer from './slices/villageSlice'; // Added for Village
import villageChoosingReducer from './slices/villageChoosingSlice'; // Added for Village Choosing
import boothReducer from './slices/boothSlice'; // Added for Booth
import formReducer from './slices/formSlice'; // Added for Forms
import employeeTypeReducer from './slices/employeeTypeSlice'; // Added for Employee Types
import employeeReducer from './slices/employeeSlice'; // Added for Employees
import roleReducer from './slices/roleSlice'; // Added for Roles
import userReducer from './slices/userSlice'; // Added for Users
import permissionReducer from './slices/permissionSlice'; // Added for Permissions
import educationReducer from './slices/educationSlice'; // Added for Educations
import expenseCategoryReducer from './slices/expenseCategorySlice'; // Added for Expense Categories
import villageDescriptionReducer from './slices/villageDescriptionSlice'; // Added for Village Descriptions
import casteCategoryReducer from './slices/casteCategorySlice'; // Added for Caste Categories


export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    data: dataReducer,
    caste: casteReducer,
    casteRatio: casteRatioReducer,
    lokSabha: lokSabhaReducer,
    vidhanSabha: vidhanSabhaReducer,
    block: blockReducer,
    panchayat: panchayatReducer,
    panchayatChoosing: panchayatChoosingReducer, // Added for Panchayat Choosing
    village: villageReducer, // Added for Village
    villageChoosing: villageChoosingReducer, // Added for Village Choosing
    booth: boothReducer, // Added for Booth
    forms: formReducer, // Added for Forms
    employeeTypes: employeeTypeReducer, // Added for Employee Types
    employees: employeeReducer, // Added for Employees
    roles: roleReducer, // Added for Roles
    users: userReducer, // Added for Users
    permissions: permissionReducer, // Added for Permissions
    educations: educationReducer, // Added for Educations
    expenseCategories: expenseCategoryReducer, // Added for Expense Categories
    villageDescriptions: villageDescriptionReducer, // Added for Village Descriptions
    casteCategories: casteCategoryReducer, // Added for Caste Categories
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});
