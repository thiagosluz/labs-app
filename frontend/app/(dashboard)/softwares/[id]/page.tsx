'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Software, Equipamento, Laboratorio } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Trash2, Calendar, Package, HardDrive, Building2, AlertCircle } from 'lucide-react';
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

export default function SoftwareDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const [software, setSoftware] = useState<Software | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadSoftware();
  }, [params.id]);

  const loadSoftware = async () => {
    try {
      const response = await api.get(`/softwares/${params.id}`);
      setSoftware(response.data);
    } catch (error) {
      toast.error('Erro ao carregar software');
      router.push('/softwares');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const xsrfToken = getXsrfToken();
      await api.delete(`/softwares/${params.id}`, {
        headers: {
          ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
        },
      });
      toast.success('Software excluído com sucesso!');
      router.push('/softwares');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao excluir software');
      setIsDeleting(false);
    }
  };

  const getLicencaBadge = (tipo: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'outline', label: string }> = {
      livre: { variant: 'default', label: 'Livre' },
      educacional: { variant: 'secondary', label: 'Educacional' },
      proprietario: { variant: 'outline', label: 'Proprietário' },
    };
    const config = variants[tipo] || { variant: 'default' as const, label: tipo };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const isExpiring = (dateString?: string) => {
    if (!dateString) return false;
    const expirationDate = new Date(dateString);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expirationDate <= thirtyDaysFromNow && expirationDate >= new Date();
  };

  const isExpired = (dateString?: string) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Carregando...</div>;
  }

  if (!software) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/softwares">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{software.nome}</h1>
            <p className="text-muted-foreground">
              {software.versao ? `Versão ${software.versao}` : 'Software'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/softwares/${software.id}/editar`}>
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
                  Tem certeza que deseja excluir o software "{software.nome}"? Esta ação não pode ser desfeita.
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

      {/* Alertas */}
      {software.data_expiracao && isExpired(software.data_expiracao) && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Licença Expirada</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              A licença deste software expirou em {formatDate(software.data_expiracao)}. 
              É necessário renovar a licença para continuar utilizando.
            </p>
          </CardContent>
        </Card>
      )}

      {software.data_expiracao && isExpiring(software.data_expiracao) && !isExpired(software.data_expiracao) && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <CardTitle className="text-yellow-700 dark:text-yellow-300">Licença Expirando</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              A licença deste software expira em {formatDate(software.data_expiracao)}. 
              Providencie a renovação com antecedência.
            </p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="detalhes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
          <TabsTrigger value="equipamentos">
            Equipamentos ({software.equipamentos?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="laboratorios">
            Laboratórios ({software.laboratorios_equipamentos?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="detalhes" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Gerais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Nome</p>
                      <p className="text-lg">{software.nome}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Versão</p>
                      <p className="text-lg">{software.versao || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tipo de Licença</p>
                      <div className="mt-1">{getLicencaBadge(software.tipo_licenca)}</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Fabricante</p>
                      <p className="text-lg">{software.fabricante || '-'}</p>
                    </div>
                  </div>

                  {software.descricao && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Descrição</p>
                      <p className="text-base whitespace-pre-line">{software.descricao}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Licenciamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Quantidade de Licenças</p>
                    <p className="text-2xl font-bold">
                      {software.quantidade_licencas || 'Ilimitadas'}
                    </p>
                  </div>
                  {software.data_expiracao && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Data de Expiração</p>
                      <p className={`text-lg ${isExpired(software.data_expiracao) ? 'text-destructive font-bold' : ''}`}>
                        {formatDate(software.data_expiracao)}
                      </p>
                    </div>
                  )}
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
                    <p className="text-sm font-medium text-muted-foreground">Criado em</p>
                    <p>{formatDate(software.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Atualizado em</p>
                    <p>{formatDate(software.updated_at)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="equipamentos">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Equipamentos com este Software
              </CardTitle>
              <CardDescription>
                Lista de equipamentos que possuem este software instalado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {software.equipamentos && software.equipamentos.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Patrimônio</TableHead>
                      <TableHead>Laboratório</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {software.equipamentos.map((equipamento: any) => (
                      <TableRow key={equipamento.id}>
                        <TableCell className="font-medium">
                          <Link href={`/equipamentos/${equipamento.id}`} className="hover:underline">
                            {equipamento.nome}
                          </Link>
                        </TableCell>
                        <TableCell>{equipamento.tipo}</TableCell>
                        <TableCell>{equipamento.patrimonio || '-'}</TableCell>
                        <TableCell>{equipamento.laboratorio?.nome || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={equipamento.estado === 'em_uso' ? 'default' : 'secondary'}>
                            {equipamento.estado}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Este software não está instalado em nenhum equipamento
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="laboratorios">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Laboratórios com este Software
              </CardTitle>
              <CardDescription>
                Laboratórios que possuem equipamentos com este software instalado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {software.laboratorios_equipamentos && software.laboratorios_equipamentos.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Equipamentos</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {software.laboratorios_equipamentos.map((laboratorio: any) => (
                      <TableRow key={laboratorio.id}>
                        <TableCell className="font-medium">
                          <Link href={`/laboratorios/${laboratorio.id}`} className="hover:underline">
                            {laboratorio.nome}
                          </Link>
                        </TableCell>
                        <TableCell>{laboratorio.localizacao}</TableCell>
                        <TableCell>{laboratorio.equipamentos?.length || 0}</TableCell>
                        <TableCell>
                          <Badge variant={laboratorio.status === 'ativo' ? 'default' : 'secondary'}>
                            {laboratorio.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Este software não está instalado em equipamentos de nenhum laboratório
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

