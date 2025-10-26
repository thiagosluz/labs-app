'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function NovoLaboratorioPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    nome: '',
    localizacao: '',
    responsavel_id: '',
    status: 'ativo',
    descricao: '',
  });

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      const response = await api.get('/users');
      setUsuarios(response.data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = {
        ...formData,
        responsavel_id: formData.responsavel_id || null,
      };

      await api.post('/laboratorios', data);
      toast.success('Laboratório criado com sucesso!');
      router.push('/laboratorios');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar laboratório';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/laboratorios">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Novo Laboratório</h1>
          <p className="text-muted-foreground">Cadastre um novo laboratório de informática</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Laboratório</CardTitle>
          <CardDescription>Preencha os dados do laboratório</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nome">
                  Nome <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleChange('nome', e.target.value)}
                  placeholder="Ex: Laboratório 01"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="localizacao">
                  Localização <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="localizacao"
                  value={formData.localizacao}
                  onChange={(e) => handleChange('localizacao', e.target.value)}
                  placeholder="Ex: Bloco A - Sala 101"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">
                  Status <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="responsavel_id">Responsável</Label>
                <Select
                  value={formData.responsavel_id || undefined}
                  onValueChange={(value) => handleChange('responsavel_id', value)}
                >
                  <SelectTrigger id="responsavel_id">
                    <SelectValue placeholder="Selecione um responsável (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {usuarios.map((usuario) => (
                      <SelectItem key={usuario.id} value={usuario.id.toString()}>
                        {usuario.name} ({usuario.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.responsavel_id && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleChange('responsavel_id', '')}
                    className="mt-1"
                  >
                    Limpar seleção
                  </Button>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => handleChange('descricao', e.target.value)}
                  placeholder="Informações adicionais sobre o laboratório..."
                  rows={4}
                />
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" asChild>
                <Link href="/laboratorios">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Laboratório
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

