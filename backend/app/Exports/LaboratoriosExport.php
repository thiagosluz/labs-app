<?php

namespace App\Exports;

use App\Models\Laboratorio;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class LaboratoriosExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    protected $filtros;

    public function __construct(array $filtros = [])
    {
        $this->filtros = $filtros;
    }

    public function collection()
    {
        $query = Laboratorio::with(['responsavel', 'equipamentos']);

        // Aplicar filtros
        if (isset($this->filtros['status']) && $this->filtros['status'] !== 'todos') {
            $query->where('status', $this->filtros['status']);
        }

        return $query->orderBy('nome')->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Nome',
            'Localização',
            'Responsável',
            'Status',
            'Qtd. Equipamentos',
        ];
    }

    public function map($laboratorio): array
    {
        return [
            $laboratorio->id,
            $laboratorio->nome,
            $laboratorio->localizacao ?? '-',
            $laboratorio->responsavel->name ?? '-',
            $this->formatarStatus($laboratorio->status),
            $laboratorio->equipamentos->count(),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }

    private function formatarStatus($status)
    {
        $statuses = [
            'ativo' => 'Ativo',
            'inativo' => 'Inativo',
            'manutencao' => 'Manutenção',
        ];

        return $statuses[$status] ?? $status;
    }
}

