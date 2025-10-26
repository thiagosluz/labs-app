<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Etiquetas de Equipamentos</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 12px; }
        .page {
            padding: 0.5cm;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.3cm;
        }
        .etiqueta {
            width: 10cm;
            height: 5cm;
            padding: 10px;
            border: 1px solid #ccc;
            display: flex;
            align-items: center;
            page-break-inside: avoid;
        }
        .qrcode {
            width: 4cm;
            height: 4cm;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .qrcode img {
            width: 100%;
            height: 100%;
        }
        .info {
            flex: 1;
            padding-left: 15px;
        }
        .logo {
            font-size: 10px;
            color: #22c55e;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .nome {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 3px;
        }
        .detalhe {
            font-size: 9px;
            color: #666;
            margin-bottom: 2px;
        }
        .detalhe strong {
            color: #333;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="grid">
            @foreach($equipamentos as $equipamento)
                <div class="etiqueta">
                    <div class="qrcode">
                        @if($equipamento->qr_code_path && file_exists(storage_path('app/public/' . $equipamento->qr_code_path)))
                            @php
                                $qrCodePath = storage_path('app/public/' . $equipamento->qr_code_path);
                                $qrCodeContent = file_get_contents($qrCodePath);
                                $base64QrCode = 'data:image/svg+xml;base64,' . base64_encode($qrCodeContent);
                            @endphp
                            <img src="{{ $base64QrCode }}" alt="QR Code">
                        @else
                            <div style="width: 100%; height: 100%; border: 2px dashed #ccc; display: flex; align-items: center; justify-content: center; color: #999; font-size: 10px;">
                                QR Code Indisponível
                            </div>
                        @endif
                    </div>
                    <div class="info">
                        <div class="logo">IFG - CÂMPUS JATAÍ</div>
                        <div class="nome">{{ $equipamento->nome }}</div>
                        @if($equipamento->patrimonio)
                            <div class="detalhe"><strong>Patrimônio:</strong> {{ $equipamento->patrimonio }}</div>
                        @endif
                        @if($equipamento->numero_serie)
                            <div class="detalhe"><strong>Série:</strong> {{ $equipamento->numero_serie }}</div>
                        @endif
                        @if($equipamento->laboratorio)
                            <div class="detalhe"><strong>Local:</strong> {{ $equipamento->laboratorio->nome }}</div>
                        @endif
                        <div class="detalhe"><strong>ID:</strong> #{{ $equipamento->id }}</div>
                        <div class="detalhe"><strong>Tipo:</strong> {{ ucfirst($equipamento->tipo) }}</div>
                    </div>
                </div>
            @endforeach
        </div>
    </div>
</body>
</html>

