import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { 
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  closeAllModals,
  setLoading
} from '../store/slices/uiSlice';
import { useCallback } from 'react';

export const useUI = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    sidebarOpen, 
    theme, 
    notifications, 
    modals, 
    loading 
  } = useSelector((state: RootState) => state.ui);

  const handleToggleSidebar = useCallback(() => {
    dispatch(toggleSidebar());
  }, [dispatch]);

  const handleSetSidebarOpen = useCallback((open: boolean) => {
    dispatch(setSidebarOpen(open));
  }, [dispatch]);

  const handleSetTheme = useCallback((newTheme: 'light' | 'dark') => {
    dispatch(setTheme(newTheme));
  }, [dispatch]);

  const handleAddNotification = useCallback((notification: {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
  }) => {
    dispatch(addNotification(notification));
  }, [dispatch]);

  const handleRemoveNotification = useCallback((id: string) => {
    dispatch(removeNotification(id));
  }, [dispatch]);

  const handleClearNotifications = useCallback(() => {
    dispatch(clearNotifications());
  }, [dispatch]);

  const handleOpenModal = useCallback((modal: keyof typeof modals) => {
    dispatch(openModal(modal));
  }, [dispatch]);

  const handleCloseModal = useCallback((modal: keyof typeof modals) => {
    dispatch(closeModal(modal));
  }, [dispatch]);

  const handleCloseAllModals = useCallback(() => {
    dispatch(closeAllModals());
  }, [dispatch]);

  const handleSetLoading = useCallback((key: keyof typeof loading, value: boolean) => {
    dispatch(setLoading({ key, value }));
  }, [dispatch]);

  return {
    sidebarOpen,
    theme,
    notifications,
    modals,
    loading,
    toggleSidebar: handleToggleSidebar,
    setSidebarOpen: handleSetSidebarOpen,
    setTheme: handleSetTheme,
    addNotification: handleAddNotification,
    removeNotification: handleRemoveNotification,
    clearNotifications: handleClearNotifications,
    openModal: handleOpenModal,
    closeModal: handleCloseModal,
    closeAllModals: handleCloseAllModals,
    setLoading: handleSetLoading,
  };
};