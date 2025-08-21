import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApiUrl, getAuthHeaders } from '../../config/api';

const getToken = (getState) => getState()?.auth?.token || localStorage.getItem('auth_token') || null;

export const fetchVillageDescriptions = createAsyncThunk(
  'villageDescriptions/fetch',
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const { 
        page = 1, 
        search = '', 
        sort_by = 'created_at', 
        sort_order = 'desc', 
        per_page = 10,
        loksabha_id = '',
        vidhansabha_id = '',
        block_id = '',
        panchayat_id = '',
        village_id = ''
      } = params;
      
      const qp = new URLSearchParams({ 
        page: String(page), 
        sort_by, 
        sort_order, 
        per_page: String(per_page) 
      });
      
      if (search && String(search).trim()) qp.set('search', String(search).trim());
      if (loksabha_id) qp.set('loksabha_id', String(loksabha_id));
      if (vidhansabha_id) qp.set('vidhansabha_id', String(vidhansabha_id));
      if (block_id) qp.set('block_id', String(block_id));
      if (panchayat_id) qp.set('panchayat_id', String(panchayat_id));
      if (village_id) qp.set('village_id', String(village_id));
      
      const url = `${getApiUrl('/api/village-descriptions')}?${qp.toString()}`;
      const res = await fetch(url, { headers: getAuthHeaders(token) });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      const items = data.village_descriptions || data.data || [];
      const pagination = data.pagination || data.meta || { 
        current_page: page, 
        last_page: 1, 
        per_page: 10, 
        total: items.length, 
        from: 1, 
        to: items.length 
      };
      
      return { items, pagination };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const createVillageDescription = createAsyncThunk(
  'villageDescriptions/create',
  async (payload, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const res = await fetch(getApiUrl('/api/village-descriptions'), { 
        method: 'POST', 
        headers: getAuthHeaders(token), 
        body: JSON.stringify(payload) 
      });
      
      if (!res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) { 
          const j = await res.json(); 
          throw new Error(j.message || 'Create failed'); 
        }
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      return data.data || data;
    } catch (e) { 
      return rejectWithValue(e.message); 
    }
  }
);

export const updateVillageDescription = createAsyncThunk(
  'villageDescriptions/update',
  async ({ id, payload }, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const res = await fetch(`${getApiUrl('/api/village-descriptions')}/${id}`, { 
        method: 'PUT', 
        headers: getAuthHeaders(token), 
        body: JSON.stringify(payload) 
      });
      
      if (!res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) { 
          const j = await res.json(); 
          throw new Error(j.message || 'Update failed'); 
        }
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      return data.data || data;
    } catch (e) { 
      return rejectWithValue(e.message); 
    }
  }
);

export const deleteVillageDescription = createAsyncThunk(
  'villageDescriptions/delete',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const res = await fetch(`${getApiUrl('/api/village-descriptions')}/${id}`, { 
        method: 'DELETE', 
        headers: getAuthHeaders(token) 
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      return id;
    } catch (e) { 
      return rejectWithValue(e.message); 
    }
  }
);

const slice = createSlice({
  name: 'villageDescriptions',
  initialState: { 
    items: [], 
    pagination: { current_page: 1, last_page: 1, per_page: 10, total: 0 }, 
    loading: false, 
    error: null, 
    success: null 
  },
  reducers: {
    clearVillageDescError: (s) => { s.error = null; },
    clearVillageDescSuccess: (s) => { s.success = null; },
    setVillageDescPage: (s, a) => { s.pagination.current_page = a.payload || 1; },
  },
  extraReducers: (b) => {
    b
      .addCase(fetchVillageDescriptions.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchVillageDescriptions.fulfilled, (s, a) => { 
        s.loading = false; 
        s.items = a.payload.items; 
        s.pagination = a.payload.pagination; 
      })
      .addCase(fetchVillageDescriptions.rejected, (s, a) => { 
        s.loading = false; 
        s.error = a.payload || 'Failed to fetch village descriptions'; 
      })
      .addCase(createVillageDescription.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(createVillageDescription.fulfilled, (s, a) => { 
        s.loading = false; 
        s.success = 'Village description created successfully'; 
        s.items.unshift(a.payload); 
        s.pagination.total += 1; 
      })
      .addCase(createVillageDescription.rejected, (s, a) => { 
        s.loading = false; 
        s.error = a.payload || 'Failed to create village description'; 
      })
      .addCase(updateVillageDescription.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(updateVillageDescription.fulfilled, (s, a) => { 
        s.loading = false; 
        s.success = 'Village description updated successfully'; 
        s.items = s.items.map(i => i.id === a.payload.id ? a.payload : i); 
      })
      .addCase(updateVillageDescription.rejected, (s, a) => { 
        s.loading = false; 
        s.error = a.payload || 'Failed to update village description'; 
      })
      .addCase(deleteVillageDescription.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(deleteVillageDescription.fulfilled, (s, a) => { 
        s.loading = false; 
        s.success = 'Village description deleted successfully'; 
        s.items = s.items.filter(i => i.id !== a.payload); 
        s.pagination.total = Math.max(0, s.pagination.total - 1); 
      })
      .addCase(deleteVillageDescription.rejected, (s, a) => { 
        s.loading = false; 
        s.error = a.payload || 'Failed to delete village description'; 
      });
  }
});

export const { clearVillageDescError, clearVillageDescSuccess, setVillageDescPage } = slice.actions;
export default slice.reducer;
