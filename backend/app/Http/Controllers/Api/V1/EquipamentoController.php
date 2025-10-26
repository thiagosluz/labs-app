<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Equipamento;
use App\Models\HistoricoMovimentacao;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class EquipamentoController extends Controller
{
    /**
     * Listar equipamentos
     */
    public function index(Request $request): JsonResponse
    {
        $query = Equipamento::with(['laboratorio', 'softwares'])
            ->orderBy('nome');

        if ($request->has('tipo')) {
            $query->where('tipo', $request->tipo);
        }

        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->has('laboratorio_id')) {
            $query->where('laboratorio_id', $request->laboratorio_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nome', 'like', "%{$search}%")
                    ->orWhere('patrimonio', 'like', "%{$search}%")
                    ->orWhere('numero_serie', 'like', "%{$search}%");
            });
        }

        $equipamentos = $query->paginate($request->get('per_page', 20));

        return response()->json($equipamentos);
    }

    /**
     * Criar equipamento
     */
    public function store(Request $request): JsonResponse
    {
        Gate::authorize('create', Equipamento::class);

        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'tipo' => 'required|in:computador,projetor,roteador,switch,impressora,scanner,outro',
            'fabricante' => 'nullable|string|max:255',
            'modelo' => 'nullable|string|max:255',
            'numero_serie' => 'nullable|string|unique:equipamentos',
            'patrimonio' => 'nullable|string|unique:equipamentos',
            'data_aquisicao' => 'nullable|date',
            'estado' => 'required|in:em_uso,reserva,manutencao,descartado',
            'laboratorio_id' => 'nullable|exists:laboratorios,id',
            'especificacoes' => 'nullable|string',
            'foto' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('foto')) {
            $validated['foto'] = $request->file('foto')->store('equipamentos', 'public');
        }

        $equipamento = Equipamento::create($validated);
        $equipamento->load(['laboratorio', 'softwares']);

        return response()->json($equipamento, 201);
    }

    /**
     * Exibir equipamento
     */
    public function show(Equipamento $equipamento): JsonResponse
    {
        $equipamento->load(['laboratorio', 'softwares', 'manutencoes.tecnico', 'movimentacoes']);

        return response()->json($equipamento);
    }

    /**
     * Atualizar equipamento
     */
    public function update(Request $request, Equipamento $equipamento): JsonResponse
    {
        Gate::authorize('update', $equipamento);

        $validated = $request->validate([
            'nome' => 'sometimes|string|max:255',
            'tipo' => 'sometimes|in:computador,projetor,roteador,switch,impressora,scanner,outro',
            'fabricante' => 'nullable|string|max:255',
            'modelo' => 'nullable|string|max:255',
            'numero_serie' => 'nullable|string|unique:equipamentos,numero_serie,' . $equipamento->id,
            'patrimonio' => 'nullable|string|unique:equipamentos,patrimonio,' . $equipamento->id,
            'data_aquisicao' => 'nullable|date',
            'estado' => 'sometimes|in:em_uso,reserva,manutencao,descartado',
            'laboratorio_id' => 'nullable|exists:laboratorios,id',
            'especificacoes' => 'nullable|string',
            'foto' => 'nullable|image|max:2048',
        ]);

        // Se mudou de laboratório, registrar no histórico
        if (isset($validated['laboratorio_id']) && $equipamento->laboratorio_id != $validated['laboratorio_id']) {
            HistoricoMovimentacao::create([
                'equipamento_id' => $equipamento->id,
                'laboratorio_origem_id' => $equipamento->laboratorio_id,
                'laboratorio_destino_id' => $validated['laboratorio_id'],
                'usuario_id' => $request->user()->id,
                'observacao' => 'Movimentação via sistema',
            ]);
        }

        if ($request->hasFile('foto')) {
            // Deletar foto antiga
            if ($equipamento->foto) {
                Storage::disk('public')->delete($equipamento->foto);
            }
            $validated['foto'] = $request->file('foto')->store('equipamentos', 'public');
        }

        $equipamento->update($validated);
        $equipamento->load(['laboratorio', 'softwares']);

        return response()->json($equipamento);
    }

    /**
     * Deletar equipamento
     */
    public function destroy(Equipamento $equipamento): JsonResponse
    {
        Gate::authorize('delete', $equipamento);

        if ($equipamento->foto) {
            Storage::disk('public')->delete($equipamento->foto);
        }

        $equipamento->delete();

        return response()->json(['message' => 'Equipamento deletado com sucesso.']);
    }

    /**
     * Associar software ao equipamento
     */
    public function attachSoftware(Request $request, Equipamento $equipamento): JsonResponse
    {
        Gate::authorize('update', $equipamento);

        $validated = $request->validate([
            'software_id' => 'required|exists:softwares,id',
            'data_instalacao' => 'nullable|date',
        ]);

        $equipamento->softwares()->syncWithoutDetaching([
            $validated['software_id'] => ['data_instalacao' => $validated['data_instalacao'] ?? now()]
        ]);

        return response()->json(['message' => 'Software associado com sucesso.']);
    }

    /**
     * Desassociar software do equipamento
     */
    public function detachSoftware(Equipamento $equipamento, int $softwareId): JsonResponse
    {
        Gate::authorize('update', $equipamento);

        $equipamento->softwares()->detach($softwareId);

        return response()->json(['message' => 'Software desassociado com sucesso.']);
    }

    /**
     * Deletar múltiplos equipamentos
     */
    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|integer|exists:equipamentos,id',
        ]);

        DB::beginTransaction();
        try {
            $deleted = 0;
            foreach ($validated['ids'] as $id) {
                $equipamento = Equipamento::find($id);
                if ($equipamento && Gate::allows('delete', $equipamento)) {
                    // Deletar foto se existir
                    if ($equipamento->foto) {
                        Storage::disk('public')->delete($equipamento->foto);
                    }
                    $equipamento->delete();
                    $deleted++;
                }
            }
            DB::commit();
            return response()->json([
                'message' => "{$deleted} equipamento(s) deletado(s) com sucesso.",
                'deleted_count' => $deleted
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Erro ao deletar equipamentos'], 500);
        }
    }
}

