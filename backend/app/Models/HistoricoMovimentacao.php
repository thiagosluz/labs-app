<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HistoricoMovimentacao extends Model
{
    use HasFactory;

    protected $table = 'historico_movimentacoes';

    protected $fillable = [
        'equipamento_id',
        'laboratorio_origem_id',
        'laboratorio_destino_id',
        'usuario_id',
        'observacao',
    ];

    /**
     * Equipamento movimentado
     */
    public function equipamento(): BelongsTo
    {
        return $this->belongsTo(Equipamento::class);
    }

    /**
     * Laboratório de origem
     */
    public function laboratorioOrigem(): BelongsTo
    {
        return $this->belongsTo(Laboratorio::class, 'laboratorio_origem_id');
    }

    /**
     * Laboratório de destino
     */
    public function laboratorioDestino(): BelongsTo
    {
        return $this->belongsTo(Laboratorio::class, 'laboratorio_destino_id');
    }

    /**
     * Usuário que realizou a movimentação
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}

