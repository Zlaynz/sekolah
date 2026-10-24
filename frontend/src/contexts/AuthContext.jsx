import { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { ROLES } from '../utils/constants';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const getDashboardPath = useCallback((role) => {
    switch (role) {
      case ROLES.ADMIN:
        return '/admin/dashboard';
      case ROLES.GURU:
        return '/teacher/dashboard';
      case ROLES.WALIKELAS:
        return '/homeroom/recap';
      case ROLES.WAKASEK:
        return '/principal/dashboard';
      case ROLES.KEPSEK:
        return '/principal/dashboard';
      case ROLES.SISWA:
        return '/student/grades';
      default:
        return '/login';
    }
  }, []);

  const login = useCallback(async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const newToken = response.data.token;
      const userData = response.data.user || {
        id: response.data.userId,
        username: response.data.username,
        role: response.data.role,
        name: response.data.displayName,
        teacherId: response.data.teacherId,
        studentId: response.data.studentId,
        classId: response.data.classId,
        photoPath: response.data.photoPath,
      };

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);

      toast.success(`Selamat datang, ${userData.name || userData.username}!`);

      const dashPath = getDashboardPath(userData.role);
      navigate(dashPath);

      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Login gagal. Periksa username dan password.';
      toast.error(message);
      return { success: false, message };
    }
  }, [navigate, getDashboardPath]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/login');
    toast.success('Berhasil logout.');
  }, [navigate]);

  const updatePhoto = useCallback((newPhotoPath) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, photoPath: newPhotoPath };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const hasRole = useCallback(
    (roles) => {
      if (!user) return false;
      if (typeof roles === 'string') return user.role === roles;
      return roles.includes(user.role);
    },
    [user]
  );

  const isAuthenticated = !!token && !!user;

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    hasRole,
    getDashboardPath,
    updatePhoto,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
