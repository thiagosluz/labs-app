<?php

namespace App\Exports;

use App\Models\Manutencao;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ManutencoesExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    protected $filtros;

    public function __construct(array $filtros = [])
    {
        $this->filtros = $filtros;
    }

    public function collection()
    {
        $query = Manutencao::with(['equipamento', 'tecnico']);

        // Aplicar filtros
        if (isset($this->filtros['tipo']) && $this->filtros['tipo'] !== 'todos') {
            $query->where('tipo', $this->filtros['tipo']);
        }

        if (isset($this->filtros['status']) && $this->filtros['status'] !== 'todos') {
            $query->where('status', $this->filtros['status']);
        }

        if (isset($this->filtros['data_inicio']) && isset($this->filtros['data_fim'])) {
            $query->whereBetween('data', [$this->filtros['data_inicio'], $this->filtros['data_fim']]);
        }

        return $query->orderBy('data', 'desc')->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Data',
            'Equipamento',
            'Tipo',
            'Descrição',
            'Técnico',
            'Status',
        ];
    }

    public function map($manutencao): array
    {
        return [
            $manutencao->id,
            \Carbon\Carbon::parse($manutencao->data)->format('d/m/Y'),
            $manutencao->equipamento->nome ?? '-',
            $this->formatarTipo($manutencao->tipo),
            $manutencao->descricao,
            $manutencao->tecnico->name ?? '-',
            $this->formatarStatus($manutencao->status),
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
        return $tipo === 'preventiva' ? 'Preventiva' : 'Corretiva';
    }

    private function formatarStatus($status)
    {
        $statuses = [
            'pendente' => 'Pendente',
            'em_andamento' => 'Em Andamento',
            'concluida' => 'Concluída',
            'cancelada' => 'Cancelada',
        ];

        return $statuses[$status] ?? $status;
    }
}

