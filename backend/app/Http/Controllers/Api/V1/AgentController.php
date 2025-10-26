<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Equipamento;
use App\Models\Software;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AgentController extends Controller
{
    /**
     * Sincronizar equipamento
     * POST /api/v1/agent/sync-equipamento
     */
    public function syncEquipamento(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'hostname' => 'required|string',
            'numero_serie' => 'nullable|string',
            'fabricante' => 'nullable|string',
            'modelo' => 'nullable|string',
            'processador' => 'nullable|string',
            'memoria_ram' => 'nullable|string',
            'disco' => 'nullable|string',
            'ip_local' => 'nullable|string',
            'mac_address' => 'nullable|string',
            'gateway' => 'nullable|string',
            'dns_servers' => 'nullable|array',
            'laboratorio_id' => 'required|exists:laboratorios,id',
            'dados_hash' => 'required|string',
        ]);

        // Buscar equipamento existente por número de série ou MAC (incluindo soft deleted)
        $equipamento = null;
        
        // Primeiro, tentar por número de série
        if (!empty($validated['numero_serie'])) {
            $equipamento = Equipamento::withTrashed()
                ->where('numero_serie', $validated['numero_serie'])
                ->first();
        }
        
        // Se não encontrou por número de série, tentar por MAC
        if (!$equipamento && !empty($validated['mac_address'])) {
            $equipamento = Equipamento::withTrashed()
                ->where('mac_address', $validated['mac_address'])
                ->first();
        }

        // Preparar dados
        $data = [
            'nome' => $validated['hostname'],
            'hostname' => $validated['hostname'],
            'tipo' => 'computador',
            'fabricante' => $validated['fabricante'],
            'modelo' => $validated['modelo'],
            'numero_serie' => $validated['numero_serie'],
            'processador' => $validated['processador'],
            'memoria_ram' => $validated['memoria_ram'],
            'disco' => $validated['disco'],
            'ip_local' => $validated['ip_local'],
            'mac_address' => $validated['mac_address'],
            'gateway' => $validated['gateway'],
            'dns_servers' => $validated['dns_servers'],
            'laboratorio_id' => $validated['laboratorio_id'],
            'estado' => 'em_uso',
            'gerenciado_por_agente' => true,
            'agent_version' => $request->agent_key->version ?? '1.0',
            'ultima_sincronizacao' => now(),
            'dados_hash' => $validated['dados_hash'],
        ];

        $wasRecentlyCreated = false;
        $wasRestored = false;

        if ($equipamento) {
            // Se estava soft deleted, restaurar
            if ($equipamento->trashed()) {
                $equipamento->restore();
                $wasRestored = true;
                Log::info("Equipamento restaurado pelo agente: {$equipamento->id}");
            }
            
            // Atualizar apenas se hash mudou ou foi restaurado
            if ($equipamento->dados_hash !== $validated['dados_hash'] || $wasRestored) {
                $equipamento->update($data);
                Log::info("Equipamento atualizado pelo agente: {$equipamento->id}");
            }
        } else {
            // Criar novo
            $equipamento = Equipamento::create($data);
            $wasRecentlyCreated = true;
            Log::info("Novo equipamento criado pelo agente: {$equipamento->id}");
        }

        return response()->json([
            'equipamento_id' => $equipamento->id,
            'action' => $wasRecentlyCreated ? 'created' : ($wasRestored ? 'restored' : 'updated'),
        ]);
    }

    /**
     * Sincronizar softwares
     * POST /api/v1/agent/sync-softwares
     */
    public function syncSoftwares(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'softwares' => 'required|array',
            'softwares.*.nome' => 'required|string',
            'softwares.*.versao' => 'nullable|string',
            'softwares.*.fabricante' => 'nullable|string',
            'softwares.*.data_instalacao' => 'nullable|date',
            'softwares.*.chave_licenca' => 'nullable|string',
        ]);

        $softwareIds = [];

        foreach ($validated['softwares'] as $softwareData) {
            // Buscar software existente (incluindo soft deleted)
            $software = Software::withTrashed()
                ->where('nome', $softwareData['nome'])
                ->where('versao', $softwareData['versao'] ?? null)
                ->first();
            
            if ($software) {
                // Se estava soft deleted, restaurar
                if ($software->trashed()) {
                    $software->restore();
                    Log::info("Software restaurado pelo agente: {$software->id}");
                }
                
                // Atualizar dados se necessário
                $software->update([
                    'fabricante' => $softwareData['fabricante'] ?? $software->fabricante,
                    'data_instalacao' => $softwareData['data_instalacao'] ?? $software->data_instalacao,
                    'chave_licenca' => $softwareData['chave_licenca'] ?? $software->chave_licenca,
                    'detectado_por_agente' => true,
                ]);
            } else {
                // Criar novo software
                $software = Software::create([
                    'nome' => $softwareData['nome'],
                    'versao' => $softwareData['versao'] ?? null,
                    'fabricante' => $softwareData['fabricante'] ?? null,
                    'data_instalacao' => $softwareData['data_instalacao'] ?? null,
                    'chave_licenca' => $softwareData['chave_licenca'] ?? null,
                    'detectado_por_agente' => true,
                    'tipo_licenca' => 'proprietario',
                ]);
                Log::info("Novo software criado pelo agente: {$software->id}");
            }
            
            $softwareIds[] = $software->id;
        }

        return response()->json([
            'software_ids' => $softwareIds,
            'total' => count($softwareIds),
        ]);
    }

    /**
     * Sincronizar relacionamento equipamento-softwares
     * POST /api/v1/agent/sync-equipamento-softwares
     */
    public function syncEquipamentoSoftwares(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'equipamento_id' => 'required|exists:equipamentos,id',
            'software_ids' => 'required|array',
            'software_ids.*' => 'exists:softwares,id',
        ]);

        $equipamento = Equipamento::findOrFail($validated['equipamento_id']);

        // Sincronizar (adiciona novos, remove ausentes)
        $equipamento->softwares()->sync($validated['software_ids']);

        return response()->json([
            'message' => 'Softwares sincronizados com sucesso',
            'total_softwares' => count($validated['software_ids']),
        ]);
    }
}

