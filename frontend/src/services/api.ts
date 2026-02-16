import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // ✅ Vite-safe
    withCredentials: false,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach token automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
);

export default api;
