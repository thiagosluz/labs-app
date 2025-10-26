<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Software;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class SoftwareController extends Controller
{
    /**
     * Listar softwares
     */
    public function index(Request $request): JsonResponse
    {
        $query = Software::query()
            ->withCount('equipamentos')
            ->orderBy('nome');

        if ($request->has('tipo_licenca')) {
            $query->where('tipo_licenca', $request->tipo_licenca);
        }

        if ($request->has('expirando')) {
            $query->whereNotNull('data_expiracao')
                ->whereBetween('data_expiracao', [now(), now()->addDays(30)]);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nome', 'like', "%{$search}%")
                    ->orWhere('fabricante', 'like', "%{$search}%");
            });
        }

        $softwares = $query->paginate($request->get('per_page', 20));

        return response()->json($softwares);
    }

    /**
     * Criar software
     */
    public function store(Request $request): JsonResponse
    {
        Gate::authorize('create', Software::class);

        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'versao' => 'nullable|string|max:255',
            'fabricante' => 'nullable|string|max:255',
            'tipo_licenca' => 'required|in:livre,educacional,proprietario',
            'quantidade_licencas' => 'nullable|integer|min:0',
            'data_expiracao' => 'nullable|date',
            'descricao' => 'nullable|string',
        ]);

        $software = Software::create($validated);

        return response()->json($software, 201);
    }

    /**
     * Exibir software
     */
    public function show(Software $software): JsonResponse
    {
        $software->load([
            'equipamentos.laboratorio',
            'laboratorios'
        ]);

        // Buscar laboratórios únicos dos equipamentos que têm este software
        $laboratoriosDosEquipamentos = \App\Models\Laboratorio::query()
            ->whereHas('equipamentos.softwares', function ($query) use ($software) {
                $query->where('software_id', $software->id);
            })
            ->get();

        // Adicionar laboratórios dos equipamentos ao software
        $software->laboratorios_equipamentos = $laboratoriosDosEquipamentos;

        return response()->json($software);
    }

    /**
     * Atualizar software
     */
    public function update(Request $request, Software $software): JsonResponse
    {
        Gate::authorize('update', $software);

        $validated = $request->validate([
            'nome' => 'sometimes|string|max:255',
            'versao' => 'nullable|string|max:255',
            'fabricante' => 'nullable|string|max:255',
            'tipo_licenca' => 'sometimes|in:livre,educacional,proprietario',
            'quantidade_licencas' => 'nullable|integer|min:0',
            'data_expiracao' => 'nullable|date',
            'descricao' => 'nullable|string',
        ]);

        $software->update($validated);

        return response()->json($software);
    }

    /**
     * Deletar software
     */
    public function destroy(Software $software): JsonResponse
    {
        Gate::authorize('delete', $software);

        $software->delete();

        return response()->json(['message' => 'Software deletado com sucesso.']);
    }

    /**
     * Deletar múltiplos softwares
     */
    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|integer|exists:softwares,id',
        ]);

        DB::beginTransaction();
        try {
            $deleted = 0;
            foreach ($validated['ids'] as $id) {
                $software = Software::find($id);
                if ($software && Gate::allows('delete', $software)) {
                    $software->delete();
                    $deleted++;
                }
            }
            DB::commit();
            return response()->json([
                'message' => "{$deleted} software(s) deletado(s) com sucesso.",
                'deleted_count' => $deleted
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Erro ao deletar softwares'], 500);
        }
    }
}

