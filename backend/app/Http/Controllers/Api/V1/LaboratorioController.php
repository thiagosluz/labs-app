<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Laboratorio;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class LaboratorioController extends Controller
{
    /**
     * Listar laboratórios
     */
    public function index(Request $request): JsonResponse
    {
        $query = Laboratorio::with(['responsavel', 'equipamentos']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nome', 'like', "%{$search}%")
                    ->orWhere('localizacao', 'like', "%{$search}%");
            });
        }

        $laboratorios = $query->paginate($request->get('per_page', 15));

        return response()->json($laboratorios);
    }

    /**
     * Criar laboratório
     */
    public function store(Request $request): JsonResponse
    {
        Gate::authorize('create', Laboratorio::class);

        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'localizacao' => 'required|string|max:255',
            'responsavel_id' => 'nullable|exists:users,id',
            'status' => 'required|in:ativo,inativo,manutencao',
            'descricao' => 'nullable|string',
        ]);

        $laboratorio = Laboratorio::create($validated);
        $laboratorio->load(['responsavel', 'equipamentos']);

        return response()->json($laboratorio, 201);
    }

    /**
     * Exibir laboratório
     */
    public function show(Laboratorio $laboratorio): JsonResponse
    {
        $laboratorio->load(['responsavel', 'equipamentos.softwares']);
        
        // Buscar todos os softwares únicos dos equipamentos deste laboratório
        $softwaresDoLaboratorio = \App\Models\Software::query()
            ->whereHas('equipamentos', function ($query) use ($laboratorio) {
                $query->where('laboratorio_id', $laboratorio->id);
            })
            ->with(['equipamentos' => function ($query) use ($laboratorio) {
                $query->where('laboratorio_id', $laboratorio->id);
            }])
            ->get();
        
        // Adicionar softwares ao laboratório
        $laboratorio->softwares_equipamentos = $softwaresDoLaboratorio;

        return response()->json($laboratorio);
    }

    /**
     * Atualizar laboratório
     */
    public function update(Request $request, Laboratorio $laboratorio): JsonResponse
    {
        Gate::authorize('update', $laboratorio);

        $validated = $request->validate([
            'nome' => 'sometimes|string|max:255',
            'localizacao' => 'sometimes|string|max:255',
            'responsavel_id' => 'nullable|exists:users,id',
            'status' => 'sometimes|in:ativo,inativo,manutencao',
            'descricao' => 'nullable|string',
        ]);

        $laboratorio->update($validated);
        $laboratorio->load(['responsavel', 'equipamentos']);

        return response()->json($laboratorio);
    }

    /**
     * Deletar laboratório
     */
    public function destroy(Laboratorio $laboratorio): JsonResponse
    {
        Gate::authorize('delete', $laboratorio);

        $laboratorio->delete();

        return response()->json(['message' => 'Laboratório deletado com sucesso.']);
    }

    /**
     * Deletar múltiplos laboratórios
     */
    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|integer|exists:laboratorios,id',
        ]);

        DB::beginTransaction();
        try {
            $deleted = 0;
            foreach ($validated['ids'] as $id) {
                $laboratorio = Laboratorio::find($id);
                if ($laboratorio && Gate::allows('delete', $laboratorio)) {
                    $laboratorio->delete();
                    $deleted++;
                }
            }
            DB::commit();
            return response()->json([
                'message' => "{$deleted} laboratório(s) deletado(s) com sucesso.",
                'deleted_count' => $deleted
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Erro ao deletar laboratórios'], 500);
        }
    }
}

