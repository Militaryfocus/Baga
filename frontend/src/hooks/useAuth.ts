import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { 
  login, 
  register, 
  logout, 
  getProfile, 
  updateProfile, 
  changePassword,
  clearError 
} from '../store/slices/authSlice';
import { useCallback } from 'react';
import { socketClient } from '../services/socket';
import { addNotification } from '../store/slices/uiSlice';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isAuthenticated, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const handleLogin = useCallback(
    (credentials: { email: string; password: string }) => {
      return dispatch(login(credentials));
    },
    [dispatch]
  );

  // Subscribe to socket after successful login
  // Note: This relies on auth slice to persist token to localStorage
  if (typeof window !== 'undefined') {
    const tok = localStorage.getItem('token');
    if (tok) {
      const socket = socketClient.connect(tok);
      socket.on('notification:new', (n) => {
        dispatch(addNotification(n));
      });
    }
  }

  const handleRegister = useCallback(
    (userData: { email: string; username: string; password: string }) => {
      return dispatch(register(userData));
    },
    [dispatch]
  );

  const handleLogout = useCallback(() => {
    socketClient.disconnect();
    return dispatch(logout());
  }, [dispatch]);

  const handleGetProfile = useCallback(() => {
    return dispatch(getProfile());
  }, [dispatch]);

  const handleUpdateProfile = useCallback(
    (data: { username?: string; avatar?: string }) => {
      return dispatch(updateProfile(data));
    },
    [dispatch]
  );

  const handleChangePassword = useCallback(
    (data: { currentPassword: string; newPassword: string }) => {
      return dispatch(changePassword(data));
    },
    [dispatch]
  );

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    getProfile: handleGetProfile,
    updateProfile: handleUpdateProfile,
    changePassword: handleChangePassword,
    clearError: handleClearError,
  };
};