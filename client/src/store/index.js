import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './slices/authSlice';
import templateReducer from './slices/templateSlice';
import uiReducer from './slices/uiSlice';
import userReducer from './slices/userSlice';
import submissionReducer from './submissionSlice';

// Configure the Redux store
const store = configureStore({
  reducer: {
    auth: authReducer,
    templates: templateReducer,
    ui: uiReducer,
    user: userReducer,
    submissions: submissionReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Enable refetchOnFocus/refetchOnReconnect behaviors
// See `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch);

export { store };
export default store; 