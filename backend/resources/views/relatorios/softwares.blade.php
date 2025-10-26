<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Softwares</title>
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
            background-color: #9C27B0;
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
    </style>
</head>
<body>
    <div class="header">
        <h1>Relatório de Softwares</h1>
        <div class="subtitle">IFG Câmpus Jataí - Gestão de Laboratórios</div>
    </div>

    <div class="info">
        <p><strong>Data de Geração:</strong> {{ $data }}</p>
        <p><strong>Total de Softwares:</strong> {{ $softwares->count() }}</p>
        @if(isset($filtros['tipo_licenca']) && $filtros['tipo_licenca'] !== 'todos')
            <p><strong>Tipo de Licença:</strong> {{ ucfirst($filtros['tipo_licenca']) }}</p>
        @endif
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 5%;">ID</th>
                <th style="width: 22%;">Nome</th>
                <th style="width: 10%;">Versão</th>
                <th style="width: 18%;">Fabricante</th>
                <th style="width: 13%;">Tipo Licença</th>
                <th style="width: 10%;">Qtd.</th>
                <th style="width: 12%;">Expiração</th>
                <th style="width: 10%;">Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($softwares as $software)
            @php
                $dataExpiracao = $software->data_expiracao ? \Carbon\Carbon::parse($software->data_expiracao) : null;
                $expirado = $dataExpiracao && $dataExpiracao->isPast();
                $expirando = $dataExpiracao && !$expirado && $dataExpiracao->diffInDays(now()) <= 30;
            @endphp
            <tr>
                <td>{{ $software->id }}</td>
                <td>{{ $software->nome }}</td>
                <td>{{ $software->versao ?? '-' }}</td>
                <td>{{ $software->fabricante ?? '-' }}</td>
                <td>{{ ucfirst($software->tipo_licenca) }}</td>
                <td>{{ $software->qtd_licencas_ilimitado ? '∞' : $software->qtd_licencas }}</td>
                <td>{{ $dataExpiracao ? $dataExpiracao->format('d/m/Y') : '-' }}</td>
                <td>
                    @if($expirado)
                        <span class="badge badge-danger">Expirado</span>
                    @elseif($expirando)
                        <span class="badge badge-warning">Expirando</span>
                    @else
                        <span class="badge badge-success">Ativo</span>
                    @endif
                </td>
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

