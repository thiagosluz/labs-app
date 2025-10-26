<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AgentApiKey;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AgentManagementController extends Controller
{
    /**
     * Listar todas as API Keys dos agentes
     * GET /api/v1/agent-management
     */
    public function index(): JsonResponse
    {
        $keys = AgentApiKey::with(['creator', 'laboratorio'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($keys);
    }

    /**
     * Criar nova API Key
     * POST /api/v1/agent-management
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'laboratorio_id' => 'nullable|exists:laboratorios,id',
        ]);

        $key = AgentApiKey::generateKey();

        $agentKey = AgentApiKey::create([
            'name' => $validated['name'],
            'key' => $key,
            'laboratorio_id' => $validated['laboratorio_id'] ?? null,
            'created_by' => $request->user()->id,
        ]);

        // Carregar relacionamentos
        $agentKey->load(['creator', 'laboratorio']);

        return response()->json([
            'agent_key' => $agentKey,
            'api_key' => $key, // Retorna apenas uma vez
        ], 201);
    }

    /**
     * Desativar API Key
     * DELETE /api/v1/agent-management/{agentKey}
     */
    public function destroy(AgentApiKey $agentKey): JsonResponse
    {
        $agentKey->update(['active' => false]);

        return response()->json(['message' => 'API Key desativada com sucesso']);
    }

    /**
     * Reativar API Key
     * POST /api/v1/agent-management/{agentKey}/reactivate
     */
    public function reactivate(AgentApiKey $agentKey): JsonResponse
    {
        $agentKey->update(['active' => true]);

        return response()->json(['message' => 'API Key reativada com sucesso']);
    }

    /**
     * Desativar múltiplas API Keys
     */
    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|integer|exists:agent_api_keys,id',
        ]);

        DB::beginTransaction();
        try {
            $deactivated = 0;
            foreach ($validated['ids'] as $id) {
                $agentKey = AgentApiKey::find($id);
                if ($agentKey) {
                    $agentKey->update(['active' => false]);
                    $deactivated++;
                }
            }
            DB::commit();
            return response()->json([
                'message' => "{$deactivated} agente(s) desativado(s) com sucesso.",
                'deactivated_count' => $deactivated
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Erro ao desativar agentes'], 500);
        }
    }

    /**
     * Download do executável do agente
     * GET /api/v1/agent-management/download
     */
    public function downloadAgent(): mixed
    {
        $path = storage_path('app/public/agent/LabAgent-Setup.exe');

        if (!file_exists($path)) {
            return response()->json([
                'error' => 'Agente não disponível para download',
                'message' => 'O arquivo do agente não foi encontrado. Por favor, compile o agente Python primeiro.',
            ], 404);
        }

        return response()->download($path, 'LabAgent-Setup.exe');
    }
}

