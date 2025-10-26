<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AgentApiKey extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'key',
        'active',
        'version',
        'laboratorio_id',
        'last_used_at',
        'last_ip',
        'last_hostname',
        'created_by',
    ];

    protected $casts = [
        'active' => 'boolean',
        'last_used_at' => 'datetime',
    ];

    /**
     * Gerar chave aleatória segura (64 caracteres)
     */
    public static function generateKey(): string
    {
        return bin2hex(random_bytes(32));
    }

    /**
     * Relacionamento: Criador da chave
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Relacionamento: Laboratório
     */
    public function laboratorio()
    {
        return $this->belongsTo(Laboratorio::class);
    }

    /**
     * Scope: Apenas chaves ativas
     */
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    /**
     * Marcar como usado
     */
    public function markAsUsed(string $ip, string $hostname): void
    {
        $this->update([
            'last_used_at' => now(),
            'last_ip' => $ip,
            'last_hostname' => $hostname,
        ]);
    }
}

