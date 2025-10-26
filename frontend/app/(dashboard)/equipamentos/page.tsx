'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Equipamento, PaginatedResponse } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Plus, Search, Edit, Eye, ChevronLeft, ChevronRight, Loader2, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function EquipamentosPage() {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  });

  useEffect(() => {
    loadEquipamentos();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadEquipamentos();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [search]);

  const loadEquipamentos = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await api.get<PaginatedResponse<Equipamento>>('/equipamentos', {
        params: {
          page,
          per_page: 20,
          search: search || undefined,
        },
      });
      setEquipamentos(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
      });
    } catch (error) {
      toast.error('Erro ao carregar equipamentos');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    loadEquipamentos(page);
  };

  const toggleSelection = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === equipamentos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(equipamentos.map(equipamento => equipamento.id));
    }
  };

  const handleBulkDelete = async () => {
    setIsDeletingBulk(true);
    try {
      const response = await api.post('/equipamentos/bulk-destroy', { ids: selectedIds });
      toast.success(response.data.message);
      setSelectedIds([]);
      setShowBulkDeleteDialog(false);
      loadEquipamentos(pagination.current_page);
    } catch (error) {
      toast.error('Erro ao deletar equipamentos');
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      em_uso: { variant: 'default', label: 'Em Uso' },
      reserva: { variant: 'secondary', label: 'Reserva' },
      manutencao: { variant: 'destructive', label: 'Manutenção' },
      descartado: { variant: 'outline', label: 'Descartado' },
    };
    const config = variants[estado] || { variant: 'default' as const, label: estado };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTipoLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      computador: 'Computador',
      projetor: 'Projetor',
      roteador: 'Roteador',
      switch: 'Switch',
      impressora: 'Impressora',
      scanner: 'Scanner',
      outro: 'Outro',
    };
    return tipos[tipo] || tipo;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Equipamentos</h1>
          <p className="text-muted-foreground">Gerencie todos os equipamentos</p>
        </div>
        <Button asChild>
          <Link href="/equipamentos/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Equipamento
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, patrimônio ou número de série..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        {selectedIds.length > 0 && (
          <Button
            variant="destructive"
            onClick={() => setShowBulkDeleteDialog(true)}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Deletar Selecionados ({selectedIds.length})
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length === equipamentos.length && equipamentos.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Patrimônio</TableHead>
                  <TableHead>Laboratório</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipamentos.map((equipamento) => (
                  <TableRow key={equipamento.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(equipamento.id)}
                        onCheckedChange={() => toggleSelection(equipamento.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{equipamento.nome}</TableCell>
                    <TableCell>{getTipoLabel(equipamento.tipo)}</TableCell>
                    <TableCell>{equipamento.patrimonio || '-'}</TableCell>
                    <TableCell>{equipamento.laboratorio?.nome || '-'}</TableCell>
                    <TableCell>{getEstadoBadge(equipamento.estado)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/equipamentos/${equipamento.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/equipamentos/${equipamento.id}/editar`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Estado vazio */}
          {equipamentos.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum equipamento cadastrado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Comece adicionando seu primeiro equipamento
              </p>
              <Button asChild>
                <Link href="/equipamentos/novo">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Equipamento
                </Link>
              </Button>
            </div>
          )}

          {/* Paginação */}
          {pagination.last_page > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando {((pagination.current_page - 1) * pagination.per_page) + 1} a{' '}
                {Math.min(pagination.current_page * pagination.per_page, pagination.total)} de{' '}
                {pagination.total} equipamentos
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={pagination.current_page === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Deleção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar {selectedIds.length} equipamento(s) selecionado(s)? 
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