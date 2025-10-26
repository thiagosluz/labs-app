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
}
