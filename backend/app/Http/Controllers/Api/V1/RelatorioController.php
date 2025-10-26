<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Equipamento;
use App\Models\Laboratorio;
use App\Models\Manutencao;
use App\Models\Software;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\EquipamentosExport;
use App\Exports\ManutencoesExport;
use App\Exports\SoftwaresExport;
use App\Exports\LaboratoriosExport;

class RelatorioController extends Controller
{
    /**
     * Relatório de equipamentos em PDF
     */
    public function equipamentosPdf(Request $request)
    {
        $query = Equipamento::with(['laboratorio']);

        // Aplicar filtros APENAS se o valor não for vazio e não for "todos"
        if ($request->filled('tipo') && $request->tipo !== 'todos') {
            $query->where('tipo', $request->tipo);
        }

        if ($request->filled('estado') && $request->estado !== 'todos') {
            $query->where('estado', $request->estado);
        }

        if ($request->filled('laboratorio_id') && $request->laboratorio_id !== 'todos') {
            $query->where('laboratorio_id', $request->laboratorio_id);
        }

        if ($request->filled('data_inicio') && $request->filled('data_fim')) {
            $query->whereBetween('data_aquisicao', [$request->data_inicio, $request->data_fim]);
        }

        $equipamentos = $query->orderBy('nome')->get();

        // Debug: Log para verificar
        \Log::info('Relatório Equipamentos PDF', [
            'total_equipamentos' => $equipamentos->count(),
            'filtros' => $request->all(),
        ]);

        $pdf = PDF::loadView('relatorios.equipamentos', [
            'equipamentos' => $equipamentos,
            'filtros' => $request->all(),
            'data' => now()->format('d/m/Y H:i'),
        ]);

        $filename = 'relatorio-equipamentos-' . now()->format('Y-m-d-His') . '.pdf';

        return $pdf->download($filename);
    }

    /**
     * Relatório de equipamentos em Excel
     */
    public function equipamentosExcel(Request $request)
    {
        $filename = 'relatorio-equipamentos-' . now()->format('Y-m-d-His') . '.xlsx';

        return Excel::download(new EquipamentosExport($request->all()), $filename);
    }

    /**
     * Relatório de manutenções em PDF
     */
    public function manutencoesPdf(Request $request)
    {
        $query = Manutencao::with(['equipamento', 'tecnico']);

        // Aplicar filtros APENAS se o valor não for vazio e não for "todos"
        if ($request->filled('tipo') && $request->tipo !== 'todos') {
            $query->where('tipo', $request->tipo);
        }

        if ($request->filled('status') && $request->status !== 'todos') {
            $query->where('status', $request->status);
        }

        if ($request->filled('data_inicio') && $request->filled('data_fim')) {
            $query->whereBetween('data', [$request->data_inicio, $request->data_fim]);
        }

        $manutencoes = $query->orderBy('data', 'desc')->get();

        // Debug: Log para verificar
        \Log::info('Relatório Manutenções PDF', [
            'total_manutencoes' => $manutencoes->count(),
            'filtros' => $request->all(),
        ]);

        $pdf = PDF::loadView('relatorios.manutencoes', [
            'manutencoes' => $manutencoes,
            'filtros' => $request->all(),
            'data' => now()->format('d/m/Y H:i'),
        ]);

        $filename = 'relatorio-manutencoes-' . now()->format('Y-m-d-His') . '.pdf';

        return $pdf->download($filename);
    }

    /**
     * Relatório de manutenções em Excel
     */
    public function manutencoesExcel(Request $request)
    {
        $filename = 'relatorio-manutencoes-' . now()->format('Y-m-d-His') . '.xlsx';

        return Excel::download(new ManutencoesExport($request->all()), $filename);
    }

    /**
     * Relatório de softwares em PDF
     */
    public function softwaresPdf(Request $request)
    {
        $query = Software::query();

        // Aplicar filtros APENAS se o valor não for vazio e não for "todos"
        if ($request->filled('tipo_licenca') && $request->tipo_licenca !== 'todos') {
            $query->where('tipo_licenca', $request->tipo_licenca);
        }

        if ($request->filled('status_expiracao') && $request->status_expiracao !== 'todos') {
            if ($request->status_expiracao === 'expirado') {
                $query->whereNotNull('data_expiracao')
                    ->whereDate('data_expiracao', '<', now());
            } elseif ($request->status_expiracao === 'expirando') {
                $query->whereNotNull('data_expiracao')
                    ->whereDate('data_expiracao', '>=', now())
                    ->whereDate('data_expiracao', '<=', now()->addDays(30));
            }
        }

        $softwares = $query->orderBy('nome')->get();

        $pdf = PDF::loadView('relatorios.softwares', [
            'softwares' => $softwares,
            'filtros' => $request->all(),
            'data' => now()->format('d/m/Y H:i'),
        ]);

        $filename = 'relatorio-softwares-' . now()->format('Y-m-d-His') . '.pdf';

        return $pdf->download($filename);
    }

    /**
     * Relatório de softwares em Excel
     */
    public function softwaresExcel(Request $request)
    {
        $filename = 'relatorio-softwares-' . now()->format('Y-m-d-His') . '.xlsx';

        return Excel::download(new SoftwaresExport($request->all()), $filename);
    }

    /**
     * Relatório de laboratórios em PDF
     */
    public function laboratoriosPdf(Request $request)
    {
        $query = Laboratorio::with(['responsavel', 'equipamentos']);

        // Aplicar filtros APENAS se o valor não for vazio e não for "todos"
        if ($request->filled('status') && $request->status !== 'todos') {
            $query->where('status', $request->status);
        }

        $laboratorios = $query->orderBy('nome')->get();

        $pdf = PDF::loadView('relatorios.laboratorios', [
            'laboratorios' => $laboratorios,
            'filtros' => $request->all(),
            'data' => now()->format('d/m/Y H:i'),
        ]);

        $filename = 'relatorio-laboratorios-' . now()->format('Y-m-d-His') . '.pdf';

        return $pdf->download($filename);
    }

    /**
     * Relatório de laboratórios em Excel
     */
    public function laboratoriosExcel(Request $request)
    {
        $filename = 'relatorio-laboratorios-' . now()->format('Y-m-d-His') . '.xlsx';

        return Excel::download(new LaboratoriosExport($request->all()), $filename);
    }
}

