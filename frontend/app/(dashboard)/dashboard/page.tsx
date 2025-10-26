'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { DashboardStats } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MonitorSmartphone, HardDrive, Package, Wrench, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.get('/dashboard');
      setStats(response.data);
    } catch (error) {
      toast.error('Erro ao carregar dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!stats) {
    return <div>Erro ao carregar dados</div>;
  }

  const equipamentosPorTipoData = Object.entries(stats.charts.equipamentos_por_tipo).map(([name, value]) => ({
    name,
    value,
  }));

  const equipamentosPorEstadoData = Object.entries(stats.charts.equipamentos_por_estado).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do parque tecnológico</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Laboratórios</CardTitle>
            <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.stats.total_laboratorios}</div>
            <p className="text-xs text-muted-foreground">
              {stats.stats.laboratorios_ativos} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipamentos</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.stats.total_equipamentos}</div>
            <p className="text-xs text-muted-foreground">
              {stats.stats.equipamentos_em_uso} em uso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Softwares</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.stats.total_softwares}</div>
            <p className="text-xs text-muted-foreground">
              {stats.stats.softwares_expirando} expirando
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manutenções</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.stats.manutencoes_pendentes}</div>
            <p className="text-xs text-muted-foreground">
              {stats.stats.manutencoes_mes} neste mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Equipamentos por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={equipamentosPorTipoData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {equipamentosPorTipoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Equipamentos por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={equipamentosPorEstadoData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {(stats.alerts.licencas_expirando.length > 0 || stats.alerts.equipamentos_manutencao.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Alertas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.alerts.licencas_expirando.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Licenças Próximas do Vencimento</h3>
                <div className="space-y-2">
                  {stats.alerts.licencas_expirando.map((software) => (
                    <div key={software.id} className="flex items-center justify-between border-l-4 border-amber-500 pl-3 py-2">
                      <div>
                        <p className="font-medium">{software.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          Expira em: {software.data_expiracao ? new Date(software.data_expiracao).toLocaleDateString('pt-BR') : 'N/A'}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-amber-600">Atenção</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stats.alerts.equipamentos_manutencao.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Equipamentos em Manutenção</h3>
                <div className="space-y-2">
                  {stats.alerts.equipamentos_manutencao.slice(0, 5).map((equipamento) => (
                    <div key={equipamento.id} className="flex items-center justify-between border-l-4 border-red-500 pl-3 py-2">
                      <div>
                        <p className="font-medium">{equipamento.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {equipamento.laboratorio?.nome}
                        </p>
                      </div>
                      <Badge variant="destructive">Manutenção</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

