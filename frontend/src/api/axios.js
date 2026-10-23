import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
      } else if (status === 403) {
        toast.error('Anda tidak memiliki akses ke halaman ini.');
      } else if (status === 422) {
        // Referential integrity or validation error - let caller handle
        const message = data?.message || 'Data tidak dapat diproses.';
        return Promise.reject({ ...error, userMessage: message });
      } else if (status === 404) {
        toast.error('Data tidak ditemukan.');
      } else if (status >= 500) {
        toast.error('Terjadi kesalahan pada server.');
      }
    } else if (error.request) {
      toast.error('Tidak dapat terhubung ke server.');
    }
    return Promise.reject(error);
  }
);

export default api;
