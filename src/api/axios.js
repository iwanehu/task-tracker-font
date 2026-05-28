import axios from 'axios';

const api = axios.create({
  // Intentamos leer la variable de Vercel. Si no existe, usamos el puerto 8080 de tu Spring Boot local
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api', 
});

// Interceptor: Antes de que salga cualquier petición, viaja a por el Token al LocalStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;