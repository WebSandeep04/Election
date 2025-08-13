import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  employees: [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', department: 'IT' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active', department: 'HR' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Moderator', status: 'Inactive', department: 'Sales' },
  ],
  loading: false,
  error: null,
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    
    // Employee actions
    addEmployee: (state, action) => {
      state.employees.push({ ...action.payload, id: Date.now() });
    },
    updateEmployee: (state, action) => {
      const index = state.employees.findIndex(emp => emp.id === action.payload.id);
      if (index !== -1) {
        state.employees[index] = { ...state.employees[index], ...action.payload };
      }
    },
    deleteEmployee: (state, action) => {
      state.employees = state.employees.filter(emp => emp.id !== action.payload);
    },
    setEmployees: (state, action) => {
      state.employees = action.payload;
    },
    
    // Caste actions
    addCaste: (state, action) => {
      state.castes.push({ ...action.payload, id: Date.now() });
    },
    updateCaste: (state, action) => {
      const index = state.castes.findIndex(caste => caste.id === action.payload.id);
      if (index !== -1) {
        state.castes[index] = { ...state.castes[index], ...action.payload };
      }
    },
    deleteCaste: (state, action) => {
      state.castes = state.castes.filter(caste => caste.id !== action.payload);
    },
    setCastes: (state, action) => {
      state.castes = action.payload;
    },
    
    // Village actions
    addVillage: (state, action) => {
      state.villages.push({ ...action.payload, id: Date.now() });
    },
    updateVillage: (state, action) => {
      const index = state.villages.findIndex(village => village.id === action.payload.id);
      if (index !== -1) {
        state.villages[index] = { ...state.villages[index], ...action.payload };
      }
    },
    deleteVillage: (state, action) => {
      state.villages = state.villages.filter(village => village.id !== action.payload);
    },
    setVillages: (state, action) => {
      state.villages = action.payload;
    },
    
    // Form actions
    addForm: (state, action) => {
      state.forms.push({ ...action.payload, id: Date.now(), responses: 0, created: new Date().toISOString().split('T')[0] });
    },
    updateForm: (state, action) => {
      const index = state.forms.findIndex(form => form.id === action.payload.id);
      if (index !== -1) {
        state.forms[index] = { ...state.forms[index], ...action.payload };
      }
    },
    deleteForm: (state, action) => {
      state.forms = state.forms.filter(form => form.id !== action.payload);
    },
    setForms: (state, action) => {
      state.forms = action.payload;
    },
    
    // Team actions
    addTeam: (state, action) => {
      state.teams.push({ ...action.payload, id: Date.now() });
    },
    updateTeam: (state, action) => {
      const index = state.teams.findIndex(team => team.id === action.payload.id);
      if (index !== -1) {
        state.teams[index] = { ...state.teams[index], ...action.payload };
      }
    },
    deleteTeam: (state, action) => {
      state.teams = state.teams.filter(team => team.id !== action.payload);
    },
    setTeams: (state, action) => {
      state.teams = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  setEmployees,
  addCaste,
  updateCaste,
  deleteCaste,
  setCastes,
  addVillage,
  updateVillage,
  deleteVillage,
  setVillages,
  addForm,
  updateForm,
  deleteForm,
  setForms,
  addTeam,
  updateTeam,
  deleteTeam,
  setTeams,
} = dataSlice.actions;

export default dataSlice.reducer;
