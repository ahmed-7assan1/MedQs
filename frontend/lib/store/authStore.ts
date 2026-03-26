import { create } from 'zustand';
import api from '../api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
  academicYear?: any;
  progress?: any;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  loading: boolean;
  init: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  loading: true,

  init: () => {
    if (typeof window === 'undefined') return set({ loading: false });
    const token = localStorage.getItem('medibank_token');
    const userStr = localStorage.getItem('medibank_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        set({ user, token, loading: false });
      } catch {
        localStorage.removeItem('medibank_token');
        localStorage.removeItem('medibank_user');
        set({ loading: false });
      }
    } else {
      set({ loading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('medibank_token', data.token);
    localStorage.setItem('medibank_user', JSON.stringify(data));
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    set({ user: data, token: data.token });
  },

  register: async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    localStorage.setItem('medibank_token', data.token);
    localStorage.setItem('medibank_user', JSON.stringify(data));
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    set({ user: data, token: data.token });
  },

  logout: () => {
    localStorage.removeItem('medibank_token');
    localStorage.removeItem('medibank_user');
    delete api.defaults.headers.common['Authorization'];
    set({ user: null, token: null });
  },

  updateUser: (user) => {
    localStorage.setItem('medibank_user', JSON.stringify(user));
    set({ user });
  },
}));
