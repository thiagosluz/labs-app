<?php

namespace App\Policies;

use App\Models\Laboratorio;
use App\Models\User;

class LaboratorioPolicy
{
    /**
     * Determine se o usuário pode criar laboratórios.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'tecnico']);
    }

    /**
     * Determine se o usuário pode atualizar o laboratório.
     */
    public function update(User $user, Laboratorio $laboratorio): bool
    {
        return in_array($user->role, ['admin', 'tecnico']);
    }

    /**
     * Determine se o usuário pode deletar o laboratório.
     */
    public function delete(User $user, Laboratorio $laboratorio): bool
    {
        return $user->role === 'admin';
    }
}

