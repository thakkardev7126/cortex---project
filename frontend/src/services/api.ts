import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // Proxy handles this in vite config
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 (Refresh token flow would go here)
        return Promise.reject(error);
    }
);

export default api;
