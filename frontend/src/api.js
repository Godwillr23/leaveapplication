import axios from 'axios';
import { invokeLogout } from './auth';

const API = axios.create({ baseURL: 'http://localhost:4000/api' });

// attach token from localStorage automatically
API.interceptors.request.use((config) => {
  try {
    const user = JSON.parse(localStorage.getItem('la_user'));
    if (user?.token) config.headers = { ...(config.headers || {}), Authorization: `Bearer ${user.token}` };
  } catch (e) {
    // ignore
  }
  return config;
});

// global 401 handler: invoke centralized logout handler (registered by App)
API.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error?.response?.status === 401) {
      try { localStorage.removeItem('la_user'); } catch (e) {}
      try { invokeLogout(); } catch (e) { /* noop */ }
    }
    return Promise.reject(error);
  }
);

export function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

export default API;
