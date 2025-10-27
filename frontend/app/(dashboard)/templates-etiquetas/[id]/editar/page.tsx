'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
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

export default function EditarTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const [template, setTemplate] = useState<LabelTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    width: 10,
    height: 5,
    qr_size: 4,
    qr_position: 'left',
    show_logo: false,
    logo_position: 'top',
    fields: ['patrimonio', 'numero_serie', 'laboratorio', 'id', 'tipo'],
    styles: {
      header_color: '#22c55e',
      font_size_name: 14,
      font_size_detail: 9,
      padding: 10,
    },
  });

  useEffect(() => {
    if (params.id) {
      loadTemplate();
    }
  }, [params.id]);

  const loadTemplate = async () => {
    try {
      const response = await api.get(`/label-templates/${params.id}`);
      const data = response.data;
      
      setTemplate(data);
      setFormData({
        name: data.name,
        width: data.width,
        height: data.height,
        qr_size: data.qr_size || 4,
        qr_position: data.qr_position || 'left',
        show_logo: data.show_logo || false,
        logo_position: data.logo_position || 'top',
        fields: data.fields || [],
        styles: data.styles || {},
      });
    } catch (error) {
      toast.error('Erro ao carregar template');
      router.push('/templates-etiquetas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await api.put(`/label-templates/${params.id}`, formData);
      toast.success('Template atualizado com sucesso!');
      router.push('/templates-etiquetas');
    } catch (error) {
      toast.error('Erro ao atualizar template');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleField = (field: string) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.includes(field)
        ? prev.fields.filter(f => f !== field)
        : [...prev.fields, field],
    }));
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/templates-etiquetas">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Template de Etiqueta</h1>
          <p className="text-muted-foreground">Personalize o template {template?.name}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>Configure o tamanho e layout do template</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Template</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Largura (cm)</Label>
                <Input
                  id="width"
                  type="number"
                  min="3"
                  max="20"
                  step="0.5"
                  value={formData.width}
                  onChange={(e) => setFormData({ ...formData, width: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Altura (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  min="2"
                  max="15"
                  step="0.5"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qr_size">Tamanho do QR Code (cm)</Label>
              <Input
                id="qr_size"
                type="number"
                min="2"
                max="6"
                step="0.5"
                value={formData.qr_size}
                onChange={(e) => setFormData({ ...formData, qr_size: parseFloat(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qr_position">Posição do QR Code</Label>
              <Select
                value={formData.qr_position}
                onValueChange={(value) => setFormData({ ...formData, qr_position: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Esquerda</SelectItem>
                  <SelectItem value="right">Direita</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campos a Exibir</CardTitle>
            <CardDescription>Selecione quais informações aparecerão na etiqueta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {['patrimonio', 'numero_serie', 'laboratorio', 'id', 'tipo'].map((field) => (
              <div key={field} className="flex items-center space-x-2">
                <Checkbox
                  id={field}
                  checked={formData.fields.includes(field)}
                  onCheckedChange={() => toggleField(field)}
                />
                <Label htmlFor={field} className="cursor-pointer">
                  {field === 'patrimonio' && 'Patrimônio'}
                  {field === 'numero_serie' && 'Número de Série'}
                  {field === 'laboratorio' && 'Laboratório'}
                  {field === 'id' && 'ID'}
                  {field === 'tipo' && 'Tipo'}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Estilo</CardTitle>
            <CardDescription>Personalize cores e fontes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="header_color">Cor do Cabeçalho</Label>
                <Input
                  id="header_color"
                  type="color"
                  value={formData.styles.header_color || '#22c55e'}
                  onChange={(e) => setFormData({
                    ...formData,
                    styles: { ...formData.styles, header_color: e.target.value }
                  })}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="font_size_name">Tamanho Fonte Nome</Label>
                <Input
                  id="font_size_name"
                  type="number"
                  min="10"
                  max="20"
                  value={formData.styles.font_size_name || 14}
                  onChange={(e) => setFormData({
                    ...formData,
                    styles: { ...formData.styles, font_size_name: parseInt(e.target.value) }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="font_size_detail">Tamanho Fonte Detalhes</Label>
                <Input
                  id="font_size_detail"
                  type="number"
                  min="6"
                  max="12"
                  value={formData.styles.font_size_detail || 9}
                  onChange={(e) => setFormData({
                    ...formData,
                    styles: { ...formData.styles, font_size_detail: parseInt(e.target.value) }
                  })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" asChild>
          <Link href="/templates-etiquetas">Cancelar</Link>
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Salvando...' : 'Salvar Template'}
        </Button>
      </div>
    </div>
  );
}


