<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Equipamento;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class EtiquetaController extends Controller
{
    public function single(Equipamento $equipamento)
    {
        Gate::authorize('view', $equipamento);
        
        $equipamento->load(['laboratorio']);
        
        $pdf = Pdf::loadView('etiquetas.equipamento-single', [
            'equipamento' => $equipamento,
        ]);
        
        $pdf->setPaper([0, 0, 283.46, 141.73], 'portrait'); // 10cm x 5cm
        
        return $pdf->download('etiqueta_' . ($equipamento->patrimonio ?? $equipamento->id) . '.pdf');
    }
    
    public function bulk(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|integer|exists:equipamentos,id',
        ]);
        
        $equipamentos = Equipamento::with('laboratorio')
            ->whereIn('id', $validated['ids'])
            ->get();
        
        $pdf = Pdf::loadView('etiquetas.equipamento-bulk', [
            'equipamentos' => $equipamentos,
        ]);
        
        $pdf->setPaper('a4', 'portrait');
        
        return $pdf->download('etiquetas_equipamentos.pdf');
    }
}


