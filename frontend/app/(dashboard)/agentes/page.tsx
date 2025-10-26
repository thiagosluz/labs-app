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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Download, Plus, Power, PowerOff, Copy, Check, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getXsrfToken } from '@/lib/csrf';

interface AgentApiKey {
  id: number;
  name: string;
  key: string;
  active: boolean;
  version: string | null;
  laboratorio_id: number | null;
  last_used_at: string | null;
  last_ip: string | null;
  last_hostname: string | null;
  created_at: string;
  creator: {
    id: number;
    name: string;
  };
  laboratorio: {
    id: number;
    nome: string;
  } | null;
}

interface Laboratorio {
  id: number;
  nome: string;
}

export default function AgentesPage() {
  const [agents, setAgents] = useState<AgentApiKey[]>([]);
  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newAgentKey, setNewAgentKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  // Formulário de nova chave
  const [formData, setFormData] = useState({
    name: '',
    laboratorio_id: '0',
  });

  useEffect(() => {
    loadAgents();
    loadLaboratorios();
  }, []);

  const loadAgents = async () => {
    try {
      const response = await api.get('/agent-management');
      setAgents(response.data);
    } catch (error) {
      toast.error('Erro ao carregar agentes');
    } finally {
      setLoading(false);
    }
  };

  const loadLaboratorios = async () => {
    try {
      const response = await api.get('/laboratorios');
      // Garantir que sempre seja um array
      const data = Array.isArray(response.data) ? response.data : [];
      setLaboratorios(data);
    } catch (error) {
      console.error('Erro ao carregar laboratórios');
      setLaboratorios([]); // Define como array vazio em caso de erro
    }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();

    const toastId = toast.loading('Gerando API Key...');

    try {
      const xsrfToken = getXsrfToken();
      
      const data = {
        name: formData.name,
        laboratorio_id: formData.laboratorio_id !== '0' ? parseInt(formData.laboratorio_id) : null,
      };

      const response = await api.post('/agent-management', data, {
        headers: {
          ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
        },
      });

      setNewAgentKey(response.data.api_key);
      toast.success('API Key gerada com sucesso!', {
        id: toastId,
        description: 'Copie a chave agora, ela não será exibida novamente',
      });

      loadAgents();
    } catch (error: any) {
      toast.error('Erro ao gerar API Key', {
        id: toastId,
        description: error.response?.data?.message || 'Tente novamente',
      });
    }
  };

  const handleCopyKey = () => {
    if (newAgentKey) {
      navigator.clipboard.writeText(newAgentKey);
      setCopiedKey(true);
      toast.success('API Key copiada para a área de transferência!');
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewAgentKey(null);
    setCopiedKey(false);
    setFormData({ name: '', laboratorio_id: '0' });
  };

  const handleToggleActive = async (agent: AgentApiKey) => {
    const toastId = toast.loading(agent.active ? 'Desativando...' : 'Reativando...');

    try {
      const xsrfToken = getXsrfToken();

      if (agent.active) {
        await api.delete(`/agent-management/${agent.id}`, {
          headers: {
            ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
          },
        });
      } else {
        await api.post(`/agent-management/${agent.id}/reactivate`, {}, {
          headers: {
            ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
          },
        });
      }

      toast.success(agent.active ? 'Agente desativado' : 'Agente reativado', { id: toastId });
      loadAgents();
    } catch (error) {
      toast.error('Erro ao atualizar agente', { id: toastId });
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      const response = await api.get('/agent-management/download', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'LabAgent-Setup.exe');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Download iniciado!');
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('Agente não disponível', {
          description: 'O executável do agente ainda não foi compilado',
        });
      } else {
        toast.error('Erro ao fazer download');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const toggleSelection = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === agents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(agents.map(agent => agent.id));
    }
  };

  const handleBulkDeactivate = async () => {
    setIsDeletingBulk(true);
    try {
      const response = await api.post('/agent-management/bulk-destroy', { ids: selectedIds });
      toast.success(response.data.message);
      setSelectedIds([]);
      setShowBulkDeleteDialog(false);
      loadAgents();
    } catch (error) {
      toast.error('Erro ao desativar agentes');
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Agentes</h1>
          <p className="text-muted-foreground">
            Gerencie as API Keys dos agentes de coleta automática
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDownload} variant="outline" disabled={isDownloading}>
            {isDownloading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Baixando...</>
            ) : (
              <><Download className="mr-2 h-4 w-4" />Download do Agente</>
            )}
          </Button>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Gerar Nova API Key
          </Button>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-4">
          <Button
            variant="destructive"
            onClick={() => setShowBulkDeleteDialog(true)}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Desativar Selecionados ({selectedIds.length})
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>API Keys Cadastradas</CardTitle>
          <CardDescription>
            {agents.length} {agents.length === 1 ? 'chave registrada' : 'chaves registradas'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {agents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Download className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum agente cadastrado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Comece gerando uma API Key para seu primeiro agente
              </p>
              <Button onClick={() => setShowModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Gerar Nova API Key
              </Button>
            </div>
          ) : (
            <div>
              {agents.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <Checkbox
                    checked={selectedIds.length === agents.length && agents.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">
                    Selecionar todos ({agents.length})
                  </span>
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Laboratório</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Último Uso</TableHead>
                    <TableHead>Último Host</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(agent.id)}
                          onCheckedChange={() => toggleSelection(agent.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{agent.name}</TableCell>
                      <TableCell>
                        {agent.laboratorio ? agent.laboratorio.nome : 'Não definido'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={agent.active ? 'default' : 'secondary'}>
                          {agent.active ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(agent.last_used_at)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {agent.last_hostname || '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(agent)}
                        >
                          {agent.active ? (
                            <>
                              <PowerOff className="h-4 w-4 mr-1" />
                              Desativar
                            </>
                          ) : (
                            <>
                              <Power className="h-4 w-4 mr-1" />
                              Reativar
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para gerar nova API Key */}
      <Dialog open={showModal} onOpenChange={handleCloseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {newAgentKey ? 'API Key Gerada!' : 'Gerar Nova API Key'}
            </DialogTitle>
            <DialogDescription>
              {newAgentKey
                ? 'Copie esta chave agora. Por segurança, ela não será exibida novamente.'
                : 'Preencha os dados para gerar uma nova API Key para o agente.'}
            </DialogDescription>
          </DialogHeader>

          {newAgentKey ? (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <Label>API Key</Label>
                <div className="flex items-center gap-2 mt-2">
                  <code className="flex-1 p-2 bg-background rounded border text-sm break-all">
                    {newAgentKey}
                  </code>
                  <Button size="sm" variant="outline" onClick={handleCopyKey}>
                    {copiedKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>✓ Cole esta chave no agente durante a instalação</p>
                <p>✓ Guarde a chave em local seguro</p>
                <p>⚠️ Esta é a única vez que a chave completa será exibida</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateAgent} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Agente*</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Lab 01 - PC 05"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="laboratorio">Laboratório (opcional)</Label>
                <Select
                  value={formData.laboratorio_id}
                  onValueChange={(value) => setFormData({ ...formData, laboratorio_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Nenhum</SelectItem>
                    {Array.isArray(laboratorios) && laboratorios.map((lab) => (
                      <SelectItem key={lab.id} value={lab.id.toString()}>
                        {lab.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button type="submit">Gerar API Key</Button>
              </DialogFooter>
            </form>
          )}

          {newAgentKey && (
            <DialogFooter>
              <Button onClick={handleCloseModal}>Fechar</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Desativação em Massa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar {selectedIds.length} agente(s) selecionado(s)? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDeactivate}
              disabled={isDeletingBulk}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingBulk ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Desativando...
                </>
              ) : (
                'Desativar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

