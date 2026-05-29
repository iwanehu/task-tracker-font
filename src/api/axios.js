import axios from 'axios';

// Capturamos la URL de producción de Vercel o local en desarrollo
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

/**
 * 🔒 INTERCEPTOR DE PETICIÓN (Request)
 * Antes de que la petición salga hacia Render, este bloque se ejecuta,
 * busca el token en el localStorage y lo inyecta en las cabeceras.
 */
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

/**
 * 🛡️ INTERCEPTOR DE RESPUESTA (Response)
 * Cuando el backend responde, si el token ha expirado o es inválido,
 * el servidor devolverá un 401 o 403. Aquí lo cazamos globalmente para
 * evitar que la app se quede congelada.
 */
api.interceptors.response.use(
    (response) => response, // Si la respuesta es correcta (2xx), pasa de largo
    (error) => {
        // Capturamos fallos de autenticación del backend en producción
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.warn("Sesión expirada o no autorizada. Limpiando credenciales...");
            
            // 🧹 Limpieza atómica del almacenamiento
            localStorage.removeItem('token');
            
            // 🔄 Redirección forzosa al login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;