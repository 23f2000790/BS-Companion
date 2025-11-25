import axios from 'axios';

const api = axios.create({
  // This automatically switches between localhost (dev) and Render (prod)
  baseURL: import.meta.env.VITE_API_URL, 
});

// --- INTERCEPTOR: Auto-attach Token ---
// This code runs before every request. It checks if you have a token 
// and adds the "Authorization" header automatically.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Or wherever you store it
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;