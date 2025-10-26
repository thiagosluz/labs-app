<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Equipamentos</title>
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
            background-color: #4CAF50;
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
        .badge-secondary { background-color: #e2e3e5; color: #383d41; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Relatório de Equipamentos</h1>
        <div class="subtitle">IFG Câmpus Jataí - Gestão de Laboratórios</div>
    </div>

    <div class="info">
        <p><strong>Data de Geração:</strong> {{ $data }}</p>
        <p><strong>Total de Equipamentos:</strong> {{ $equipamentos->count() }}</p>
        @if(isset($filtros['tipo']) && $filtros['tipo'] !== 'todos')
            <p><strong>Tipo:</strong> {{ ucfirst($filtros['tipo']) }}</p>
        @endif
        @if(isset($filtros['estado']) && $filtros['estado'] !== 'todos')
            <p><strong>Estado:</strong> {{ ucfirst(str_replace('_', ' ', $filtros['estado'])) }}</p>
        @endif
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 5%;">ID</th>
                <th style="width: 20%;">Nome</th>
                <th style="width: 12%;">Tipo</th>
                <th style="width: 15%;">Patrimônio</th>
                <th style="width: 13%;">Estado</th>
                <th style="width: 20%;">Laboratório</th>
                <th style="width: 15%;">Aquisição</th>
            </tr>
        </thead>
        <tbody>
            @foreach($equipamentos as $equipamento)
            <tr>
                <td>{{ $equipamento->id }}</td>
                <td>{{ $equipamento->nome }}</td>
                <td>{{ ucfirst($equipamento->tipo) }}</td>
                <td>{{ $equipamento->patrimonio ?? '-' }}</td>
                <td>
                    <span class="badge 
                        @if($equipamento->estado === 'em_uso') badge-success
                        @elseif($equipamento->estado === 'manutencao') badge-warning
                        @elseif($equipamento->estado === 'descartado') badge-danger
                        @else badge-secondary
                        @endif
                    ">
                        {{ ucfirst(str_replace('_', ' ', $equipamento->estado)) }}
                    </span>
                </td>
                <td>{{ $equipamento->laboratorio->nome ?? 'Não alocado' }}</td>
                <td>{{ $equipamento->data_aquisicao ? \Carbon\Carbon::parse($equipamento->data_aquisicao)->format('d/m/Y') : '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    @php
        $equipamentosComAgente = $equipamentos->where('gerenciado_por_agente', true);
    @endphp

    @if($equipamentosComAgente->count() > 0)
    <div style="margin-top: 30px; page-break-before: always;">
        <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; margin-bottom: 20px;">
            Informações Técnicas (Agente)
        </h2>
        <p style="color: #666; margin-bottom: 20px;">
            Dados coletados automaticamente pelo agente de inventário
        </p>

        @foreach($equipamentosComAgente as $equipamento)
        <div style="margin-bottom: 25px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
            <h3 style="color: #4CAF50; margin: 0 0 15px 0; font-size: 16px;">
                {{ $equipamento->nome }} 
                @if($equipamento->hostname)
                    ({{ $equipamento->hostname }})
                @endif
            </h3>
            
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <!-- Hardware -->
                @if($equipamento->processador || $equipamento->memoria_ram || $equipamento->disco)
                <div style="flex: 1; min-width: 200px;">
                    <h4 style="color: #333; margin: 0 0 10px 0; font-size: 14px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
                        Hardware
                    </h4>
                    @if($equipamento->processador)
                    <p style="margin: 5px 0; font-size: 12px;"><strong>Processador:</strong> {{ $equipamento->processador }}</p>
                    @endif
                    @if($equipamento->memoria_ram)
                    <p style="margin: 5px 0; font-size: 12px;"><strong>Memória RAM:</strong> {{ $equipamento->memoria_ram }}</p>
                    @endif
                    @if($equipamento->disco)
                    <p style="margin: 5px 0; font-size: 12px;"><strong>Disco:</strong> {{ $equipamento->disco }}</p>
                    @endif
                </div>
                @endif

                <!-- Rede -->
                @if($equipamento->ip_local || $equipamento->mac_address || $equipamento->gateway)
                <div style="flex: 1; min-width: 200px;">
                    <h4 style="color: #333; margin: 0 0 10px 0; font-size: 14px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
                        Rede
                    </h4>
                    @if($equipamento->ip_local)
                    <p style="margin: 5px 0; font-size: 12px;"><strong>IP Local:</strong> {{ $equipamento->ip_local }}</p>
                    @endif
                    @if($equipamento->mac_address)
                    <p style="margin: 5px 0; font-size: 12px;"><strong>MAC Address:</strong> {{ $equipamento->mac_address }}</p>
                    @endif
                    @if($equipamento->gateway)
                    <p style="margin: 5px 0; font-size: 12px;"><strong>Gateway:</strong> {{ $equipamento->gateway }}</p>
                    @endif
                    @if($equipamento->dns_servers && count($equipamento->dns_servers) > 0)
                    <p style="margin: 5px 0; font-size: 12px;"><strong>DNS:</strong> {{ implode(', ', $equipamento->dns_servers) }}</p>
                    @endif
                </div>
                @endif
            </div>

            @if($equipamento->agent_version || $equipamento->ultima_sincronizacao)
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 11px; color: #666;">
                @if($equipamento->agent_version)
                <span><strong>Agente:</strong> v{{ $equipamento->agent_version }}</span>
                @endif
                @if($equipamento->ultima_sincronizacao)
                <span style="margin-left: 15px;"><strong>Última Sync:</strong> {{ \Carbon\Carbon::parse($equipamento->ultima_sincronizacao)->format('d/m/Y H:i') }}</span>
                @endif
            </div>
            @endif
        </div>
        @endforeach
    </div>
    @endif

    <div class="footer">
        <p>Documento gerado automaticamente pelo Sistema de Gestão de Laboratórios - IFG Câmpus Jataí</p>
        <p>{{ $data }}</p>
    </div>
</body>
</html>

