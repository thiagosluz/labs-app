<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ isset($equipamentos) ? 'Etiquetas de Equipamentos' : "Etiqueta - {$equipamento->nome}" }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: {{ $template->styles['font_size_detail'] ?? 8 }}px; }
        
        @php
            $widthCm = $template->width;
            $heightCm = $template->height;
            $qrSizeCm = $template->qr_size;
        @endphp
        
        .etiqueta {
            width: {{ $widthCm }}cm;
            height: {{ $heightCm }}cm;
            padding: {{ ($template->styles['padding'] ?? 10) }}px;
            border: 1px solid #ccc;
            display: table;
            table-layout: fixed;
            overflow: hidden;
            box-sizing: border-box;
        }
        .qrcode {
            width: {{ $qrSizeCm }}cm !important;
            display: table-cell;
            vertical-align: middle;
            text-align: center;
            padding-right: 8px;
            overflow: hidden;
        }
        .qrcode img {
            width: {{ $qrSizeCm }}cm !important;
            height: {{ $qrSizeCm }}cm !important;
            max-width: {{ $qrSizeCm }}cm;
            max-height: {{ $qrSizeCm }}cm;
            object-fit: contain;
        }
        .info {
            display: table-cell;
            vertical-align: top;
            overflow: hidden;
            width: auto;
        }
        .logo {
            font-size: {{ ($template->styles['font_size_name'] ?? 10) }}px;
            color: {{ $template->styles['header_color'] ?? '#22c55e' }};
            font-weight: bold;
            margin-bottom: 8px;
        }
        .nome {
            font-size: {{ $template->styles['font_size_name'] ?? 12 }}px;
            font-weight: bold;
            margin-bottom: 3px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 100%;
            flex-shrink: 1;
        }
        .detalhe {
            font-size: {{ $template->styles['font_size_detail'] ?? 8 }}px;
            color: #666;
            margin-bottom: 1px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            line-height: 1.2;
            max-width: 100%;
            flex-shrink: 1;
        }
        .detalhe strong {
            color: #333;
        }
        .page {
            padding: 0.5cm;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax({{ $widthCm }}cm, 1fr));
            gap: 0.3cm;
        }
    </style>
</head>
<body>
    @if(isset($equipamentos))
        <div class="page">
            <div class="grid">
                @foreach($equipamentos as $equipamento)
                    @include('etiquetas.label-content', ['equipamento' => $equipamento, 'template' => $template])
                @endforeach
            </div>
        </div>
    @else
        @include('etiquetas.label-content', ['equipamento' => $equipamento, 'template' => $template])
    @endif
</body>
</html>


