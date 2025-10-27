<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'active',
        'permissions',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'active' => 'boolean',
            'permissions' => 'array',
        ];
    }

    /**
     * Laboratórios onde o usuário é responsável
     */
    public function laboratorios(): HasMany
    {
        return $this->hasMany(Laboratorio::class, 'responsavel_id');
    }

    /**
     * Manutenções realizadas pelo técnico
     */
    public function manutencoes(): HasMany
    {
        return $this->hasMany(Manutencao::class, 'tecnico_id');
    }

    /**
     * Movimentações realizadas pelo usuário
     */
    public function movimentacoes(): HasMany
    {
        return $this->hasMany(HistoricoMovimentacao::class, 'usuario_id');
    }

    /**
     * Logs de atividades do usuário
     */
    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    /**
     * Verifica se o usuário é administrador
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Verifica se o usuário é técnico
     */
    public function isTecnico(): bool
    {
        return $this->role === 'tecnico';
    }

    /**
     * Verifica se o usuário é visualizador
     */
    public function isVisualizador(): bool
    {
        return $this->role === 'visualizador';
    }

    /**
     * Verifica se o usuário tem uma permissão específica
     */
    public function hasPermission(string $permission): bool
    {
        // Admin tem todas as permissões
        if ($this->isAdmin()) {
            return true;
        }

        // Verificar permissões customizadas do usuário
        if ($this->permissions && is_array($this->permissions)) {
            return in_array($permission, $this->permissions);
        }

        // Retornar false se não tiver permissão customizada
        return false;
    }

    /**
     * Concede uma permissão ao usuário
     */
    public function grantPermission(string $permission): void
    {
        $permissions = $this->permissions ?? [];
        if (!in_array($permission, $permissions)) {
            $permissions[] = $permission;
            $this->permissions = $permissions;
            $this->save();
        }
    }

    /**
     * Revoga uma permissão do usuário
     */
    public function revokePermission(string $permission): void
    {
        $permissions = $this->permissions ?? [];
        $this->permissions = array_values(array_diff($permissions, [$permission]));
        $this->save();
    }

    /**
     * Retorna todas as permissões do usuário (incluindo padrões do role)
     */
    public function getAllPermissions(): array
    {
        // Admin tem todas as permissões
        if ($this->isAdmin()) {
            return [
                'laboratorios.view', 'laboratorios.create', 'laboratorios.edit', 'laboratorios.delete',
                'equipamentos.view', 'equipamentos.create', 'equipamentos.edit', 'equipamentos.delete',
                'softwares.view', 'softwares.create', 'softwares.edit', 'softwares.delete',
                'manutencoes.view', 'manutencoes.create', 'manutencoes.edit', 'manutencoes.delete',
                'usuarios.view', 'usuarios.create', 'usuarios.edit', 'usuarios.delete',
                'relatorios.view', 'relatorios.export',
                'configuracoes.view', 'configuracoes.edit',
                'templates.view', 'templates.create', 'templates.edit', 'templates.delete',
            ];
        }

        // Retornar permissões customizadas ou padrões do role
        return $this->permissions ?? $this->getDefaultPermissionsForRole();
    }

    /**
     * Retorna permissões padrão para o role do usuário
     */
    protected function getDefaultPermissionsForRole(): array
    {
        return match($this->role) {
            'tecnico' => [
                'laboratorios.view', 'laboratorios.create', 'laboratorios.edit',
                'equipamentos.view', 'equipamentos.create', 'equipamentos.edit',
                'softwares.view', 'softwares.create', 'softwares.edit',
                'manutencoes.view', 'manutencoes.create', 'manutencoes.edit',
                'usuarios.view',
                'relatorios.view', 'relatorios.export',
                'templates.view', 'templates.create', 'templates.edit',
            ],
            'visualizador' => [
                'laboratorios.view',
                'equipamentos.view',
                'softwares.view',
                'manutencoes.view',
                'relatorios.view',
                'templates.view',
            ],
            default => [],
        };
    }
}
