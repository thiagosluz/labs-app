'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Laboratorio, PaginatedResponse } from '@/lib/types';
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
import { Plus, Search, Edit, Trash2, MapPin, User, Eye, CheckSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function LaboratoriosPage() {
  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [labToDelete, setLabToDelete] = useState<Laboratorio | null>(null);

  useEffect(() => {
    loadLaboratorios();
  }, []);

  const loadLaboratorios = async () => {
    try {
      const response = await api.get<PaginatedResponse<Laboratorio>>('/laboratorios');
      setLaboratorios(response.data.data);
    } catch (error) {
      toast.error('Erro ao carregar laboratórios');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLabs = laboratorios.filter(lab =>
    lab.nome.toLowerCase().includes(search.toLowerCase()) ||
    lab.localizacao.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteClick = (lab: Laboratorio) => {
    setLabToDelete(lab);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!labToDelete) return;

    setDeletingId(labToDelete.id);
    try {
      await api.delete(`/laboratorios/${labToDelete.id}`);
      toast.success('Laboratório excluído com sucesso!');
      loadLaboratorios();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao excluir laboratório';
      toast.error(message);
    } finally {
      setDeletingId(null);
      setShowDeleteDialog(false);
      setLabToDelete(null);
    }
  };

  const toggleSelection = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === laboratorios.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(laboratorios.map(lab => lab.id));
    }
  };

  const handleBulkDelete = async () => {
    setIsDeletingBulk(true);
    try {
      const response = await api.post('/laboratorios/bulk-destroy', { ids: selectedIds });
      toast.success(response.data.message);
      setSelectedIds([]);
      setShowBulkDeleteDialog(false);
      loadLaboratorios();
    } catch (error) {
      toast.error('Erro ao deletar laboratórios');
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      ativo: 'default',
      inativo: 'secondary',
      manutencao: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Laboratórios</h1>
          <p className="text-muted-foreground">Gerencie os laboratórios de informática</p>
        </div>
        <Button asChild>
          <Link href="/laboratorios/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Laboratório
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar laboratórios..."
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
        <div>Carregando...</div>
      ) : (
        <>
          {laboratorios.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <Checkbox
                checked={selectedIds.length === laboratorios.length && laboratorios.length > 0}
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                Selecionar todos ({laboratorios.length})
              </span>
            </div>
          )}
          {/* Estado vazio */}
          {laboratorios.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <MapPin className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum laboratório cadastrado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Comece adicionando seu primeiro laboratório
              </p>
              <Button asChild>
                <Link href="/laboratorios/novo">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Laboratório
                </Link>
              </Button>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredLabs.map((lab) => (
            <Card key={lab.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle>{lab.nome}</CardTitle>
                    {getStatusBadge(lab.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedIds.includes(lab.id)}
                      onCheckedChange={() => toggleSelection(lab.id)}
                    />
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" asChild title="Ver detalhes">
                        <Link href={`/laboratorios/${lab.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild title="Editar">
                        <Link href={`/laboratorios/${lab.id}/editar`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Excluir"
                        onClick={() => handleDeleteClick(lab)}
                        disabled={deletingId === lab.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">ID:</span>
                    <Badge variant="secondary" className="font-mono">
                      {lab.id}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{lab.localizacao}</span>
                  </div>
                  {lab.responsavel && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{lab.responsavel.name}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-sm font-medium">Equipamentos:</span>
                    <span className="text-sm">{lab.equipamentos?.length || 0}</span>
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/laboratorios/${lab.id}`}>
                      Ver Detalhes
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        </>
      )}

      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Deleção em Massa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar {selectedIds.length} laboratório(s) selecionado(s)? 
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o laboratório "{labToDelete?.nome}"? Esta ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

