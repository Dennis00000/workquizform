import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../lib/supabase';
import { handleSupabaseError } from '../utils/errorHandler';

// Initial state
const initialState = {
  submissions: [],
  currentSubmission: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
  filters: {
    search: '',
    templateId: '',
    status: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
  },
};

// Async thunks
export const fetchSubmissions = createAsyncThunk(
  'submissions/fetchSubmissions',
  async ({ page = 1, limit = 10, search = '', templateId = '', status = '', sortBy = 'created_at', sortOrder = 'desc' }, { rejectWithValue }) => {
    try {
      // Calculate the range for pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      // Start building the query
      let query = supabase
        .from('submissions')
        .select('*, templates(title)', { count: 'exact' });
      
      // Apply filters if provided
      if (search) {
        query = query.or(`submitter_name.ilike.%${search}%,submitter_email.ilike.%${search}%`);
      }
      
      if (templateId) {
        query = query.eq('template_id', templateId);
      }
      
      if (status) {
        query = query.eq('status', status);
      }
      
      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      
      // Apply pagination
      query = query.range(from, to);
      
      // Execute the query
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      return { 
        submissions: data, 
        pagination: {
          page,
          limit,
          total: count || 0,
        },
        filters: {
          search,
          templateId,
          status,
          sortBy,
          sortOrder,
        }
      };
    } catch (error) {
      return rejectWithValue(handleSupabaseError(error, 'Failed to fetch submissions', true));
    }
  }
);

export const fetchSubmissionById = createAsyncThunk(
  'submissions/fetchSubmissionById',
  async (id, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*, templates(*)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      return rejectWithValue(handleSupabaseError(error, 'Failed to fetch submission', true));
    }
  }
);

export const createSubmission = createAsyncThunk(
  'submissions/createSubmission',
  async (submissionData, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .insert([submissionData])
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      return rejectWithValue(handleSupabaseError(error, 'Failed to create submission', true));
    }
  }
);

export const updateSubmission = createAsyncThunk(
  'submissions/updateSubmission',
  async ({ id, submissionData }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .update(submissionData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      return rejectWithValue(handleSupabaseError(error, 'Failed to update submission', true));
    }
  }
);

export const deleteSubmission = createAsyncThunk(
  'submissions/deleteSubmission',
  async (id, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('submissions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return id;
    } catch (error) {
      return rejectWithValue(handleSupabaseError(error, 'Failed to delete submission', true));
    }
  }
);

// Submission slice
const submissionSlice = createSlice({
  name: 'submissions',
  initialState,
  reducers: {
    setCurrentSubmission: (state, action) => {
      state.currentSubmission = action.payload;
    },
    clearCurrentSubmission: (state) => {
      state.currentSubmission = null;
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
    // Fetch Submissions
    builder
      .addCase(fetchSubmissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubmissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.submissions = action.payload.submissions;
        state.pagination = action.payload.pagination;
        state.filters = action.payload.filters;
      })
      .addCase(fetchSubmissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch submissions';
      });
    
    // Fetch Submission By Id
    builder
      .addCase(fetchSubmissionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubmissionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSubmission = action.payload;
      })
      .addCase(fetchSubmissionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch submission';
      });
    
    // Create Submission
    builder
      .addCase(createSubmission.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSubmission.fulfilled, (state, action) => {
        state.isLoading = false;
        state.submissions.unshift(action.payload);
        state.currentSubmission = action.payload;
      })
      .addCase(createSubmission.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create submission';
      });
    
    // Update Submission
    builder
      .addCase(updateSubmission.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSubmission.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.submissions.findIndex(submission => submission.id === action.payload.id);
        if (index !== -1) {
          state.submissions[index] = action.payload;
        }
        state.currentSubmission = action.payload;
      })
      .addCase(updateSubmission.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update submission';
      });
    
    // Delete Submission
    builder
      .addCase(deleteSubmission.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSubmission.fulfilled, (state, action) => {
        state.isLoading = false;
        state.submissions = state.submissions.filter(submission => submission.id !== action.payload);
        if (state.currentSubmission && state.currentSubmission.id === action.payload) {
          state.currentSubmission = null;
        }
      })
      .addCase(deleteSubmission.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete submission';
      });
  },
});

// Export actions and reducer
export const {
  setCurrentSubmission,
  clearCurrentSubmission,
  setFilters,
  resetFilters,
  clearError,
} = submissionSlice.actions;

export default submissionSlice.reducer; 