<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Manutenções</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            color: #333;
        }
        .header .subtitle {
            margin-top: 5px;
            color: #666;
        }
        .info {
            margin-bottom: 20px;
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 5px;
        }
        .info p {
            margin: 5px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th {
            background-color: #2196F3;
            color: white;
            padding: 10px;
            text-align: left;
            font-weight: bold;
        }
        td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        .badge {
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: bold;
        }
        .badge-success { background-color: #d4edda; color: #155724; }
        .badge-warning { background-color: #fff3cd; color: #856404; }
        .badge-danger { background-color: #f8d7da; color: #721c24; }
        .badge-info { background-color: #d1ecf1; color: #0c5460; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Relatório de Manutenções</h1>
        <div class="subtitle">IFG Câmpus Jataí - Gestão de Laboratórios</div>
    </div>

    <div class="info">
        <p><strong>Data de Geração:</strong> {{ $data }}</p>
        <p><strong>Total de Manutenções:</strong> {{ $manutencoes->count() }}</p>
        @if(isset($filtros['tipo']) && $filtros['tipo'] !== 'todos')
            <p><strong>Tipo:</strong> {{ ucfirst($filtros['tipo']) }}</p>
        @endif
        @if(isset($filtros['status']) && $filtros['status'] !== 'todos')
            <p><strong>Status:</strong> {{ ucfirst(str_replace('_', ' ', $filtros['status'])) }}</p>
        @endif
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 5%;">ID</th>
                <th style="width: 12%;">Data</th>
                <th style="width: 23%;">Equipamento</th>
                <th style="width: 12%;">Tipo</th>
                <th style="width: 15%;">Técnico</th>
                <th style="width: 13%;">Status</th>
                <th style="width: 20%;">Descrição</th>
            </tr>
        </thead>
        <tbody>
            @foreach($manutencoes as $manutencao)
            <tr>
                <td>{{ $manutencao->id }}</td>
                <td>{{ \Carbon\Carbon::parse($manutencao->data)->format('d/m/Y') }}</td>
                <td>{{ $manutencao->equipamento->nome ?? '-' }}</td>
                <td>
                    <span class="badge {{ $manutencao->tipo === 'preventiva' ? 'badge-info' : 'badge-warning' }}">
                        {{ ucfirst($manutencao->tipo) }}
                    </span>
                </td>
                <td>{{ $manutencao->tecnico->name ?? '-' }}</td>
                <td>
                    <span class="badge 
                        @if($manutencao->status === 'concluida') badge-success
                        @elseif($manutencao->status === 'em_andamento') badge-info
                        @elseif($manutencao->status === 'cancelada') badge-danger
                        @else badge-warning
                        @endif
                    ">
                        {{ ucfirst(str_replace('_', ' ', $manutencao->status)) }}
                    </span>
                </td>
                <td style="font-size: 10px;">{{ \Str::limit($manutencao->descricao, 50) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>Documento gerado automaticamente pelo Sistema de Gestão de Laboratórios - IFG Câmpus Jataí</p>
        <p>{{ $data }}</p>
    </div>
</body>
</html>

