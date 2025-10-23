import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import postsSlice from './slices/postsSlice';
import heroesSlice from './slices/heroesSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    posts: postsSlice,
    heroes: heroesSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;