import axios from 'axios';

export const https = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true, // Envía la cookie access_token en cada petición
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor global para un manejo de errores más limpio
https.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);
