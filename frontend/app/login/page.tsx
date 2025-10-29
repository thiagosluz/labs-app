'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success('Login realizado com sucesso!');
      
      // Aguardar um pouco mais para garantir que o cookie foi definido
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Verificar autenticação antes de redirecionar
      const checkAuth = useAuthStore.getState().checkAuth;
      try {
        await checkAuth();
      } catch (authError) {
        console.error('Erro ao verificar autenticação:', authError);
      }
      
      // Aguardar mais um pouco para garantir que tudo foi processado
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Usar window.location para forçar redirecionamento completo (recarrega página)
      window.location.href = '/dashboard';
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">IFG</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Parque Tecnológico IFG</CardTitle>
          <CardDescription className="text-center">
            Sistema de Gerenciamento de Laboratórios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@ifg.edu.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Credenciais de teste:</p>
            <p>Admin: admin@ifg.edu.br / password</p>
            <p>Técnico: tecnico@ifg.edu.br / password</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

