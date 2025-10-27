'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';

export default function EditarUsuarioPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [usuario, setUsuario] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'tecnico',
    active: true,
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    loadUsuario();
  }, [params.id]);

  const loadUsuario = async () => {
    try {
      const response = await api.get<User>(`/users/${params.id}`);
      setUsuario(response.data);
      setFormData({
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
        active: response.data.active,
        password: '',
        password_confirmation: '',
      });
    } catch (error) {
      toast.error('Erro ao carregar usuário');
      router.push('/usuarios');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        active: formData.active,
      };

      // Incluir senha apenas se foi preenchida
      if (formData.password) {
        data.password = formData.password;
        data.password_confirmation = formData.password_confirmation;
      }

      await api.put(`/users/${params.id}`, data);
      toast.success('Usuário atualizado com sucesso!');
      router.push('/usuarios');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao atualizar usuário';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/usuarios/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Usuário</h1>
          <p className="text-muted-foreground">Atualize as informações do usuário</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Usuário</CardTitle>
          <CardDescription>Atualize os dados do usuário</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">
                  Nome <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Ex: João da Silva"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Ex: joao@ifg.edu.br"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Deixe vazio para manter"
                  minLength={8}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirmation">Confirmar Nova Senha</Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  value={formData.password_confirmation}
                  onChange={(e) => handleChange('password_confirmation', e.target.value)}
                  placeholder="Digite novamente"
                  minLength={8}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">
                  Cargo <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleChange('role', value)}
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="tecnico">Técnico</SelectItem>
                    <SelectItem value="visualizador">Visualizador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="active">Status</Label>
                <Select
                  value={formData.active ? 'true' : 'false'}
                  onValueChange={(value) => handleChange('active', value === 'true')}
                >
                  <SelectTrigger id="active">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Ativo</SelectItem>
                    <SelectItem value="false">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" asChild>
                <Link href={`/usuarios/${params.id}`}>Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
