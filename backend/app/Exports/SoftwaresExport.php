<?php

namespace App\Exports;

use App\Models\Software;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class SoftwaresExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    protected $filtros;

    public function __construct(array $filtros = [])
    {
        $this->filtros = $filtros;
    }

    public function collection()
    {
        $query = Software::query();

        // Aplicar filtros
        if (isset($this->filtros['tipo_licenca']) && $this->filtros['tipo_licenca'] !== 'todos') {
            $query->where('tipo_licenca', $this->filtros['tipo_licenca']);
        }

        if (isset($this->filtros['status_expiracao'])) {
            if ($this->filtros['status_expiracao'] === 'expirado') {
                $query->whereNotNull('data_expiracao')
                    ->whereDate('data_expiracao', '<', now());
            } elseif ($this->filtros['status_expiracao'] === 'expirando') {
                $query->whereNotNull('data_expiracao')
                    ->whereDate('data_expiracao', '>=', now())
                    ->whereDate('data_expiracao', '<=', now()->addDays(30));
            }
        }

        return $query->orderBy('nome')->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Nome',
            'Versão',
            'Fabricante',
            'Tipo de Licença',
            'Qtd. Licenças',
            'Data de Expiração',
            'Status',
        ];
    }

    public function map($software): array
    {
        return [
            $software->id,
            $software->nome,
            $software->versao ?? '-',
            $software->fabricante ?? '-',
            $this->formatarTipoLicenca($software->tipo_licenca),
            $software->qtd_licencas_ilimitado ? 'Ilimitado' : $software->qtd_licencas,
            $software->data_expiracao ? \Carbon\Carbon::parse($software->data_expiracao)->format('d/m/Y') : '-',
            $this->getStatusExpiracao($software),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }

    private function formatarTipoLicenca($tipo)
    {
        $tipos = [
            'livre' => 'Livre',
            'educacional' => 'Educacional',
            'proprietario' => 'Proprietário',
        ];

        return $tipos[$tipo] ?? $tipo;
    }

    private function getStatusExpiracao($software)
    {
        if (!$software->data_expiracao) {
            return 'Sem expiração';
        }

        $dataExpiracao = \Carbon\Carbon::parse($software->data_expiracao);

        if ($dataExpiracao->isPast()) {
            return 'Expirado';
        }

        if ($dataExpiracao->diffInDays(now()) <= 30) {
            return 'Expirando em breve';
        }

        return 'Ativo';
    }
}

