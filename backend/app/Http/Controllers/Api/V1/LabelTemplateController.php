<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\LabelTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class LabelTemplateController extends Controller
{
    /**
     * Listar templates
     */
    public function index(): JsonResponse
    {
        $templates = LabelTemplate::where('is_active', true)
            ->orderBy('is_default', 'desc')
            ->orderBy('name')
            ->get();

        return response()->json($templates);
    }

    /**
     * Criar template
     */
    public function store(Request $request): JsonResponse
    {
        Gate::authorize('create', LabelTemplate::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'width' => 'required|numeric|min:3|max:20',
            'height' => 'required|numeric|min:2|max:15',
            'qr_size' => 'nullable|numeric|min:2|max:6',
            'qr_position' => 'nullable|in:left,right',
            'show_logo' => 'nullable|boolean',
            'logo_position' => 'nullable|in:top,bottom,side',
            'fields' => 'nullable|array',
            'styles' => 'nullable|array',
        ]);

        $template = LabelTemplate::create($validated);

        return response()->json($template, 201);
    }

    /**
     * Atualizar template
     */
    public function update(Request $request, LabelTemplate $labelTemplate): JsonResponse
    {
        Gate::authorize('update', $labelTemplate);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'width' => 'sometimes|numeric|min:3|max:20',
            'height' => 'sometimes|numeric|min:2|max:15',
            'qr_size' => 'nullable|numeric|min:2|max:6',
            'qr_position' => 'nullable|in:left,right',
            'show_logo' => 'nullable|boolean',
            'logo_position' => 'nullable|in:top,bottom,side',
            'fields' => 'nullable|array',
            'styles' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);

        $labelTemplate->update($validated);

        return response()->json($labelTemplate);
    }

    /**
     * Deletar template
     */
    public function destroy(LabelTemplate $labelTemplate): JsonResponse
    {
        Gate::authorize('delete', $labelTemplate);

        if ($labelTemplate->is_default) {
            return response()->json(['error' => 'Não é possível deletar o template padrão'], 400);
        }

        $labelTemplate->delete();

        return response()->json(['message' => 'Template deletado com sucesso']);
    }

    /**
     * Duplicar template
     */
    public function duplicate(LabelTemplate $labelTemplate): JsonResponse
    {
        Gate::authorize('create', LabelTemplate::class);

        $newTemplate = $labelTemplate->replicate();
        $newTemplate->name = $labelTemplate->name . ' (Cópia)';
        $newTemplate->is_default = false;
        $newTemplate->save();

        return response()->json($newTemplate, 201);
    }

    /**
     * Definir como padrão
     */
    public function setDefault(LabelTemplate $labelTemplate): JsonResponse
    {
        Gate::authorize('update', $labelTemplate);

        $labelTemplate->setAsDefault();

        return response()->json(['message' => 'Template definido como padrão']);
    }
}
