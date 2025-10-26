<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Equipamento;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class PublicEquipamentoController extends Controller
{
    public function show(Equipamento $equipamento): JsonResponse
    {
        $equipamento->load(['laboratorio', 'softwares']);
        
        $data = [
            'id' => $equipamento->id,
            'nome' => $equipamento->nome,
            'tipo' => $equipamento->tipo,
            'patrimonio' => $equipamento->patrimonio,
            'numero_serie' => $equipamento->numero_serie,
            'estado' => $equipamento->estado,
            'laboratorio' => $equipamento->laboratorio ? [
                'nome' => $equipamento->laboratorio->nome,
                'localizacao' => $equipamento->laboratorio->localizacao,
            ] : null,
            'foto_url' => $equipamento->foto 
                ? Storage::disk('public')->url($equipamento->foto)
                : null,
            // Informações técnicas do agente
            'gerenciado_por_agente' => $equipamento->gerenciado_por_agente,
            'hostname' => $equipamento->hostname,
            'processador' => $equipamento->processador,
            'memoria_ram' => $equipamento->memoria_ram,
            'disco' => $equipamento->disco,
            'ip_local' => $equipamento->ip_local,
            'mac_address' => $equipamento->mac_address,
            'gateway' => $equipamento->gateway,
            'dns_servers' => $equipamento->dns_servers,
            'agent_version' => $equipamento->agent_version,
            'ultima_sincronizacao' => $equipamento->ultima_sincronizacao,
            // Softwares instalados
            'softwares' => $equipamento->softwares->map(function ($software) {
                return [
                    'id' => $software->id,
                    'nome' => $software->nome,
                    'versao' => $software->versao,
                    'fabricante' => $software->fabricante,
                    'data_instalacao' => $software->pivot->data_instalacao ?? null,
                ];
            }),
        ];
        
        return response()->json($data);
    }
}


