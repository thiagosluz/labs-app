'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Manutencao, Equipamento, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { getXsrfToken } from '@/lib/csrf';

export default function EditarManutencaoPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [tecnicos, setTecnicos] = useState<User[]>([]);

  const [formData, setFormData] = useState({
    equipamento_id: '0',
    data: '',
    tipo: 'corretiva',
    descricao: '',
    tecnico_id: '0',
    status: 'pendente',
  });

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    try {
      const [manutencaoRes, equipamentosRes, tecnicosRes] = await Promise.all([
        api.get(`/manutencoes/${params.id}`),
        api.get('/equipamentos', { params: { per_page: 100 } }),
        api.get('/users'),
      ]);

      const manutencao: Manutencao = manutencaoRes.data;

      setFormData({
        equipamento_id: manutencao.equipamento_id?.toString() || '0',
        data: manutencao.data || '',
        tipo: manutencao.tipo || 'corretiva',
        descricao: manutencao.descricao || '',
        tecnico_id: manutencao.tecnico_id?.toString() || '0',
        status: manutencao.status || 'pendente',
      });

      setEquipamentos(equipamentosRes.data.data);
      setTecnicos(tecnicosRes.data.filter((u: User) => u.role === 'admin' || u.role === 'tecnico'));
    } catch (error) {
      toast.error('Erro ao carregar dados');
      router.push('/manutencoes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação: equipamento é obrigatório
    if (formData.equipamento_id === '0') {
      toast.error('Selecione um equipamento');
      return;
    }

    setIsSaving(true);

    try {
      const xsrfToken = getXsrfToken();

      const dataToSend: any = {
        equipamento_id: parseInt(formData.equipamento_id),
        data: formData.data,
        tipo: formData.tipo,
        descricao: formData.descricao,
        status: formData.status,
      };

      // Adicionar técnico apenas se selecionado
      if (formData.tecnico_id !== '0') {
        dataToSend.tecnico_id = parseInt(formData.tecnico_id);
      }

      await api.put(`/manutencoes/${params.id}`, dataToSend, {
        headers: {
          ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
        },
      });

      toast.success('Manutenção atualizada com sucesso!');
      router.push(`/manutencoes/${params.id}`);
    } catch (error: any) {
      console.error('Erro ao atualizar manutenção:', error);
      toast.error(error.response?.data?.message || 'Erro ao atualizar manutenção');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/manutencoes/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Manutenção</h1>
          <p className="text-muted-foreground">Atualize as informações da manutenção</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Manutenção</CardTitle>
                <CardDescription>Dados principais da manutenção</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="equipamento_id">Equipamento *</Label>
                    <Select
                      value={formData.equipamento_id}
                      onValueChange={(value) => setFormData({ ...formData, equipamento_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um equipamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Selecione um equipamento</SelectItem>
                        {equipamentos.map((eq) => (
                          <SelectItem key={eq.id} value={eq.id.toString()}>
                            {eq.nome} {eq.patrimonio ? `(${eq.patrimonio})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data">Data da Manutenção *</Label>
                    <Input
                      id="data"
                      type="date"
                      required
                      value={formData.data}
                      onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo *</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="corretiva">Corretiva</SelectItem>
                        <SelectItem value="preventiva">Preventiva</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="em_andamento">Em Andamento</SelectItem>
                        <SelectItem value="concluida">Concluída</SelectItem>
                        <SelectItem value="cancelada">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição *</Label>
                  <Textarea
                    id="descricao"
                    required
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descreva o problema encontrado e o serviço realizado..."
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Lateral */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Responsável</CardTitle>
                <CardDescription>Técnico responsável pela manutenção</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tecnico_id">Técnico</Label>
                  <Select
                    value={formData.tecnico_id}
                    onValueChange={(value) => setFormData({ ...formData, tecnico_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um técnico" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Nenhum Técnico</SelectItem>
                      {tecnicos.map((tec) => (
                        <SelectItem key={tec.id} value={tec.id.toString()}>
                          {tec.name} ({tec.role === 'admin' ? 'Admin' : 'Técnico'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Opcional - pode ser definido posteriormente
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <AlertCircle className="h-4 w-4" />
                  Dica
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-blue-700 dark:text-blue-300">
                <ul className="space-y-1 list-disc list-inside">
                  <li><strong>Corretiva:</strong> Reparo de problema já ocorrido</li>
                  <li><strong>Preventiva:</strong> Manutenção programada para evitar problemas</li>
                  <li>Atualize o status conforme o andamento do serviço</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" asChild>
            <Link href={`/manutencoes/${params.id}`}>Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </div>
  );
}

