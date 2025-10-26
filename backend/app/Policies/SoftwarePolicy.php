<?php

namespace App\Policies;

use App\Models\Software;
use App\Models\User;

class SoftwarePolicy
{
    /**
     * Determine se o usuário pode criar softwares.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'tecnico']);
    }

    /**
     * Determine se o usuário pode atualizar o software.
     */
    public function update(User $user, Software $software): bool
    {
        return in_array($user->role, ['admin', 'tecnico']);
    }

    /**
     * Determine se o usuário pode deletar o software.
     */
    public function delete(User $user, Software $software): bool
    {
        return $user->role === 'admin';
    }
}

