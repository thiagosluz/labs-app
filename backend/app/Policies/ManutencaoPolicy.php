<?php

namespace App\Policies;

use App\Models\Manutencao;
use App\Models\User;

class ManutencaoPolicy
{
    /**
     * Determine se o usuário pode criar manutenções.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'tecnico']);
    }

    /**
     * Determine se o usuário pode atualizar a manutenção.
     */
    public function update(User $user, Manutencao $manutencao): bool
    {
        return in_array($user->role, ['admin', 'tecnico']);
    }

    /**
     * Determine se o usuário pode deletar a manutenção.
     */
    public function delete(User $user, Manutencao $manutencao): bool
    {
        return $user->role === 'admin';
    }
}

