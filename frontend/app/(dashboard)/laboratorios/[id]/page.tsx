'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Laboratorio, Equipamento, Software } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  User,
  Monitor,
  Package,
  Calendar,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

export default function DetalhesLaboratorioPage() {
  const params = useParams();
  const router = useRouter();
  const [laboratorio, setLaboratorio] = useState<Laboratorio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    loadLaboratorio();
  }, [params.id]);

  const loadLaboratorio = async () => {
    try {
      const response = await api.get(`/laboratorios/${params.id}`);
      setLaboratorio(response.data);
    } catch (error) {
      toast.error('Erro ao carregar laboratório');
      router.push('/laboratorios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/laboratorios/${params.id}`);
      toast.success('Laboratório excluído com sucesso!');
      router.push('/laboratorios');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao excluir laboratório';
      toast.error(message);
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      ativo: 'default',
      inativo: 'secondary',
      manutencao: 'destructive',
    };
    const labels: Record<string, string> = {
      ativo: 'Ativo',
      inativo: 'Inativo',
      manutencao: 'Manutenção',
    };
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      em_uso: 'default',
      reserva: 'secondary',
      manutencao: 'destructive',
      descartado: 'destructive',
    };
    const labels: Record<string, string> = {
      em_uso: 'Em Uso',
      reserva: 'Reserva',
      manutencao: 'Manutenção',
      descartado: 'Descartado',
    };
    return <Badge variant={variants[estado] || 'default'}>{labels[estado] || estado}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!laboratorio) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/laboratorios">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{laboratorio.nome}</h1>
              {getStatusBadge(laboratorio.status)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">ID:</span>
              <Badge variant="secondary" className="font-mono">
                {laboratorio.id}
              </Badge>
            </div>
            <p className="text-muted-foreground">Detalhes do laboratório</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/laboratorios/${laboratorio.id}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Localização</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{laboratorio.localizacao}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipamentos</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {laboratorio.equipamentos?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Responsável</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">
              {laboratorio.responsavel?.name || 'Não definido'}
            </div>
          </CardContent>
        </Card>
      </div>

      {laboratorio.descricao && (
        <Card>
          <CardHeader>
            <CardTitle>Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{laboratorio.descricao}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="equipamentos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="equipamentos">
            Equipamentos ({laboratorio.equipamentos?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="softwares">
            Softwares ({laboratorio.softwares_equipamentos?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="equipamentos" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Equipamentos do Laboratório</CardTitle>
                <Button size="sm" asChild>
                  <Link href="/equipamentos/novo">Adicionar Equipamento</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {laboratorio.equipamentos && laboratorio.equipamentos.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Fabricante</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>Patrimônio</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {laboratorio.equipamentos.map((equipamento: Equipamento) => (
                      <TableRow key={equipamento.id}>
                        <TableCell className="font-medium">{equipamento.nome}</TableCell>
                        <TableCell className="capitalize">{equipamento.tipo}</TableCell>
                        <TableCell>{equipamento.fabricante || '-'}</TableCell>
                        <TableCell>{equipamento.modelo || '-'}</TableCell>
                        <TableCell>{equipamento.patrimonio || '-'}</TableCell>
                        <TableCell>{getEstadoBadge(equipamento.estado)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/equipamentos/${equipamento.id}`}>Ver Detalhes</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum equipamento cadastrado neste laboratório
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="softwares" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Softwares dos Equipamentos</CardTitle>
                <div className="text-sm text-muted-foreground">
                  Softwares instalados nos equipamentos deste laboratório
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {laboratorio.softwares_equipamentos && laboratorio.softwares_equipamentos.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Versão</TableHead>
                      <TableHead>Fabricante</TableHead>
                      <TableHead>Tipo de Licença</TableHead>
                      <TableHead>Instalações</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {laboratorio.softwares_equipamentos.map((software: any) => (
                      <TableRow key={software.id}>
                        <TableCell className="font-medium">{software.nome}</TableCell>
                        <TableCell>{software.versao || '-'}</TableCell>
                        <TableCell>{software.fabricante || '-'}</TableCell>
                        <TableCell className="capitalize">
                          {software.tipo_licenca?.replace('_', ' ') || '-'}
                        </TableCell>
                        <TableCell>
                          {software.equipamentos?.length || 0} equipamento(s)
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/softwares/${software.id}`}>Ver Detalhes</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum software instalado nos equipamentos deste laboratório
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o laboratório "{laboratorio.nome}"? Esta ação não
              pode ser desfeita.
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
  );
}

