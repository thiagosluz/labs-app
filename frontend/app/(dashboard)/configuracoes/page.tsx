'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Upload, Image as ImageIcon, Palette } from 'lucide-react';
import { toast } from 'sonner';

interface SystemSettings {
  logo_path?: string;
  logo_url?: string;
  logo_enabled_in_qr?: boolean;
  logo_enabled_in_label?: boolean;
  qr_color?: string;
  qr_background?: string;
}

export default function ConfiguracoesPage() {
  const [settings, setSettings] = useState<SystemSettings>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.get('/system-settings?group=qrcode');
      
      // Converter valores para o formato correto
      const data = {
        ...response.data,
        logo_enabled_in_qr: response.data.logo_enabled_in_qr === '1' || response.data.logo_enabled_in_qr === true || response.data.logo_enabled_in_qr === 'true',
        logo_enabled_in_label: response.data.logo_enabled_in_label === '1' || response.data.logo_enabled_in_label === true || response.data.logo_enabled_in_label === 'true',
      };
      
      setSettings(data);
      
      if (response.data.logo_path) {
        const logoUrl = `http://localhost:8000/storage/${response.data.logo_path}`;
        setPreview(logoUrl);
      }
    } catch (error) {
      toast.error('Erro ao carregar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadLogo = async () => {
    if (!selectedFile) return;

    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append('logo', selectedFile);

      const response = await api.post('/system-settings/upload-logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Logo enviada com sucesso!');
      
      if (response.data.logo_url) {
        setPreview(response.data.logo_url);
      }
      
      setSelectedFile(null);
      loadSettings();
    } catch (error) {
      toast.error('Erro ao enviar logo');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Filtrar apenas as configurações que têm valores válidos
      const settingsToSave: Partial<SystemSettings> = {};
      
      if (settings.logo_enabled_in_qr !== undefined) {
        settingsToSave.logo_enabled_in_qr = settings.logo_enabled_in_qr;
      }
      if (settings.logo_enabled_in_label !== undefined) {
        settingsToSave.logo_enabled_in_label = settings.logo_enabled_in_label;
      }
      if (settings.qr_color !== undefined && settings.qr_color.trim() !== '') {
        settingsToSave.qr_color = settings.qr_color;
      }
      if (settings.qr_background !== undefined && settings.qr_background.trim() !== '') {
        settingsToSave.qr_background = settings.qr_background;
      }
      
      await api.post('/system-settings', settingsToSave);
      toast.success('Configurações salvas com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar:', error.response?.data);
      toast.error(error.response?.data?.message || 'Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
        <p className="text-muted-foreground">Configure logos e aparência dos QR codes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logo da Instituição</CardTitle>
          <CardDescription>
            Faça upload da logo do IFG para exibição em QR codes e etiquetas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {preview && (
            <div className="flex justify-center p-4 bg-muted rounded-lg">
              <img src={preview} alt="Logo" className="max-h-32" />
            </div>
          )}
          
          <div className="flex items-center gap-4">
            <Label htmlFor="logo-upload" className="cursor-pointer">
              <Input
                id="logo-upload"
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button type="button" asChild>
                <label htmlFor="logo-upload" className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  Escolher Logo
                </label>
              </Button>
            </Label>
            
            {selectedFile && (
              <Button onClick={handleUploadLogo} disabled={isSaving}>
                Enviar Logo
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="logo-in-qr">Incluir logo no QR Code</Label>
              <p className="text-sm text-muted-foreground">
                Logo será exibida no centro do QR code
              </p>
            </div>
            <Switch
              id="logo-in-qr"
              checked={settings.logo_enabled_in_qr || false}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, logo_enabled_in_qr: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="logo-in-label">Incluir logo na etiqueta</Label>
              <p className="text-sm text-muted-foreground">
                Logo será exibida na etiqueta de impressão
              </p>
            </div>
            <Switch
              id="logo-in-label"
              checked={settings.logo_enabled_in_label || false}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, logo_enabled_in_label: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Cores dos QR Codes
          </CardTitle>
          <CardDescription>
            Personalize as cores dos QR codes gerados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qr-color">Cor do QR Code</Label>
            <div className="flex items-center gap-2">
              <Input
                id="qr-color"
                type="color"
                value={settings.qr_color || '#000000'}
                onChange={(e) => setSettings({ ...settings, qr_color: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={settings.qr_color || '#000000'}
                onChange={(e) => setSettings({ ...settings, qr_color: e.target.value })}
                placeholder="#000000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qr-background">Cor de Fundo</Label>
            <div className="flex items-center gap-2">
              <Input
                id="qr-background"
                type="color"
                value={settings.qr_background || '#FFFFFF'}
                onChange={(e) => setSettings({ ...settings, qr_background: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={settings.qr_background || '#FFFFFF'}
                onChange={(e) => setSettings({ ...settings, qr_background: e.target.value })}
                placeholder="#FFFFFF"
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


