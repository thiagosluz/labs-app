'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Software, PaginatedResponse } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Plus, Search, Package, ChevronLeft, ChevronRight, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  try {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return dateString;
  }
};

export default function SoftwaresPage() {
  const [softwares, setSoftwares] = useState<Software[]>([]);
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
    loadSoftwares();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadSoftwares();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [search]);

  const loadSoftwares = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await api.get<PaginatedResponse<Software>>('/softwares', {
        params: {
          page,
          per_page: 20,
          search: search || undefined,
        },
      });
      setSoftwares(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
      });
    } catch (error) {
      toast.error('Erro ao carregar softwares');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    loadSoftwares(page);
  };

  const toggleSelection = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === softwares.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(softwares.map(software => software.id));
    }
  };

  const handleBulkDelete = async () => {
    setIsDeletingBulk(true);
    try {
      const response = await api.post('/softwares/bulk-destroy', { ids: selectedIds });
      toast.success(response.data.message);
      setSelectedIds([]);
      setShowBulkDeleteDialog(false);
      loadSoftwares(pagination.current_page);
    } catch (error) {
      toast.error('Erro ao deletar softwares');
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const getLicencaBadge = (tipo: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'outline', label: string }> = {
      livre: { variant: 'default', label: 'Livre' },
      educacional: { variant: 'secondary', label: 'Educacional' },
      proprietario: { variant: 'outline', label: 'Proprietário' },
    };
    const config = variants[tipo] || { variant: 'default' as const, label: tipo };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Softwares</h1>
          <p className="text-muted-foreground">Gerencie os softwares instalados</p>
        </div>
        <Button asChild>
          <Link href="/softwares/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Software
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar softwares..."
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
          {softwares.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <Checkbox
                checked={selectedIds.length === softwares.length && softwares.length > 0}
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                Selecionar todos ({softwares.length})
              </span>
            </div>
          )}

          {/* Estado vazio */}
          {softwares.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum software cadastrado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Comece adicionando seu primeiro software
              </p>
              <Button asChild>
                <Link href="/softwares/novo">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Software
                </Link>
              </Button>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {softwares.map((sw) => (
              <Card key={sw.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        {sw.nome}
                      </CardTitle>
                      {getLicencaBadge(sw.tipo_licenca)}
                    </div>
                    <Checkbox
                      checked={selectedIds.includes(sw.id)}
                      onCheckedChange={() => toggleSelection(sw.id)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Versão:</span>
                      <span className="font-medium">{sw.versao || '-'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fabricante:</span>
                      <span className="font-medium">{sw.fabricante || '-'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Instalações:</span>
                      <span className="font-medium">{sw.equipamentos_count || 0}</span>
                    </div>
                    {sw.data_expiracao && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Expira em:</span>
                        <span className="font-medium">{formatDate(sw.data_expiracao)}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/softwares/${sw.id}`}>
                        Ver Detalhes
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Paginação */}
          {pagination.last_page > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando {((pagination.current_page - 1) * pagination.per_page) + 1} a{' '}
                {Math.min(pagination.current_page * pagination.per_page, pagination.total)} de{' '}
                {pagination.total} softwares
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
              Tem certeza que deseja deletar {selectedIds.length} software(s) selecionado(s)? 
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