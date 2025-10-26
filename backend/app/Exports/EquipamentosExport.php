<?php

namespace App\Exports;

use App\Models\Equipamento;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class EquipamentosExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    protected $filtros;

    public function __construct(array $filtros = [])
    {
        $this->filtros = $filtros;
    }

    public function collection()
    {
        $query = Equipamento::with(['laboratorio']);

        // Aplicar filtros
        if (isset($this->filtros['tipo']) && $this->filtros['tipo'] !== 'todos') {
            $query->where('tipo', $this->filtros['tipo']);
        }

        if (isset($this->filtros['estado']) && $this->filtros['estado'] !== 'todos') {
            $query->where('estado', $this->filtros['estado']);
        }

        if (isset($this->filtros['laboratorio_id']) && $this->filtros['laboratorio_id'] !== 'todos') {
            $query->where('laboratorio_id', $this->filtros['laboratorio_id']);
        }

        if (isset($this->filtros['data_inicio']) && isset($this->filtros['data_fim'])) {
            $query->whereBetween('data_aquisicao', [$this->filtros['data_inicio'], $this->filtros['data_fim']]);
        }

        return $query->orderBy('nome')->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Nome',
            'Tipo',
            'Fabricante',
            'Número de Série',
            'Patrimônio',
            'Estado',
            'Laboratório',
            'Data de Aquisição',
            'Gerenciado por Agente',
            'Hostname',
            'Processador',
            'Memória RAM',
            'Disco',
            'IP Local',
            'MAC Address',
        ];
    }

    public function map($equipamento): array
    {
        return [
            $equipamento->id,
            $equipamento->nome,
            $this->formatarTipo($equipamento->tipo),
            $equipamento->fabricante ?? '-',
            $equipamento->numero_serie ?? '-',
            $equipamento->patrimonio ?? '-',
            $this->formatarEstado($equipamento->estado),
            $equipamento->laboratorio->nome ?? 'Não alocado',
            $equipamento->data_aquisicao ? \Carbon\Carbon::parse($equipamento->data_aquisicao)->format('d/m/Y') : '-',
            $equipamento->gerenciado_por_agente ? 'Sim' : 'Não',
            $equipamento->hostname ?? '-',
            $equipamento->processador ?? '-',
            $equipamento->memoria_ram ?? '-',
            $equipamento->disco ?? '-',
            $equipamento->ip_local ?? '-',
            $equipamento->mac_address ?? '-',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }

    private function formatarTipo($tipo)
    {
        $tipos = [
            'computador' => 'Computador',
            'notebook' => 'Notebook',
            'projetor' => 'Projetor',
            'roteador' => 'Roteador',
            'switch' => 'Switch',
            'impressora' => 'Impressora',
            'scanner' => 'Scanner',
            'outro' => 'Outro',
        ];

        return $tipos[$tipo] ?? $tipo;
    }

    private function formatarEstado($estado)
    {
        $estados = [
            'em_uso' => 'Em Uso',
            'reserva' => 'Reserva',
            'manutencao' => 'Manutenção',
            'descartado' => 'Descartado',
        ];

        return $estados[$estado] ?? $estado;
    }
}

