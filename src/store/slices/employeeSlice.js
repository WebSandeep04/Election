import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApiUrl, getAuthHeaders } from '../../config/api';

// Fetch all employees with search, filtering, and pagination
export const fetchEmployees = createAsyncThunk(
  'employees/fetchAll',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const {
        search = '',
        status = '',
        employee_type_id = '',
        sort_by = 'created_at',
        sort_order = 'desc',
        page = 1
      } = params;

      const queryParams = new URLSearchParams({
        page,
        sort_by,
        sort_order,
        ...(search && { search }),
        ...(status && { status }),
        ...(employee_type_id && { employee_type_id })
      });

      const response = await fetch(getApiUrl(`/api/employees?${queryParams}`), {
        method: 'GET',
        headers: getAuthHeaders(auth.token),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        return rejectWithValue('Invalid JSON response from server');
      }

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch employees');
      }

      return {
        employees: data.data || [],
        pagination: data.meta || {
          current_page: page,
          last_page: 1,
          per_page: 10,
          total: 0
        }
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Get document download URL
export const getEmployeeDocumentDownload = createAsyncThunk(
  'employees/getDocumentDownload',
  async (documentId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(getApiUrl(`/api/employee-documents/${documentId}/download`), {
        method: 'GET',
        headers: getAuthHeaders(auth.token),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        return rejectWithValue('Invalid JSON response from server');
      }

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to get document URL');
      }

      return { id: documentId, ...data };
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Fetch employee by ID
export const fetchEmployeeById = createAsyncThunk(
  'employees/fetchById',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(getApiUrl(`/api/employees/${id}`), {
        method: 'GET',
        headers: getAuthHeaders(auth.token),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        return rejectWithValue('Invalid JSON response from server');
      }

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch employee');
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Create employee
export const createEmployee = createAsyncThunk(
  'employees/create',
  async (employeeData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      // Employee API expects JSON body
      const headers = getAuthHeaders(auth.token);
      const body = JSON.stringify(employeeData);

      const response = await fetch(getApiUrl('/api/employees'), {
        method: 'POST',
        headers,
        body,
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        return rejectWithValue('Invalid JSON response from server');
      }

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to create employee');
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Update employee
export const updateEmployee = createAsyncThunk(
  'employees/update',
  async ({ id, employeeData }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      // Employee API expects JSON body
      const headers = getAuthHeaders(auth.token);
      const body = JSON.stringify(employeeData);

      const response = await fetch(getApiUrl(`/api/employees/${id}`), {
        method: 'PUT',
        headers,
        body,
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        return rejectWithValue('Invalid JSON response from server');
      }

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to update employee');
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Upload employee document
export const uploadEmployeeDocument = createAsyncThunk(
  'employees/uploadDocument',
  async ({ employeeId, file, documentType, documentName, description, expiryDate }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      const formData = new FormData();
      formData.append('employee_id', employeeId);
      formData.append('document_type', documentType);
      formData.append('document_name', documentName || documentType);
      formData.append('file', file);
      if (description) formData.append('description', description);
      if (expiryDate) formData.append('expiry_date', expiryDate);

      const response = await fetch(getApiUrl('/api/employee-documents'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        body: formData,
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        return rejectWithValue('Invalid JSON response from server');
      }

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to upload document');
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Delete employee
export const deleteEmployee = createAsyncThunk(
  'employees/delete',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(getApiUrl(`/api/employees/${id}`), {
        method: 'DELETE',
        headers: getAuthHeaders(auth.token),
      });

      if (!response.ok) {
        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          return rejectWithValue('Invalid JSON response from server');
        }
        return rejectWithValue(data.message || 'Failed to delete employee');
      }

      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Fetch active employees
export const fetchActiveEmployees = createAsyncThunk(
  'employees/fetchActive',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(getApiUrl('/api/employees/active'), {
        method: 'GET',
        headers: getAuthHeaders(auth.token),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        return rejectWithValue('Invalid JSON response from server');
      }

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch active employees');
      }

      return data.data || [];
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Fetch employees by type
export const fetchEmployeesByType = createAsyncThunk(
  'employees/fetchByType',
  async (employeeTypeId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(getApiUrl(`/api/employees/type/${employeeTypeId}`), {
        method: 'GET',
        headers: getAuthHeaders(auth.token),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        return rejectWithValue('Invalid JSON response from server');
      }

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch employees by type');
      }

      return data.data || [];
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const initialState = {
  employees: [],
  currentEmployee: null,
  loading: false,
  error: null,
  success: null,
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  },
  filters: {
    search: '',
    status: '',
    employee_type_id: '',
    sort_by: 'created_at',
    sort_order: 'desc'
  }
};

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    setCurrentEmployee: (state, action) => {
      state.currentEmployee = action.payload;
    },
    clearCurrentEmployee: (state) => {
      state.currentEmployee = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        status: '',
        employee_type_id: '',
        sort_by: 'created_at',
        sort_order: 'desc'
      };
    },
    setCurrentPage: (state, action) => {
      state.pagination.current_page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch employees
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload.employees;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch employee by ID
      .addCase(fetchEmployeeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEmployee = action.payload;
        state.error = null;
      })
      .addCase(fetchEmployeeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create employee
      .addCase(createEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employees.unshift(action.payload);
        state.success = 'Employee created successfully';
        state.error = null;
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update employee
      .addCase(updateEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.employees.findIndex(emp => emp.id === action.payload.id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
        if (state.currentEmployee && state.currentEmployee.id === action.payload.id) {
          state.currentEmployee = action.payload;
        }
        state.success = 'Employee updated successfully';
        state.error = null;
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Upload document (do not toggle global loading to avoid blocking UI)
      .addCase(uploadEmployeeDocument.pending, (state) => {
        // no-op
      })
      .addCase(uploadEmployeeDocument.fulfilled, (state, action) => {
        // Attach to currentEmployee if open
        if (state.currentEmployee && state.currentEmployee.id === action.payload.employee_id) {
          const docs = Array.isArray(state.currentEmployee.documents) ? state.currentEmployee.documents : [];
          state.currentEmployee.documents = [action.payload, ...docs];
        }
      })
      .addCase(uploadEmployeeDocument.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Get document download url (no state changes needed)
      .addCase(getEmployeeDocumentDownload.pending, (state) => {
        // no-op
      })
      .addCase(getEmployeeDocumentDownload.fulfilled, (state, action) => {
        // no-op
      })
      .addCase(getEmployeeDocumentDownload.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Delete employee
      .addCase(deleteEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = state.employees.filter(emp => emp.id !== action.payload);
        if (state.currentEmployee && state.currentEmployee.id === action.payload) {
          state.currentEmployee = null;
        }
        state.success = 'Employee deleted successfully';
        state.error = null;
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch active employees
      .addCase(fetchActiveEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
        state.error = null;
      })
      .addCase(fetchActiveEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch employees by type
      .addCase(fetchEmployeesByType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeesByType.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
        state.error = null;
      })
      .addCase(fetchEmployeesByType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  setCurrentEmployee,
  clearCurrentEmployee,
  setFilters,
  clearFilters,
  setCurrentPage,
} = employeeSlice.actions;

export default employeeSlice.reducer;
