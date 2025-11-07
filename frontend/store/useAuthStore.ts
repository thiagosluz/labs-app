import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api, { sanctumApi } from '@/lib/api';
import { User } from '@/lib/types';
import { getXsrfToken } from '@/lib/csrf';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          // Passo 1: Obter CSRF cookie do Sanctum
          const csrfResponse = await sanctumApi.get('/sanctum/csrf-cookie');
          
          // Pequeno delay para garantir que o cookie foi estabelecido
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Passo 2: Obter o token XSRF do cookie (se disponível)
          // Nota: O Axios pode não conseguir ler cookies de outros domínios,
          // então tentamos ler manualmente como fallback
          let xsrfToken = getXsrfToken();
          
          // Se não encontrou o token, o Axios tentará ler automaticamente
          // ou o navegador enviará o cookie automaticamente com withCredentials: true
          
          // Passo 3: Fazer login
          const response = await api.post('/login', 
            { email, password },
            xsrfToken ? {
              headers: {
                'X-XSRF-TOKEN': xsrfToken
              }
            } : {}
          );
          
          const { user } = response.data;
          
          localStorage.setItem('user', JSON.stringify(user));
          
          set({ user, isAuthenticated: true });
        } catch (error: any) {
          console.error('Erro no login:', error.response?.data?.message || error.message);
          throw error;
        }
      },

      logout: async () => {
        // Limpar estado local primeiro
        localStorage.removeItem('user');
        localStorage.removeItem('auth-storage');
        set({ user: null, isAuthenticated: false });
        
        // Limpar cookies do navegador ANTES do redirecionamento
        if (typeof document !== 'undefined') {
          // Limpar todos os cookies relacionados à sessão
          // Não especificar domain para funcionar em qualquer domínio/IP
          document.cookie = 'laravel_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
          document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
        }
        
        // Tentar fazer logout no backend (sem bloquear se falhar)
        try {
          const xsrfToken = getXsrfToken();
          if (xsrfToken) {
            await api.post('/logout', {}, {
              headers: {
                'X-XSRF-TOKEN': xsrfToken
              }
            });
          }
        } catch (error) {
          // Ignorar erros no logout do backend
          console.log('Erro ao fazer logout no backend (ignorado)', error);
        }
      },

      updateUser: (user: User) => {
        localStorage.setItem('user', JSON.stringify(user));
        set({ user });
      },

      checkAuth: async () => {
        try {
          const response = await api.get('/me');
          const user = response.data;
          localStorage.setItem('user', JSON.stringify(user));
          set({ user, isAuthenticated: true });
        } catch (error) {
          localStorage.removeItem('user');
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

