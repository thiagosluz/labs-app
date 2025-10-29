'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { useAuthStore } from '@/store/useAuthStore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Verificar se tem cookie de sessão
        const hasSession = document.cookie.includes('laravel_session');
        
        if (!hasSession && !isAuthenticated && !user) {
          router.push('/login');
          return;
        }

        // Se não está autenticado mas tem cookie, verificar autenticação
        if (!isAuthenticated || !user) {
          await checkAuth();
          
          // Se ainda não está autenticado após verificar
          const currentUser = useAuthStore.getState().user;
          if (!currentUser) {
            router.push('/login');
            return;
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        router.push('/login');
      } finally {
        setIsChecking(false);
      }
    };

    verifyAuth();
  }, [router, isAuthenticated, user, checkAuth]);

  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Não renderiza nada enquanto redireciona
  }

  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

