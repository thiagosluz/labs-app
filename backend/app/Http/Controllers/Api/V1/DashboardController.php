<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Equipamento;
use App\Models\Laboratorio;
use App\Models\Manutencao;
use App\Models\Software;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Obter estatísticas gerais do dashboard
     */
    public function index(): JsonResponse
    {
        $stats = [
            'total_laboratorios' => Laboratorio::count(),
            'laboratorios_ativos' => Laboratorio::where('status', 'ativo')->count(),
            'total_equipamentos' => Equipamento::count(),
            'equipamentos_em_uso' => Equipamento::where('estado', 'em_uso')->count(),
            'equipamentos_manutencao' => Equipamento::where('estado', 'manutencao')->count(),
            'equipamentos_reserva' => Equipamento::where('estado', 'reserva')->count(),
            'total_softwares' => Software::count(),
            'softwares_expirando' => Software::whereNotNull('data_expiracao')
                ->whereBetween('data_expiracao', [now(), now()->addDays(30)])
                ->count(),
            'manutencoes_pendentes' => Manutencao::whereIn('status', ['pendente', 'em_andamento'])->count(),
            'manutencoes_mes' => Manutencao::whereMonth('data', now()->month)
                ->whereYear('data', now()->year)
                ->count(),
        ];

        // Equipamentos por tipo
        $equipamentosPorTipo = Equipamento::select('tipo', DB::raw('count(*) as total'))
            ->groupBy('tipo')
            ->get()
            ->mapWithKeys(fn($item) => [$item->tipo => $item->total]);

        // Equipamentos por estado
        $equipamentosPorEstado = Equipamento::select('estado', DB::raw('count(*) as total'))
            ->groupBy('estado')
            ->get()
            ->mapWithKeys(fn($item) => [$item->estado => $item->total]);

        // Manutenções por mês (últimos 6 meses)
        $manutencoesPorMes = Manutencao::select(
                DB::raw('EXTRACT(MONTH FROM data) as mes'),
                DB::raw('count(*) as total')
            )
            ->where('data', '>=', now()->subMonths(6))
            ->groupBy('mes')
            ->orderBy('mes')
            ->get();

        // Licenças próximas do vencimento
        $licencasExpirando = Software::whereNotNull('data_expiracao')
            ->whereBetween('data_expiracao', [now(), now()->addDays(60)])
            ->orderBy('data_expiracao')
            ->get();

        // Equipamentos por laboratório
        $equipamentosPorLab = Laboratorio::withCount('equipamentos')
            ->orderBy('equipamentos_count', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'stats' => $stats,
            'charts' => [
                'equipamentos_por_tipo' => $equipamentosPorTipo,
                'equipamentos_por_estado' => $equipamentosPorEstado,
                'manutencoes_por_mes' => $manutencoesPorMes,
            ],
            'alerts' => [
                'licencas_expirando' => $licencasExpirando,
                'equipamentos_manutencao' => Equipamento::where('estado', 'manutencao')
                    ->with('laboratorio')
                    ->take(10)
                    ->get(),
            ],
            'top_laboratorios' => $equipamentosPorLab,
        ]);
    }

    /**
     * Gerar relatório de equipamentos por laboratório
     */
    public function relatorioEquipamentosPorLaboratorio(): JsonResponse
    {
        $laboratorios = Laboratorio::with(['equipamentos' => function ($query) {
            $query->select('id', 'nome', 'tipo', 'fabricante', 'modelo', 'estado', 'laboratorio_id');
        }])->get();

        $relatorio = $laboratorios->map(function ($lab) {
            return [
                'laboratorio' => $lab->nome,
                'localizacao' => $lab->localizacao,
                'total_equipamentos' => $lab->equipamentos->count(),
                'equipamentos' => $lab->equipamentos->groupBy('tipo')->map(fn($items) => $items->count()),
            ];
        });

        return response()->json($relatorio);
    }

    /**
     * Gerar relatório de softwares por laboratório
     */
    public function relatorioSoftwaresPorLaboratorio(): JsonResponse
    {
        $laboratorios = Laboratorio::with('softwares')->get();

        $relatorio = $laboratorios->map(function ($lab) {
            return [
                'laboratorio' => $lab->nome,
                'localizacao' => $lab->localizacao,
                'total_softwares' => $lab->softwares->count(),
                'softwares' => $lab->softwares->map(fn($s) => [
                    'nome' => $s->nome,
                    'versao' => $s->versao,
                    'tipo_licenca' => $s->tipo_licenca,
                ]),
            ];
        });

        return response()->json($relatorio);
    }

    /**
     * Gerar relatório de manutenções por período
     */
    public function relatorioManutencoesPorPeriodo(string $dataInicio, string $dataFim): JsonResponse
    {
        $manutencoes = Manutencao::with(['equipamento', 'tecnico'])
            ->whereBetween('data', [$dataInicio, $dataFim])
            ->orderBy('data', 'desc')
            ->get();

        $resumo = [
            'total' => $manutencoes->count(),
            'por_tipo' => $manutencoes->groupBy('tipo')->map(fn($items) => $items->count()),
            'por_status' => $manutencoes->groupBy('status')->map(fn($items) => $items->count()),
            'manutencoes' => $manutencoes,
        ];

        return response()->json($resumo);
    }
}

