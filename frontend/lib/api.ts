import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('medibank_token');
      localStorage.removeItem('medibank_user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(err);
  }
);

export default api;
