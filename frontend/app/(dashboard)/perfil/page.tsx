'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Lock, Save, Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { getXsrfToken } from '@/lib/csrf';

export default function PerfilPage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  // Formulário de Perfil
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
  });

  // Formulário de Senha
  const [passwordForm, setPasswordForm] = useState({
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingProfile(true);

    const toastId = toast.loading('Atualizando perfil...', {
      description: 'Por favor, aguarde',
    });

    try {
      const xsrfToken = getXsrfToken();
      
      const response = await api.put('/profile', profileForm, {
        headers: {
          ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
        },
      });

      // Atualizar usuário no store
      updateUser(response.data);

      toast.success('Perfil atualizado com sucesso!', {
        id: toastId,
        description: 'Suas informações foram salvas',
      });
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil', {
        id: toastId,
        description: error.response?.data?.message || 'Tente novamente mais tarde',
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (passwordForm.password.length < 8) {
      toast.error('A senha deve ter no mínimo 8 caracteres');
      return;
    }

    if (passwordForm.password !== passwordForm.password_confirmation) {
      toast.error('As senhas não coincidem');
      return;
    }

    setIsLoadingPassword(true);

    const toastId = toast.loading('Atualizando senha...', {
      description: 'Por favor, aguarde',
    });

    try {
      const xsrfToken = getXsrfToken();
      
      await api.put('/profile', passwordForm, {
        headers: {
          ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
        },
      });

      // Limpar formulário
      setPasswordForm({
        password: '',
        password_confirmation: '',
      });

      toast.success('Senha atualizada com sucesso!', {
        id: toastId,
        description: 'Sua senha foi alterada',
      });
    } catch (error: any) {
      console.error('Erro ao atualizar senha:', error);
      toast.error('Erro ao atualizar senha', {
        id: toastId,
        description: error.response?.data?.message || 'Tente novamente mais tarde',
      });
    } finally {
      setIsLoadingPassword(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const roles: Record<string, { variant: 'default' | 'secondary' | 'destructive', label: string }> = {
      admin: { variant: 'default', label: 'Administrador' },
      tecnico: { variant: 'secondary', label: 'Técnico' },
      visualizador: { variant: 'destructive', label: 'Visualizador' },
    };
    const config = roles[role] || { variant: 'secondary' as const, label: role };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais e segurança</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações do Perfil */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>Atualize seu nome e email</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    required
                    disabled={isLoadingProfile}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    required
                    disabled={isLoadingProfile}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoadingProfile}
                  className="w-full"
                >
                  {isLoadingProfile ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Alterar Senha */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Segurança
              </CardTitle>
              <CardDescription>Altere sua senha de acesso</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nova Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={passwordForm.password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                    placeholder="Mínimo 8 caracteres"
                    disabled={isLoadingPassword}
                  />
                  <p className="text-xs text-muted-foreground">
                    Deixe em branco se não quiser alterar
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_confirmation">Confirmar Nova Senha</Label>
                  <Input
                    id="password_confirmation"
                    type="password"
                    value={passwordForm.password_confirmation}
                    onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
                    placeholder="Digite a senha novamente"
                    disabled={isLoadingPassword}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoadingPassword || !passwordForm.password}
                  className="w-full"
                  variant="outline"
                >
                  {isLoadingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Atualizar Senha
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Card de Informações da Conta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Nome</p>
                <p className="text-base font-medium">{user.name}</p>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                <p className="text-base">{user.email}</p>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Tipo de Conta</p>
                <div className="mt-1">
                  {getRoleBadge(user.role)}
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
                <Badge variant={user.active ? 'default' : 'destructive'}>
                  {user.active ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Card Informativo */}
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Mail className="h-4 w-4" />
                Dica de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-700 dark:text-blue-300">
              <ul className="space-y-1 list-disc list-inside">
                <li>Use uma senha forte e única</li>
                <li>Não compartilhe suas credenciais</li>
                <li>Altere sua senha regularmente</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

