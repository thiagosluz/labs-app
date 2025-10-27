'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { User, ActivityLog } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Calendar, User as UserIcon, Mail, Shield, Activity } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function UsuarioDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const [usuario, setUsuario] = useState<User | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsuario();
  }, [params.id]);

  const loadUsuario = async () => {
    try {
      const response = await api.get(`/users/${params.id}`);
      setUsuario(response.data);
      
      // Carregar atividades
      const activitiesResponse = await api.get(`/users/${params.id}/activities`);
      setActivities(activitiesResponse.data.data || []);
    } catch (error) {
      toast.error('Erro ao carregar usuário');
      router.push('/usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'outline', label: string }> = {
      admin: { variant: 'default', label: 'Admin' },
      tecnico: { variant: 'secondary', label: 'Técnico' },
      visualizador: { variant: 'outline', label: 'Visualizador' },
    };
    const config = variants[role] || { variant: 'default' as const, label: role };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (active: boolean) => {
    return (
      <Badge variant={active ? 'default' : 'secondary'}>
        {active ? 'Ativo' : 'Inativo'}
      </Badge>
    );
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      created: 'Criado',
      updated: 'Atualizado',
      deleted: 'Deletado',
      viewed: 'Visualizado',
    };
    return labels[action] || action;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!usuario) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/usuarios">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{usuario.name}</h1>
            <p className="text-muted-foreground">{usuario.email}</p>
          </div>
        </div>
        <Link href={`/usuarios/${usuario.id}/editar`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="geral" className="space-y-4">
        <TabsList>
          <TabsTrigger value="geral">Informações Gerais</TabsTrigger>
          <TabsTrigger value="permissoes">Permissões</TabsTrigger>
          <TabsTrigger value="atividades">
            Histórico de Atividades ({activities.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{usuario.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{usuario.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(usuario.active)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cargo</p>
                  {getRoleBadge(usuario.role)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Datas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Data de Criação</p>
                  <p className="font-medium">
                    {format(new Date(usuario.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Última Atualização</p>
                  <p className="font-medium">
                    {format(new Date(usuario.updated_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="permissoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permissões Personalizadas</CardTitle>
              <CardDescription>
                {usuario.permissions && usuario.permissions.length > 0
                  ? `Este usuário possui ${usuario.permissions.length} permissões personalizadas`
                  : 'Este usuário está usando as permissões padrão do cargo'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usuario.permissions && usuario.permissions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {usuario.permissions.map((permission, index) => (
                    <Badge key={index} variant="outline">
                      {permission}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Sem permissões personalizadas. O usuário está usando as permissões padrão do cargo {usuario.role}.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="atividades" className="space-y-4">
          {activities.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-32">
                <Activity className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma atividade registrada</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {activities.map((activity) => (
                <Card key={activity.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="font-medium">
                          {getActionLabel(activity.action)} - {activity.model_type}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(activity.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      <Badge variant="outline">{activity.model_type}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
