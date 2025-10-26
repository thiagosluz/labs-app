<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Manutencao extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'manutencoes';

    protected $fillable = [
        'equipamento_id',
        'data',
        'tipo',
        'descricao',
        'tecnico_id',
        'status',
        'anexos',
    ];

    protected $casts = [
        'data' => 'date',
        'anexos' => 'array',
    ];

    /**
     * Equipamento da manutenção
     */
    public function equipamento(): BelongsTo
    {
        return $this->belongsTo(Equipamento::class);
    }

    /**
     * Técnico responsável pela manutenção
     */
    public function tecnico(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tecnico_id');
    }
}

