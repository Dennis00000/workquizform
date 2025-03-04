import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../lib/supabase';
import { handleSupabaseError } from '../utils/errorHandler';

// Initial state
const initialState = {
  templates: [],
  currentTemplate: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
  filters: {
    search: '',
    category: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
  },
};

// Async thunks
export const fetchTemplates = createAsyncThunk(
  'templates/fetchTemplates',
  async ({ page = 1, limit = 10, search = '', category = '', sortBy = 'created_at', sortOrder = 'desc' }, { rejectWithValue }) => {
    try {
      // Calculate the range for pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      // Start building the query
      let query = supabase
        .from('templates')
        .select('*, profiles(name)', { count: 'exact' });
      
      // Apply filters if provided
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }
      
      if (category) {
        query = query.eq('category', category);
      }
      
      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      
      // Apply pagination
      query = query.range(from, to);
      
      // Execute the query
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      return { 
        templates: data, 
        pagination: {
          page,
          limit,
          total: count || 0,
        },
        filters: {
          search,
          category,
          sortBy,
          sortOrder,
        }
      };
    } catch (error) {
      return rejectWithValue(handleSupabaseError(error, 'Failed to fetch templates', true));
    }
  }
);

export const fetchTemplateById = createAsyncThunk(
  'templates/fetchTemplateById',
  async (id, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*, profiles(name)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      return rejectWithValue(handleSupabaseError(error, 'Failed to fetch template', true));
    }
  }
);

export const createTemplate = createAsyncThunk(
  'templates/createTemplate',
  async (templateData, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .insert([templateData])
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      return rejectWithValue(handleSupabaseError(error, 'Failed to create template', true));
    }
  }
);

export const updateTemplate = createAsyncThunk(
  'templates/updateTemplate',
  async ({ id, templateData }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .update(templateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      return rejectWithValue(handleSupabaseError(error, 'Failed to update template', true));
    }
  }
);

export const deleteTemplate = createAsyncThunk(
  'templates/deleteTemplate',
  async (id, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return id;
    } catch (error) {
      return rejectWithValue(handleSupabaseError(error, 'Failed to delete template', true));
    }
  }
);

// Template slice
const templateSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    setCurrentTemplate: (state, action) => {
      state.currentTemplate = action.payload;
    },
    clearCurrentTemplate: (state) => {
      state.currentTemplate = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Templates
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.templates = action.payload.templates;
        state.pagination = action.payload.pagination;
        state.filters = action.payload.filters;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch templates';
      });
    
    // Fetch Template By Id
    builder
      .addCase(fetchTemplateById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTemplateById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTemplate = action.payload;
      })
      .addCase(fetchTemplateById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch template';
      });
    
    // Create Template
    builder
      .addCase(createTemplate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.templates.unshift(action.payload);
        state.currentTemplate = action.payload;
      })
      .addCase(createTemplate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create template';
      });
    
    // Update Template
    builder
      .addCase(updateTemplate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.templates.findIndex(template => template.id === action.payload.id);
        if (index !== -1) {
          state.templates[index] = action.payload;
        }
        state.currentTemplate = action.payload;
      })
      .addCase(updateTemplate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update template';
      });
    
    // Delete Template
    builder
      .addCase(deleteTemplate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.templates = state.templates.filter(template => template.id !== action.payload);
        if (state.currentTemplate && state.currentTemplate.id === action.payload) {
          state.currentTemplate = null;
        }
      })
      .addCase(deleteTemplate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete template';
      });
  },
});

// Export actions and reducer
export const {
  setCurrentTemplate,
  clearCurrentTemplate,
  setFilters,
  resetFilters,
  clearError,
} = templateSlice.actions;

export default templateSlice.reducer; 