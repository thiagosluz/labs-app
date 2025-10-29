<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Equipamento extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'nome',
        'tipo',
        'fabricante',
        'modelo',
        'numero_serie',
        'patrimonio',
        'data_aquisicao',
        'estado',
        'laboratorio_id',
        'especificacoes',
        'foto',
        'anexos',
        'qr_code_path',
        // Campos do agente
        'hostname',
        'processador',
        'memoria_ram',
        'disco',
        'ip_local',
        'mac_address',
        'gateway',
        'dns_servers',
        'gerenciado_por_agente',
        'agent_version',
        'ultima_sincronizacao',
        'dados_hash',
    ];

    protected $casts = [
        'data_aquisicao' => 'date',
        'anexos' => 'array',
        'dns_servers' => 'array',
        'gerenciado_por_agente' => 'boolean',
        'ultima_sincronizacao' => 'datetime',
    ];

    protected $appends = [
        'qr_code_url',
        'public_url',
    ];

    /**
     * Laboratório do equipamento
     */
    public function laboratorio(): BelongsTo
    {
        return $this->belongsTo(Laboratorio::class);
    }

    /**
     * Softwares instalados no equipamento
     */
    public function softwares(): BelongsToMany
    {
        return $this->belongsToMany(Software::class, 'equipamento_software')
            ->withPivot('data_instalacao')
            ->withTimestamps();
    }

    /**
     * Manutenções do equipamento
     */
    public function manutencoes(): HasMany
    {
        return $this->hasMany(Manutencao::class);
    }

    /**
     * Histórico de movimentações do equipamento
     */
    public function movimentacoes(): HasMany
    {
        return $this->hasMany(HistoricoMovimentacao::class);
    }

    /**
     * Retorna a URL do QR code
     */
    public function getQrCodeUrlAttribute(): ?string
    {
        if (!$this->qr_code_path) {
            return null;
        }
        
        // Obter URL base do storage
        $baseUrl = rtrim(config('app.url', 'http://localhost'), '/');
        $storagePath = ltrim($this->qr_code_path, '/');
        
        // Retornar URL sem duplo slash
        return $baseUrl . '/storage/' . $storagePath;
    }

    /**
     * Retorna a URL pública do equipamento
     */
    public function getPublicUrlAttribute(): string
    {
        $frontendUrl = rtrim(config('app.frontend_url', config('app.url', 'http://localhost')), '/');
        return $frontendUrl . '/equipamento/' . $this->id . '/public';
    }
}


