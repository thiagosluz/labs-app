<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Software extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'softwares';

    protected $fillable = [
        'nome',
        'versao',
        'fabricante',
        'tipo_licenca',
        'quantidade_licencas',
        'data_expiracao',
        'descricao',
        // Campos do agente
        'data_instalacao',
        'chave_licenca',
        'detectado_por_agente',
    ];

    protected $casts = [
        'quantidade_licencas' => 'integer',
        'data_expiracao' => 'date',
        'data_instalacao' => 'date',
        'detectado_por_agente' => 'boolean',
    ];

    /**
     * Equipamentos que possuem este software
     */
    public function equipamentos(): BelongsToMany
    {
        return $this->belongsToMany(Equipamento::class, 'equipamento_software')
            ->withPivot('data_instalacao')
            ->withTimestamps();
    }

    /**
     * Laboratórios que possuem este software
     */
    public function laboratorios(): BelongsToMany
    {
        return $this->belongsToMany(Laboratorio::class, 'laboratorio_software')
            ->withTimestamps();
    }

    /**
     * Verifica se a licença está próxima do vencimento (30 dias)
     */
    public function isLicencaProximaVencimento(): bool
    {
        if (!$this->data_expiracao) {
            return false;
        }

        return $this->data_expiracao->diffInDays(now()) <= 30 && $this->data_expiracao->isFuture();
    }

    /**
     * Verifica se a licença está vencida
     */
    public function isLicencaVencida(): bool
    {
        if (!$this->data_expiracao) {
            return false;
        }

        return $this->data_expiracao->isPast();
    }
}

