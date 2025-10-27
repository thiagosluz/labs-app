'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Copy, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface LabelTemplate {
  id: number;
  name: string;
  width: number;
  height: number;
  qr_size: number;
  qr_position: string;
  show_logo: boolean;
  logo_position: string | null;
  fields: string[];
  styles: any;
  is_default: boolean;
  is_active: boolean;
}

export default function TemplatesEtiquetasPage() {
  const [templates, setTemplates] = useState<LabelTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await api.get('/label-templates');
      setTemplates(response.data);
    } catch (error) {
      toast.error('Erro ao carregar templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await api.post(`/label-templates/${id}/set-default`);
      toast.success('Template definido como padrão!');
      loadTemplates();
    } catch (error) {
      toast.error('Erro ao definir template padrão');
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      await api.post(`/label-templates/${id}/duplicate`);
      toast.success('Template duplicado com sucesso!');
      loadTemplates();
    } catch (error) {
      toast.error('Erro ao duplicar template');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar este template?')) return;

    try {
      await api.delete(`/label-templates/${id}`);
      toast.success('Template deletado com sucesso!');
      loadTemplates();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao deletar template');
    }
  };

  const getTamanhoLabel = (width: number, height: number) => {
    if (width >= 10 || height >= 5) return 'Grande';
    if (width >= 8 || height >= 4) return 'Médio';
    return 'Compacto';
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Templates de Etiquetas</h1>
          <p className="text-muted-foreground">Gerencie templates de etiquetas de equipamentos</p>
        </div>
        <Button asChild>
          <Link href="/templates-etiquetas/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Template
          </Link>
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Nenhum template cadastrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {template.name}
                      {template.is_default && (
                        <Badge variant="default">
                          <Star className="h-3 w-3 mr-1" />
                          Padrão
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {template.width}cm x {template.height}cm
                      {' • '}
                      {getTamanhoLabel(template.width, template.height)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p>QR Code: {template.qr_size}cm</p>
                  <p>Posição QR: {template.qr_position === 'left' ? 'Esquerda' : 'Direita'}</p>
                  <p>Campos: {template.fields?.join(', ') || 'Nenhum'}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!template.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(template.id)}
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Definir Padrão
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicate(template.id)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Duplicar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link href={`/templates-etiquetas/${template.id}/editar`}>
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Link>
                  </Button>
                  {!template.is_default && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Deletar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


