'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Manutencao, PaginatedResponse } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { Plus, Wrench, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ManutencoesPage() {
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  useEffect(() => {
    loadManutencoes();
  }, []);

  const loadManutencoes = async () => {
    try {
      const response = await api.get<PaginatedResponse<Manutencao>>('/manutencoes');
      setManutencoes(response.data.data);
    } catch (error) {
      toast.error('Erro ao carregar manutenções');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelection = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === manutencoes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(manutencoes.map(manutencao => manutencao.id));
    }
  };

  const handleBulkDelete = async () => {
    setIsDeletingBulk(true);
    try {
      const response = await api.post('/manutencoes/bulk-destroy', { ids: selectedIds });
      toast.success(response.data.message);
      setSelectedIds([]);
      setShowBulkDeleteDialog(false);
      loadManutencoes();
    } catch (error) {
      toast.error('Erro ao deletar manutenções');
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      pendente: { variant: 'outline', label: 'Pendente' },
      em_andamento: { variant: 'secondary', label: 'Em Andamento' },
      concluida: { variant: 'default', label: 'Concluída' },
      cancelada: { variant: 'destructive', label: 'Cancelada' },
    };
    const config = variants[status] || { variant: 'default' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manutenções</h1>
          <p className="text-muted-foreground">Gerencie as manutenções de equipamentos</p>
        </div>
        <Button asChild>
          <Link href="/manutencoes/nova">
            <Plus className="mr-2 h-4 w-4" />
            Nova Manutenção
          </Link>
        </Button>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-4">
          <Button
            variant="destructive"
            onClick={() => setShowBulkDeleteDialog(true)}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Deletar Selecionados ({selectedIds.length})
          </Button>
        </div>
      )}

      {isLoading ? (
        <div>Carregando...</div>
      ) : (
        <>
          {/* Estado vazio */}
          {manutencoes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Wrench className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhuma manutenção registrada</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Comece registrando sua primeira manutenção
              </p>
              <Button asChild>
                <Link href="/manutencoes/nova">
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Manutenção
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === manutencoes.length && manutencoes.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Equipamento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Técnico</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {manutencoes.map((manutencao) => (
                <TableRow key={manutencao.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(manutencao.id)}
                      onCheckedChange={() => toggleSelection(manutencao.id)}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(manutencao.data).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="font-medium">{manutencao.equipamento?.nome}</TableCell>
                  <TableCell>
                    <Badge variant={manutencao.tipo === 'preventiva' ? 'default' : 'secondary'}>
                      {manutencao.tipo === 'preventiva' ? 'Preventiva' : 'Corretiva'}
                    </Badge>
                  </TableCell>
                  <TableCell>{manutencao.tecnico?.name || '-'}</TableCell>
                  <TableCell>{getStatusBadge(manutencao.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/manutencoes/${manutencao.id}`}>
                        <Wrench className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
            </div>
          )}
        </>
      )}

      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Deleção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar {selectedIds.length} manutenção(ões) selecionada(s)? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isDeletingBulk}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingBulk ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deletando...
                </>
              ) : (
                'Deletar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

