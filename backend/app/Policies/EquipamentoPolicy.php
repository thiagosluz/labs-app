<?php

namespace App\Policies;

use App\Models\Equipamento;
use App\Models\User;

class EquipamentoPolicy
{
    /**
     * Determine se o usuário pode visualizar o equipamento.
     */
    public function view(User $user, Equipamento $equipamento): bool
    {
        // Permitir visualização para todos os usuários autenticados
        return true;
    }

    /**
     * Determine se o usuário pode criar equipamentos.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'tecnico']);
    }

    /**
     * Determine se o usuário pode atualizar o equipamento.
     */
    public function update(User $user, Equipamento $equipamento): bool
    {
        return in_array($user->role, ['admin', 'tecnico']);
    }

    /**
     * Determine se o usuário pode deletar o equipamento.
     */
    public function delete(User $user, Equipamento $equipamento): bool
    {
        return $user->role === 'admin';
    }
}

