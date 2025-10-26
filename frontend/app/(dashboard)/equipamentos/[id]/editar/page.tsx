'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Equipamento, Laboratorio } from '@/lib/types';
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
import { ArrowLeft, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { getXsrfToken } from '@/lib/csrf';

export default function EditarEquipamentoPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([]);
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoAtual, setFotoAtual] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'computador',
    fabricante: '',
    modelo: '',
    numero_serie: '',
    patrimonio: '',
    data_aquisicao: '',
    estado: 'em_uso',
    laboratorio_id: '0', // 0 = nenhum laboratório
    especificacoes: '',
  });

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    try {
      const [equipamentoRes, laboratoriosRes] = await Promise.all([
        api.get(`/equipamentos/${params.id}`),
        api.get('/laboratorios', { params: { per_page: 100 } }),
      ]);

      const equipamento = equipamentoRes.data;
      setFormData({
        nome: equipamento.nome || '',
        tipo: equipamento.tipo || 'computador',
        fabricante: equipamento.fabricante || '',
        modelo: equipamento.modelo || '',
        numero_serie: equipamento.numero_serie || '',
        patrimonio: equipamento.patrimonio || '',
        data_aquisicao: equipamento.data_aquisicao || '',
        estado: equipamento.estado || 'em_uso',
        laboratorio_id: equipamento.laboratorio_id?.toString() || '0', // 0 = nenhum laboratório
        especificacoes: equipamento.especificacoes || '',
      });

      if (equipamento.foto) {
        setFotoAtual(equipamento.foto);
        setFotoPreview(`http://localhost:8000/storage/${equipamento.foto}`);
      }

      setLaboratorios(laboratoriosRes.data.data);
    } catch (error) {
      toast.error('Erro ao carregar dados');
      router.push('/equipamentos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2048 * 1024) {
        toast.error('A imagem deve ter no máximo 2MB');
        return;
      }
      setFoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFoto = () => {
    setFoto(null);
    setFotoPreview(null);
    setFotoAtual(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const xsrfToken = getXsrfToken();

      const formDataToSend = new FormData();
      
      // Adicionar _method para Laravel aceitar PUT via FormData
      formDataToSend.append('_method', 'PUT');

      // Adicionar campos do formulário
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== '0') {
          // Não enviar laboratorio_id se for '0' (nenhum)
          if (key === 'laboratorio_id' && value === '0') {
            return;
          }
          formDataToSend.append(key, value);
        }
      });

      // Adicionar foto se houver uma nova
      if (foto) {
        formDataToSend.append('foto', foto);
      }

      await api.post(`/equipamentos/${params.id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
        },
      });

      toast.success('Equipamento atualizado com sucesso!');
      router.push(`/equipamentos/${params.id}`);
    } catch (error: any) {
      console.error('Erro ao atualizar equipamento:', error);
      toast.error(error.response?.data?.message || 'Erro ao atualizar equipamento');
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
          <Link href={`/equipamentos/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Equipamento</h1>
          <p className="text-muted-foreground">Atualize as informações do equipamento</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>Dados principais do equipamento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Ex: Dell Optiplex 7090"
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
                        <SelectItem value="computador">Computador</SelectItem>
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
                    <Label htmlFor="fabricante">Fabricante</Label>
                    <Input
                      id="fabricante"
                      value={formData.fabricante}
                      onChange={(e) => setFormData({ ...formData, fabricante: e.target.value })}
                      placeholder="Ex: Dell"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="modelo">Modelo</Label>
                    <Input
                      id="modelo"
                      value={formData.modelo}
                      onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                      placeholder="Ex: Optiplex 7090"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numero_serie">Número de Série</Label>
                    <Input
                      id="numero_serie"
                      value={formData.numero_serie}
                      onChange={(e) => setFormData({ ...formData, numero_serie: e.target.value })}
                      placeholder="Ex: SN123456789"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patrimonio">Número de Patrimônio</Label>
                    <Input
                      id="patrimonio"
                      value={formData.patrimonio}
                      onChange={(e) => setFormData({ ...formData, patrimonio: e.target.value })}
                      placeholder="Ex: PAT2024001"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data_aquisicao">Data de Aquisição</Label>
                    <Input
                      id="data_aquisicao"
                      type="date"
                      value={formData.data_aquisicao}
                      onChange={(e) => setFormData({ ...formData, data_aquisicao: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado *</Label>
                    <Select
                      value={formData.estado}
                      onValueChange={(value) => setFormData({ ...formData, estado: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="em_uso">Em Uso</SelectItem>
                        <SelectItem value="reserva">Reserva</SelectItem>
                        <SelectItem value="manutencao">Manutenção</SelectItem>
                        <SelectItem value="descartado">Descartado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="especificacoes">Especificações Técnicas</Label>
                  <Textarea
                    id="especificacoes"
                    value={formData.especificacoes}
                    onChange={(e) => setFormData({ ...formData, especificacoes: e.target.value })}
                    placeholder="Ex: Intel Core i7-11700, 16GB RAM DDR4, SSD 512GB NVMe, Windows 11 Pro"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Lateral */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Localização</CardTitle>
                <CardDescription>Onde o equipamento está alocado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="laboratorio_id">Laboratório</Label>
                  <Select
                    value={formData.laboratorio_id}
                    onValueChange={(value) => setFormData({ ...formData, laboratorio_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um laboratório" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Nenhum Laboratório</SelectItem>
                      {laboratorios.map((lab) => (
                        <SelectItem key={lab.id} value={lab.id.toString()}>
                          {lab.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Foto</CardTitle>
                <CardDescription>Imagem do equipamento (máx. 2MB)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {fotoPreview ? (
                  <div className="relative">
                    <img
                      src={fotoPreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={removeFoto}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div className="mt-4">
                      <Label htmlFor="foto" className="cursor-pointer">
                        <span className="text-primary hover:underline">Clique para fazer upload</span>
                      </Label>
                      <Input
                        id="foto"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFotoChange}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" asChild>
            <Link href={`/equipamentos/${params.id}`}>Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </div>
  );
}

