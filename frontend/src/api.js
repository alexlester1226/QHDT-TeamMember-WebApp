import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('userInfo');
  if (raw) {
    try {
      const token = JSON.parse(raw)?.token;
      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
    } catch (e) {
      // ignore malformed userInfo
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('userInfo');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  },
);

export default api;
