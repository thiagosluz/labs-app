import axios from 'axios';

// Helper para obter URL base da API (sem /api/v1)
const getApiBaseUrl = () => {
  // No browser, verificar se estamos em produção (mesmo domínio) ou desenvolvimento (portas diferentes)
  if (typeof window !== 'undefined') {
    // Se NEXT_PUBLIC_API_URL está definido, usar (para produção com proxy)
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '');
    }
    // Em desenvolvimento, sempre usar localhost:8000 (backend)
    return 'http://localhost:8000';
  }
  // No servidor, usar variável de ambiente
  return process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';
};

// Helper para obter URL completa da API
const getApiUrl = () => {
  // No browser, verificar se estamos em produção (mesmo domínio) ou desenvolvimento (portas diferentes)
  if (typeof window !== 'undefined') {
    // Se NEXT_PUBLIC_API_URL está definido, usar (para produção com proxy)
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    // Em desenvolvimento, sempre usar localhost:8000 (backend)
    return 'http://localhost:8000/api/v1';
  }
  // No servidor, usar variável de ambiente
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
};

const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

// Cliente para requisições ao Sanctum (CSRF cookie)
// Usa URL dinâmica baseada no window.location quando disponível
export const sanctumApi = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

// O Axios automaticamente lê o cookie XSRF-TOKEN e envia no header X-XSRF-TOKEN
// quando xsrfCookieName e xsrfHeaderName estão configurados
// Não é necessário interceptor manual

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Helper para obter URL de storage
export const getStorageUrl = (path: string) => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/storage/${path}`;
};

// Helper para obter URL do frontend
export const getFrontendUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
};

export default api;

