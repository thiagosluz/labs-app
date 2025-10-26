<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Manutencao;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class ManutencaoController extends Controller
{
    /**
     * Listar manutenções
     */
    public function index(Request $request): JsonResponse
    {
        $query = Manutencao::with(['equipamento', 'tecnico']);

        if ($request->has('tipo')) {
            $query->where('tipo', $request->tipo);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('equipamento_id')) {
            $query->where('equipamento_id', $request->equipamento_id);
        }

        if ($request->has('data_inicio') && $request->has('data_fim')) {
            $query->whereBetween('data', [$request->data_inicio, $request->data_fim]);
        }

        $manutencoes = $query->orderBy('data', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($manutencoes);
    }

    /**
     * Criar manutenção
     */
    public function store(Request $request): JsonResponse
    {
        Gate::authorize('create', Manutencao::class);

        $validated = $request->validate([
            'equipamento_id' => 'required|exists:equipamentos,id',
            'data' => 'required|date',
            'tipo' => 'required|in:corretiva,preventiva',
            'descricao' => 'required|string',
            'tecnico_id' => 'nullable|exists:users,id',
            'status' => 'required|in:pendente,em_andamento,concluida,cancelada',
        ]);

        $manutencao = Manutencao::create($validated);
        $manutencao->load(['equipamento', 'tecnico']);

        return response()->json($manutencao, 201);
    }

    /**
     * Exibir manutenção
     */
    public function show(Manutencao $manutencao): JsonResponse
    {
        $manutencao->load(['equipamento', 'tecnico']);

        return response()->json($manutencao);
    }

    /**
     * Atualizar manutenção
     */
    public function update(Request $request, Manutencao $manutencao): JsonResponse
    {
        Gate::authorize('update', $manutencao);

        $validated = $request->validate([
            'equipamento_id' => 'sometimes|exists:equipamentos,id',
            'data' => 'sometimes|date',
            'tipo' => 'sometimes|in:corretiva,preventiva',
            'descricao' => 'sometimes|string',
            'tecnico_id' => 'nullable|exists:users,id',
            'status' => 'sometimes|in:pendente,em_andamento,concluida,cancelada',
        ]);

        $manutencao->update($validated);
        $manutencao->load(['equipamento', 'tecnico']);

        return response()->json($manutencao);
    }

    /**
     * Deletar manutenção
     */
    public function destroy(Manutencao $manutencao): JsonResponse
    {
        Gate::authorize('delete', $manutencao);

        $manutencao->delete();

        return response()->json(['message' => 'Manutenção deletada com sucesso.']);
    }

    /**
     * Deletar múltiplas manutenções
     */
    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|integer|exists:manutencoes,id',
        ]);

        DB::beginTransaction();
        try {
            $deleted = 0;
            foreach ($validated['ids'] as $id) {
                $manutencao = Manutencao::find($id);
                if ($manutencao && Gate::allows('delete', $manutencao)) {
                    $manutencao->delete();
                    $deleted++;
                }
            }
            DB::commit();
            return response()->json([
                'message' => "{$deleted} manutenção(ões) deletada(s) com sucesso.",
                'deleted_count' => $deleted
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Erro ao deletar manutenções'], 500);
        }
    }
}

