import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
  }>;
  modals: {
    login: boolean;
    register: boolean;
    createPost: boolean;
    editPost: boolean;
    deleteConfirm: boolean;
  };
  loading: {
    global: boolean;
    posts: boolean;
    heroes: boolean;
    auth: boolean;
  };
}

const initialState: UIState = {
  sidebarOpen: false,
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  notifications: [],
  modals: {
    login: false,
    register: false,
    createPost: false,
    editPost: false,
    deleteConfirm: false,
  },
  loading: {
    global: false,
    posts: false,
    heroes: false,
    auth: false,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    addNotification: (state, action: PayloadAction<{
      type: 'success' | 'error' | 'warning' | 'info';
      message: string;
      duration?: number;
    }>) => {
      const notification = {
        id: Date.now().toString(),
        ...action.payload,
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    openModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key as keyof UIState['modals']] = false;
      });
    },
    setLoading: (state, action: PayloadAction<{
      key: keyof UIState['loading'];
      value: boolean;
    }>) => {
      state.loading[action.payload.key] = action.payload.value;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  closeAllModals,
  setLoading,
} = uiSlice.actions;

export default uiSlice.reducer;