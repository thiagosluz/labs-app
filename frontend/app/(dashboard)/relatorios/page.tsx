'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Filter, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Laboratorio } from '@/lib/types';

export default function RelatoriosPage() {
  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([]);
  
  // Estados de loading para cada tipo de relatório e formato
  const [isGenerating, setIsGenerating] = useState<{
    tipo: string;
    formato: string;
  } | null>(null);

  // Filtros Equipamentos
  const [filtrosEquipamentos, setFiltrosEquipamentos] = useState({
    tipo: 'todos',
    estado: 'todos',
    laboratorio_id: 'todos',
    data_inicio: '',
    data_fim: '',
  });

  // Filtros Manutenções
  const [filtrosManutencoes, setFiltrosManutencoes] = useState({
    tipo: 'todos',
    status: 'todos',
    data_inicio: '',
    data_fim: '',
  });

  // Filtros Softwares
  const [filtrosSoftwares, setFiltrosSoftwares] = useState({
    tipo_licenca: 'todos',
    status_expiracao: 'todos',
  });

  // Filtros Laboratórios
  const [filtrosLaboratorios, setFiltrosLaboratorios] = useState({
    status: 'todos',
  });

  useEffect(() => {
    loadLaboratorios();
  }, []);

  const loadLaboratorios = async () => {
    try {
      const response = await api.get('/laboratorios', { params: { per_page: 100 } });
      setLaboratorios(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar laboratórios');
    }
  };

  const gerarRelatorio = async (tipo: string, formato: 'pdf' | 'excel') => {
    // Definir estado de loading
    setIsGenerating({ tipo, formato });

    // Toast informativo com loading
    const toastId = toast.loading(
      `Gerando relatório ${formato.toUpperCase()} de ${tipo}...`,
      {
        description: 'Por favor, aguarde alguns instantes',
      }
    );

    try {
      let filtros = {};
      let endpoint = '';

      switch (tipo) {
        case 'equipamentos':
          filtros = filtrosEquipamentos;
          endpoint = `/relatorios/equipamentos/${formato}`;
          break;
        case 'manutencoes':
          filtros = filtrosManutencoes;
          endpoint = `/relatorios/manutencoes/${formato}`;
          break;
        case 'softwares':
          filtros = filtrosSoftwares;
          endpoint = `/relatorios/softwares/${formato}`;
          break;
        case 'laboratorios':
          filtros = filtrosLaboratorios;
          endpoint = `/relatorios/laboratorios/${formato}`;
          break;
      }

      // Fazer download do relatório
      const response = await api.get(endpoint, {
        params: filtros,
        responseType: 'blob',
      });

      // Criar URL para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // Definir nome do arquivo
      const extensao = formato === 'pdf' ? 'pdf' : 'xlsx';
      const nomeArquivo = `relatorio-${tipo}-${new Date().toISOString().split('T')[0]}.${extensao}`;
      link.setAttribute('download', nomeArquivo);

      // Fazer download
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Limpar URL
      window.URL.revokeObjectURL(url);

      // Toast de sucesso
      toast.success(`Relatório ${formato.toUpperCase()} gerado com sucesso!`, {
        id: toastId,
        description: `Arquivo: ${nomeArquivo}`,
      });
    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório', {
        id: toastId,
        description: error.response?.data?.message || 'Tente novamente mais tarde',
      });
    } finally {
      // Remover estado de loading
      setIsGenerating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <p className="text-muted-foreground">Gere relatórios em PDF ou Excel com filtros personalizados</p>
      </div>

      <Tabs defaultValue="equipamentos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="equipamentos">Equipamentos</TabsTrigger>
          <TabsTrigger value="manutencoes">Manutenções</TabsTrigger>
          <TabsTrigger value="softwares">Softwares</TabsTrigger>
          <TabsTrigger value="laboratorios">Laboratórios</TabsTrigger>
        </TabsList>

        {/* EQUIPAMENTOS */}
        <TabsContent value="equipamentos">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Relatório de Equipamentos
              </CardTitle>
              <CardDescription>Filtre e exporte dados de equipamentos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={filtrosEquipamentos.tipo}
                    onValueChange={(value) => setFiltrosEquipamentos({ ...filtrosEquipamentos, tipo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="computador">Computador</SelectItem>
                      <SelectItem value="notebook">Notebook</SelectItem>
                      <SelectItem value="projetor">Projetor</SelectItem>
                      <SelectItem value="roteador">Roteador</SelectItem>
                      <SelectItem value="switch">Switch</SelectItem>
                      <SelectItem value="impressora">Impressora</SelectItem>
                      <SelectItem value="scanner">Scanner</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select
                    value={filtrosEquipamentos.estado}
                    onValueChange={(value) => setFiltrosEquipamentos({ ...filtrosEquipamentos, estado: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="em_uso">Em Uso</SelectItem>
                      <SelectItem value="reserva">Reserva</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                      <SelectItem value="descartado">Descartado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Laboratório</Label>
                  <Select
                    value={filtrosEquipamentos.laboratorio_id}
                    onValueChange={(value) => setFiltrosEquipamentos({ ...filtrosEquipamentos, laboratorio_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {laboratorios.map((lab) => (
                        <SelectItem key={lab.id} value={lab.id.toString()}>
                          {lab.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Período (Aquisição)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={filtrosEquipamentos.data_inicio}
                      onChange={(e) => setFiltrosEquipamentos({ ...filtrosEquipamentos, data_inicio: e.target.value })}
                      placeholder="De"
                    />
                    <Input
                      type="date"
                      value={filtrosEquipamentos.data_fim}
                      onChange={(e) => setFiltrosEquipamentos({ ...filtrosEquipamentos, data_fim: e.target.value })}
                      placeholder="Até"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => gerarRelatorio('equipamentos', 'pdf')} 
                  className="flex-1"
                  disabled={isGenerating !== null}
                >
                  {isGenerating?.tipo === 'equipamentos' && isGenerating?.formato === 'pdf' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Gerar PDF
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => gerarRelatorio('equipamentos', 'excel')} 
                  variant="outline" 
                  className="flex-1"
                  disabled={isGenerating !== null}
                >
                  {isGenerating?.tipo === 'equipamentos' && isGenerating?.formato === 'excel' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Exportar Excel
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MANUTENÇÕES */}
        <TabsContent value="manutencoes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Relatório de Manutenções
              </CardTitle>
              <CardDescription>Filtre e exporte dados de manutenções</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={filtrosManutencoes.tipo}
                    onValueChange={(value) => setFiltrosManutencoes({ ...filtrosManutencoes, tipo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="corretiva">Corretiva</SelectItem>
                      <SelectItem value="preventiva">Preventiva</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={filtrosManutencoes.status}
                    onValueChange={(value) => setFiltrosManutencoes({ ...filtrosManutencoes, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="concluida">Concluída</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Período
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={filtrosManutencoes.data_inicio}
                      onChange={(e) => setFiltrosManutencoes({ ...filtrosManutencoes, data_inicio: e.target.value })}
                      placeholder="De"
                    />
                    <Input
                      type="date"
                      value={filtrosManutencoes.data_fim}
                      onChange={(e) => setFiltrosManutencoes({ ...filtrosManutencoes, data_fim: e.target.value })}
                      placeholder="Até"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => gerarRelatorio('manutencoes', 'pdf')} 
                  className="flex-1"
                  disabled={isGenerating !== null}
                >
                  {isGenerating?.tipo === 'manutencoes' && isGenerating?.formato === 'pdf' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Gerar PDF
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => gerarRelatorio('manutencoes', 'excel')} 
                  variant="outline" 
                  className="flex-1"
                  disabled={isGenerating !== null}
                >
                  {isGenerating?.tipo === 'manutencoes' && isGenerating?.formato === 'excel' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Exportar Excel
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SOFTWARES */}
        <TabsContent value="softwares">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Relatório de Softwares
              </CardTitle>
              <CardDescription>Filtre e exporte dados de softwares</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tipo de Licença</Label>
                  <Select
                    value={filtrosSoftwares.tipo_licenca}
                    onValueChange={(value) => setFiltrosSoftwares({ ...filtrosSoftwares, tipo_licenca: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="livre">Livre</SelectItem>
                      <SelectItem value="educacional">Educacional</SelectItem>
                      <SelectItem value="proprietario">Proprietário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status de Expiração</Label>
                  <Select
                    value={filtrosSoftwares.status_expiracao}
                    onValueChange={(value) => setFiltrosSoftwares({ ...filtrosSoftwares, status_expiracao: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="expirado">Expirado</SelectItem>
                      <SelectItem value="expirando">Expirando (30 dias)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => gerarRelatorio('softwares', 'pdf')} 
                  className="flex-1"
                  disabled={isGenerating !== null}
                >
                  {isGenerating?.tipo === 'softwares' && isGenerating?.formato === 'pdf' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Gerar PDF
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => gerarRelatorio('softwares', 'excel')} 
                  variant="outline" 
                  className="flex-1"
                  disabled={isGenerating !== null}
                >
                  {isGenerating?.tipo === 'softwares' && isGenerating?.formato === 'excel' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Exportar Excel
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LABORATÓRIOS */}
        <TabsContent value="laboratorios">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Relatório de Laboratórios
              </CardTitle>
              <CardDescription>Filtre e exporte dados de laboratórios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={filtrosLaboratorios.status}
                    onValueChange={(value) => setFiltrosLaboratorios({ ...filtrosLaboratorios, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => gerarRelatorio('laboratorios', 'pdf')} 
                  className="flex-1"
                  disabled={isGenerating !== null}
                >
                  {isGenerating?.tipo === 'laboratorios' && isGenerating?.formato === 'pdf' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Gerar PDF
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => gerarRelatorio('laboratorios', 'excel')} 
                  variant="outline" 
                  className="flex-1"
                  disabled={isGenerating !== null}
                >
                  {isGenerating?.tipo === 'laboratorios' && isGenerating?.formato === 'excel' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Exportar Excel
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
