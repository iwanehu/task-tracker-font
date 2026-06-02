import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Interceptor de petición: Inyecta token SOLO si no es ruta de autenticación
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        // Excluir login y register (y cualquier otra ruta pública)
        const isAuthRoute = config.url.includes('/api/auth/');
        if (token && !isAuthRoute) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor de respuesta: Si el backend da 401/403, limpia y desloguea
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;