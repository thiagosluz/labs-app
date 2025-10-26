'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Equipamento, Manutencao, Software } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Trash2, Calendar, MapPin, Package, Wrench, HardDrive, Image as ImageIcon, Cpu, HardDriveIcon, MemoryStick, Network, Activity } from 'lucide-react';
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

export default function EquipamentoDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const [equipamento, setEquipamento] = useState<Equipamento | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadEquipamento();
  }, [params.id]);

  const loadEquipamento = async () => {
    try {
      const response = await api.get(`/equipamentos/${params.id}`);
      setEquipamento(response.data);
    } catch (error) {
      toast.error('Erro ao carregar equipamento');
      router.push('/equipamentos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const xsrfToken = getXsrfToken();
      await api.delete(`/equipamentos/${params.id}`, {
        headers: {
          ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
        },
      });
      toast.success('Equipamento excluído com sucesso!');
      router.push('/equipamentos');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao excluir equipamento');
      setIsDeleting(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      em_uso: { variant: 'default', label: 'Em Uso' },
      reserva: { variant: 'secondary', label: 'Reserva' },
      manutencao: { variant: 'destructive', label: 'Manutenção' },
      descartado: { variant: 'outline', label: 'Descartado' },
    };
    const config = variants[estado] || { variant: 'default' as const, label: estado };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTipoLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      computador: 'Computador',
      projetor: 'Projetor',
      roteador: 'Roteador',
      switch: 'Switch',
      impressora: 'Impressora',
      scanner: 'Scanner',
      outro: 'Outro',
    };
    return tipos[tipo] || tipo;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Carregando...</div>;
  }

  if (!equipamento) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/equipamentos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{equipamento.nome}</h1>
            <p className="text-muted-foreground">{getTipoLabel(equipamento.tipo)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/equipamentos/${equipamento.id}/editar`}>
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
                  Tem certeza que deseja excluir o equipamento "{equipamento.nome}"? Esta ação não pode ser desfeita.
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

      <Tabs defaultValue="detalhes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
          <TabsTrigger value="softwares">Softwares</TabsTrigger>
          <TabsTrigger value="manutencoes">Manutenções</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
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
                      <p className="text-lg">{equipamento.nome}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                      <p className="text-lg">{getTipoLabel(equipamento.tipo)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Estado</p>
                      <div className="mt-1">{getEstadoBadge(equipamento.estado)}</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Fabricante</p>
                      <p className="text-lg">{equipamento.fabricante || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Modelo</p>
                      <p className="text-lg">{equipamento.modelo || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Número de Série</p>
                      <p className="text-lg">{equipamento.numero_serie || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Patrimônio</p>
                      <p className="text-lg">{equipamento.patrimonio || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Data de Aquisição</p>
                      <p className="text-lg">{formatDate(equipamento.data_aquisicao)}</p>
                    </div>
                  </div>

                  {equipamento.especificacoes && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Especificações Técnicas</p>
                      <p className="text-base whitespace-pre-line">{equipamento.especificacoes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {equipamento.gerenciado_por_agente && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Informações Técnicas (Agente)
                      </CardTitle>
                      {equipamento.ultima_sincronizacao && (
                        <Badge variant="secondary" className="text-xs">
                          Última sync: {formatDate(equipamento.ultima_sincronizacao)}
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      Dados coletados automaticamente pelo agente de inventário
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Hardware */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Cpu className="h-4 w-4" />
                        Hardware
                      </h4>
                      <div className="grid gap-3 md:grid-cols-2 pl-6">
                        {equipamento.processador && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Processador</p>
                            <p className="text-sm">{equipamento.processador}</p>
                          </div>
                        )}
                        {equipamento.memoria_ram && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Memória RAM</p>
                            <p className="text-sm">{equipamento.memoria_ram}</p>
                          </div>
                        )}
                        {equipamento.disco && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Disco</p>
                            <p className="text-sm">{equipamento.disco}</p>
                          </div>
                        )}
                        {equipamento.hostname && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Hostname</p>
                            <p className="text-sm">{equipamento.hostname}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rede */}
                    {(equipamento.ip_local || equipamento.mac_address || equipamento.gateway) && (
                      <div>
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <Network className="h-4 w-4" />
                          Rede
                        </h4>
                        <div className="grid gap-3 md:grid-cols-2 pl-6">
                          {equipamento.ip_local && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">IP Local</p>
                              <p className="text-sm font-mono">{equipamento.ip_local}</p>
                            </div>
                          )}
                          {equipamento.mac_address && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">MAC Address</p>
                              <p className="text-sm font-mono">{equipamento.mac_address}</p>
                            </div>
                          )}
                          {equipamento.gateway && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">Gateway</p>
                              <p className="text-sm font-mono">{equipamento.gateway}</p>
                            </div>
                          )}
                          {equipamento.dns_servers && equipamento.dns_servers.length > 0 && (
                            <div className="md:col-span-2">
                              <p className="text-xs font-medium text-muted-foreground">Servidores DNS</p>
                              <p className="text-sm font-mono">
                                {equipamento.dns_servers.join(', ')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Info do Agente */}
                    {equipamento.agent_version && (
                      <div className="pt-3 border-t">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Agente v{equipamento.agent_version}</span>
                          {equipamento.ultima_sincronizacao && (
                            <span>
                              Última sincronização: {format(new Date(equipamento.ultima_sincronizacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {equipamento.laboratorio && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Localização
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Laboratório</p>
                        <p className="text-lg">{equipamento.laboratorio.nome}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Localização</p>
                        <p className="text-lg">{equipamento.laboratorio.localizacao}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              {equipamento.foto && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      Foto
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img
                      src={`http://localhost:8000/storage/${equipamento.foto}`}
                      alt={equipamento.nome}
                      className="w-full rounded-lg"
                    />
                  </CardContent>
                </Card>
              )}

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
                    <p>{formatDate(equipamento.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Atualizado em</p>
                    <p>{formatDate(equipamento.updated_at)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="softwares">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Softwares Instalados
              </CardTitle>
              <CardDescription>
                Lista de softwares instalados neste equipamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              {equipamento.softwares && equipamento.softwares.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Versão</TableHead>
                      <TableHead>Fabricante</TableHead>
                      <TableHead>Tipo de Licença</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {equipamento.softwares.map((software) => (
                      <TableRow key={software.id}>
                        <TableCell className="font-medium">{software.nome}</TableCell>
                        <TableCell>{software.versao || '-'}</TableCell>
                        <TableCell>{software.fabricante || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {software.tipo_licenca === 'livre' && 'Livre'}
                            {software.tipo_licenca === 'educacional' && 'Educacional'}
                            {software.tipo_licenca === 'proprietario' && 'Proprietário'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum software instalado
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manutencoes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Histórico de Manutenções
              </CardTitle>
              <CardDescription>
                Manutenções realizadas neste equipamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              {equipamento.manutencoes && equipamento.manutencoes.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Técnico</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {equipamento.manutencoes.map((manutencao: any) => (
                      <TableRow key={manutencao.id}>
                        <TableCell>{formatDate(manutencao.data)}</TableCell>
                        <TableCell>
                          <Badge variant={manutencao.tipo === 'preventiva' ? 'secondary' : 'default'}>
                            {manutencao.tipo === 'preventiva' ? 'Preventiva' : 'Corretiva'}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{manutencao.descricao}</TableCell>
                        <TableCell>{manutencao.tecnico?.name || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={
                            manutencao.status === 'concluida' ? 'default' :
                            manutencao.status === 'em_andamento' ? 'secondary' :
                            manutencao.status === 'cancelada' ? 'destructive' : 'outline'
                          }>
                            {manutencao.status === 'pendente' && 'Pendente'}
                            {manutencao.status === 'em_andamento' && 'Em Andamento'}
                            {manutencao.status === 'concluida' && 'Concluída'}
                            {manutencao.status === 'cancelada' && 'Cancelada'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma manutenção registrada
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Histórico de Movimentações
              </CardTitle>
              <CardDescription>
                Movimentações deste equipamento entre laboratórios
              </CardDescription>
            </CardHeader>
            <CardContent>
              {equipamento.movimentacoes && (equipamento as any).movimentacoes.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Origem</TableHead>
                      <TableHead>Destino</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Observação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(equipamento as any).movimentacoes.map((movimentacao: any) => (
                      <TableRow key={movimentacao.id}>
                        <TableCell>{formatDate(movimentacao.created_at)}</TableCell>
                        <TableCell>{movimentacao.laboratorio_origem?.nome || '-'}</TableCell>
                        <TableCell>{movimentacao.laboratorio_destino?.nome || '-'}</TableCell>
                        <TableCell>{movimentacao.usuario?.name || '-'}</TableCell>
                        <TableCell className="max-w-xs truncate">{movimentacao.observacao || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma movimentação registrada
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

