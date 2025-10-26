<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Laboratórios</title>
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
            background-color: #FF9800;
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
        .badge-secondary { background-color: #e2e3e5; color: #383d41; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Relatório de Laboratórios</h1>
        <div class="subtitle">IFG Câmpus Jataí - Gestão de Laboratórios</div>
    </div>

    <div class="info">
        <p><strong>Data de Geração:</strong> {{ $data }}</p>
        <p><strong>Total de Laboratórios:</strong> {{ $laboratorios->count() }}</p>
        @if(isset($filtros['status']) && $filtros['status'] !== 'todos')
            <p><strong>Status:</strong> {{ ucfirst($filtros['status']) }}</p>
        @endif
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 5%;">ID</th>
                <th style="width: 30%;">Nome</th>
                <th style="width: 25%;">Localização</th>
                <th style="width: 25%;">Responsável</th>
                <th style="width: 10%;">Status</th>
                <th style="width: 15%;">Equipamentos</th>
            </tr>
        </thead>
        <tbody>
            @foreach($laboratorios as $laboratorio)
            <tr>
                <td>{{ $laboratorio->id }}</td>
                <td>{{ $laboratorio->nome }}</td>
                <td>{{ $laboratorio->localizacao ?? '-' }}</td>
                <td>{{ $laboratorio->responsavel->name ?? '-' }}</td>
                <td>
                    <span class="badge 
                        @if($laboratorio->status === 'ativo') badge-success
                        @elseif($laboratorio->status === 'manutencao') badge-warning
                        @else badge-secondary
                        @endif
                    ">
                        {{ ucfirst($laboratorio->status) }}
                    </span>
                </td>
                <td>{{ $laboratorio->equipamentos->count() }}</td>
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

