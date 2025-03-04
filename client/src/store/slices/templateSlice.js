import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  templates: [],
  currentTemplate: null,
  loading: false,
  error: null
};

const templateSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    setTemplates: (state, action) => {
      state.templates = action.payload;
    },
    setCurrentTemplate: (state, action) => {
      state.currentTemplate = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const { setTemplates, setCurrentTemplate, setLoading, setError, clearError } = templateSlice.actions;
export default templateSlice.reducer; 