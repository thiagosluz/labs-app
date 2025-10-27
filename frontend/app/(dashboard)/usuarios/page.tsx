'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
import { Plus, Search, Edit, Eye, Trash2, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    loadUsuarios();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadUsuarios();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [search]);

  const loadUsuarios = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<User[]>('/users', {
        params: {
          search: search || undefined,
        },
      });
      setUsuarios(response.data);
    } catch (error) {
      toast.error('Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (userId: number) => {
    setIsToggling(true);
    try {
      const response = await api.post(`/users/${userId}/toggle-status`);
      toast.success(response.data.message || 'Status alterado com sucesso');
      loadUsuarios();
    } catch (error) {
      toast.error('Erro ao alterar status do usuário');
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/users/${selectedId}`);
      toast.success('Usuário deletado com sucesso');
      setShowDeleteDialog(false);
      setSelectedId(null);
      loadUsuarios();
    } catch (error) {
      toast.error('Erro ao deletar usuário');
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (userId: number) => {
    setSelectedId(userId);
    setShowDeleteDialog(true);
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'outline', label: string }> = {
      admin: { variant: 'default', label: 'Admin' },
      tecnico: { variant: 'secondary', label: 'Técnico' },
      visualizador: { variant: 'outline', label: 'Visualizador' },
    };
    const config = variants[role] || { variant: 'default' as const, label: role };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (active: boolean) => {
    return (
      <Badge variant={active ? 'default' : 'secondary'}>
        {active ? 'Ativo' : 'Inativo'}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Usuários</h1>
        <Link href="/usuarios/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </Link>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {usuarios.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="rounded-full bg-muted p-6">
            <Plus className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold">Nenhum usuário encontrado</h3>
            <p className="text-sm text-muted-foreground mt-2">
              {search ? 'Tente ajustar os filtros de busca' : 'Comece criando seu primeiro usuário'}
            </p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell className="font-medium">{usuario.name}</TableCell>
                  <TableCell>{usuario.email}</TableCell>
                  <TableCell>{getRoleBadge(usuario.role)}</TableCell>
                  <TableCell>{getStatusBadge(usuario.active)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/usuarios/${usuario.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/usuarios/${usuario.id}/editar`}>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(usuario.id)}
                        disabled={isToggling}
                      >
                        {usuario.active ? (
                          <UserX className="h-4 w-4" />
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(usuario.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
