'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Manutencao } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Trash2, Calendar, User, Wrench, HardDrive, FileText } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { getXsrfToken } from '@/lib/csrf';

export default function ManutencaoDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const [manutencao, setManutencao] = useState<Manutencao | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadManutencao();
  }, [params.id]);

  const loadManutencao = async () => {
    try {
      const response = await api.get(`/manutencoes/${params.id}`);
      setManutencao(response.data);
    } catch (error) {
      toast.error('Erro ao carregar manutenção');
      router.push('/manutencoes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const xsrfToken = getXsrfToken();
      await api.delete(`/manutencoes/${params.id}`, {
        headers: {
          ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
        },
      });
      toast.success('Manutenção excluída com sucesso!');
      router.push('/manutencoes');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao excluir manutenção');
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      pendente: { variant: 'outline', label: 'Pendente' },
      em_andamento: { variant: 'secondary', label: 'Em Andamento' },
      concluida: { variant: 'default', label: 'Concluída' },
      cancelada: { variant: 'destructive', label: 'Cancelada' },
    };
    const config = variants[status] || { variant: 'default' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTipoBadge = (tipo: string) => {
    return (
      <Badge variant={tipo === 'preventiva' ? 'default' : 'secondary'}>
        {tipo === 'preventiva' ? 'Preventiva' : 'Corretiva'}
      </Badge>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Carregando...</div>;
  }

  if (!manutencao) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/manutencoes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Detalhes da Manutenção</h1>
            <p className="text-muted-foreground">
              {manutencao.equipamento?.nome || 'Equipamento não informado'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/manutencoes/${manutencao.id}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir esta manutenção? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Manutenção</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data da Manutenção</p>
                  <p className="text-lg">{formatDate(manutencao.data)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                  <div className="mt-1">{getTipoBadge(manutencao.tipo)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(manutencao.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Técnico Responsável</p>
                  <p className="text-lg">{manutencao.tecnico?.name || 'Não atribuído'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Descrição</p>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-base whitespace-pre-line">{manutencao.descricao}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Equipamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              {manutencao.equipamento ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nome</p>
                    <p className="text-lg font-medium">{manutencao.equipamento.nome}</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                      <p>{manutencao.equipamento.tipo || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Patrimônio</p>
                      <p>{manutencao.equipamento.patrimonio || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Estado</p>
                      <Badge variant={manutencao.equipamento.estado === 'em_uso' ? 'default' : 'secondary'}>
                        {manutencao.equipamento.estado}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Laboratório</p>
                      <p>{manutencao.equipamento.laboratorio?.nome || 'Não alocado'}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/equipamentos/${manutencao.equipamento.id}`}>
                      Ver Equipamento Completo
                    </Link>
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground">Equipamento não informado</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Coluna Lateral */}
        <div className="space-y-6">
          {manutencao.tecnico && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Técnico Responsável
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nome</p>
                  <p className="text-lg">{manutencao.tecnico.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{manutencao.tecnico.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Função</p>
                  <Badge>
                    {manutencao.tecnico.role === 'admin' ? 'Administrador' : 
                     manutencao.tecnico.role === 'tecnico' ? 'Técnico' : 'Visualizador'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Registro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Criado em</p>
                <p>{formatDateTime(manutencao.created_at)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Última atualização</p>
                <p>{formatDateTime(manutencao.updated_at)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Card informativo baseado no status */}
          {manutencao.status === 'pendente' && (
            <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                  <Wrench className="h-4 w-4" />
                  Manutenção Pendente
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-yellow-700 dark:text-yellow-300">
                <p>Esta manutenção está aguardando para ser iniciada.</p>
              </CardContent>
            </Card>
          )}

          {manutencao.status === 'em_andamento' && (
            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <Wrench className="h-4 w-4" />
                  Em Andamento
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-blue-700 dark:text-blue-300">
                <p>Esta manutenção está sendo realizada no momento.</p>
              </CardContent>
            </Card>
          )}

          {manutencao.status === 'concluida' && (
            <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2 text-green-700 dark:text-green-300">
                  <Wrench className="h-4 w-4" />
                  Concluída
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-green-700 dark:text-green-300">
                <p>Esta manutenção foi concluída com sucesso.</p>
              </CardContent>
            </Card>
          )}

          {manutencao.status === 'cancelada' && (
            <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2 text-red-700 dark:text-red-300">
                  <Wrench className="h-4 w-4" />
                  Cancelada
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-red-700 dark:text-red-300">
                <p>Esta manutenção foi cancelada.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

