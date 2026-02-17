import axios from 'axios';

const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    'https://cortex-backend-fyud.onrender.com/api';

const api = axios.create({
    baseURL: API_BASE_URL,
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
    (error) => {
        console.error('API ERROR:', error?.response || error);
        return Promise.reject(error);
    }
);

export default api;
