<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Equipamento;
use App\Models\LabelTemplate;
use App\Models\SystemSetting;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class EtiquetaController extends Controller
{
    public function single(Equipamento $equipamento, Request $request)
    {
        Gate::authorize('view', $equipamento);
        
        $equipamento->load(['laboratorio']);
        
        // Obter template selecionado ou usar padrão
        $templateId = $request->query('template_id');
        if ($templateId) {
            $template = LabelTemplate::find($templateId);
        } else {
            $template = LabelTemplate::getDefaultTemplate();
        }
        
        if (!$template || !$template->is_active) {
            $template = LabelTemplate::getDefaultTemplate() ?? LabelTemplate::first();
        }
        
        // Carregar configurações do sistema
        $settings = [
            'logo_enabled_in_label' => SystemSetting::get('logo_enabled_in_label', false),
            'logo_path' => SystemSetting::get('logo_path'),
            'qr_color' => SystemSetting::get('qr_color', '#000000'),
            'qr_background' => SystemSetting::get('qr_background', '#ffffff'),
        ];
        
        // Converter cm para pontos (1cm = 28.35pt)
        $widthPoints = $template->width * 28.35;
        $heightPoints = $template->height * 28.35;
        
        $pdf = Pdf::loadView('etiquetas.dynamic-template', [
            'equipamento' => $equipamento,
            'template' => $template,
            'settings' => $settings,
        ]);
        
        $pdf->setPaper([0, 0, $widthPoints, $heightPoints], 'portrait');
        
        return $pdf->download('etiqueta_' . ($equipamento->patrimonio ?? $equipamento->id) . '.pdf');
    }
    
    public function bulk(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|integer|exists:equipamentos,id',
            'template_id' => 'nullable|integer|exists:label_templates,id',
        ]);
        
        $equipamentos = Equipamento::with('laboratorio')
            ->whereIn('id', $validated['ids'])
            ->get();
        
        // Obter template selecionado ou usar padrão
        if (isset($validated['template_id'])) {
            $template = LabelTemplate::find($validated['template_id']);
        } else {
            $template = LabelTemplate::getDefaultTemplate();
        }
        
        if (!$template || !$template->is_active) {
            $template = LabelTemplate::getDefaultTemplate() ?? LabelTemplate::first();
        }
        
        // Carregar configurações do sistema
        $settings = [
            'logo_enabled_in_label' => SystemSetting::get('logo_enabled_in_label', false),
            'logo_path' => SystemSetting::get('logo_path'),
            'qr_color' => SystemSetting::get('qr_color', '#000000'),
            'qr_background' => SystemSetting::get('qr_background', '#ffffff'),
        ];
        
        $pdf = Pdf::loadView('etiquetas.dynamic-template', [
            'equipamentos' => $equipamentos,
            'template' => $template,
            'settings' => $settings,
        ]);
        
        $pdf->setPaper('a4', 'portrait');
        
        return $pdf->download('etiquetas_equipamentos.pdf');
    }
}


