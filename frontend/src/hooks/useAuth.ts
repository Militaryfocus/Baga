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

  const handleRegister = useCallback(
    (userData: { email: string; username: string; password: string }) => {
      return dispatch(register(userData));
    },
    [dispatch]
  );

  const handleLogout = useCallback(() => {
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