'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
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
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { getXsrfToken } from '@/lib/csrf';

export default function NovoSoftwarePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    versao: '',
    fabricante: '',
    tipo_licenca: 'livre',
    quantidade_licencas: '',
    data_expiracao: '',
    descricao: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const xsrfToken = getXsrfToken();

      const dataToSend: any = {
        nome: formData.nome,
        tipo_licenca: formData.tipo_licenca,
      };

      // Adicionar campos opcionais apenas se preenchidos
      if (formData.versao) dataToSend.versao = formData.versao;
      if (formData.fabricante) dataToSend.fabricante = formData.fabricante;
      if (formData.quantidade_licencas) dataToSend.quantidade_licencas = parseInt(formData.quantidade_licencas);
      if (formData.data_expiracao) dataToSend.data_expiracao = formData.data_expiracao;
      if (formData.descricao) dataToSend.descricao = formData.descricao;

      await api.post('/softwares', dataToSend, {
        headers: {
          ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
        },
      });

      toast.success('Software criado com sucesso!');
      router.push('/softwares');
    } catch (error: any) {
      console.error('Erro ao criar software:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar software');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/softwares">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Novo Software</h1>
          <p className="text-muted-foreground">Cadastre um novo software no sistema</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>Dados principais do software</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome do Software *</Label>
                    <Input
                      id="nome"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Ex: Microsoft Office 365"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="versao">Versão</Label>
                    <Input
                      id="versao"
                      value={formData.versao}
                      onChange={(e) => setFormData({ ...formData, versao: e.target.value })}
                      placeholder="Ex: 2024"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fabricante">Fabricante</Label>
                    <Input
                      id="fabricante"
                      value={formData.fabricante}
                      onChange={(e) => setFormData({ ...formData, fabricante: e.target.value })}
                      placeholder="Ex: Microsoft"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo_licenca">Tipo de Licença *</Label>
                    <Select
                      value={formData.tipo_licenca}
                      onValueChange={(value) => setFormData({ ...formData, tipo_licenca: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="livre">Livre</SelectItem>
                        <SelectItem value="educacional">Educacional</SelectItem>
                        <SelectItem value="proprietario">Proprietário</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descrição detalhada do software e suas funcionalidades"
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
                <CardTitle>Licenciamento</CardTitle>
                <CardDescription>Informações sobre licenças</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quantidade_licencas">Quantidade de Licenças</Label>
                  <Input
                    id="quantidade_licencas"
                    type="number"
                    min="0"
                    value={formData.quantidade_licencas}
                    onChange={(e) => setFormData({ ...formData, quantidade_licencas: e.target.value })}
                    placeholder="Ex: 50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Deixe em branco para licenças ilimitadas
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_expiracao">Data de Expiração</Label>
                  <Input
                    id="data_expiracao"
                    type="date"
                    value={formData.data_expiracao}
                    onChange={(e) => setFormData({ ...formData, data_expiracao: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Opcional - para licenças temporárias
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-sm">Dica</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  Após criar o software, você poderá associá-lo a equipamentos e laboratórios
                  específicos na página de detalhes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" asChild>
            <Link href="/softwares">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Criar Software'}
          </Button>
        </div>
      </form>
    </div>
  );
}

