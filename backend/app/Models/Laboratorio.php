<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Laboratorio extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'nome',
        'localizacao',
        'responsavel_id',
        'status',
        'descricao',
    ];

    protected $appends = [
        'quantidade_equipamentos',
    ];

    /**
     * Accessor para quantidade de equipamentos
     */
    public function getQuantidadeEquipamentosAttribute(): int
    {
        return $this->equipamentos()->count();
    }

    /**
     * Responsável pelo laboratório
     */
    public function responsavel(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responsavel_id');
    }

    /**
     * Equipamentos do laboratório
     */
    public function equipamentos(): HasMany
    {
        return $this->hasMany(Equipamento::class, 'laboratorio_id');
    }

    /**
     * Softwares do laboratório
     */
    public function softwares(): BelongsToMany
    {
        return $this->belongsToMany(Software::class, 'laboratorio_software')
            ->withTimestamps();
    }

    /**
     * Histórico de movimentações como origem
     */
    public function movimentacoesOrigem(): HasMany
    {
        return $this->hasMany(HistoricoMovimentacao::class, 'laboratorio_origem_id');
    }

    /**
     * Histórico de movimentações como destino
     */
    public function movimentacoesDestino(): HasMany
    {
        return $this->hasMany(HistoricoMovimentacao::class, 'laboratorio_destino_id');
    }
}

