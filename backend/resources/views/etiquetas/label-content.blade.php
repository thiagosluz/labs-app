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
        @if(isset($settings) && $settings['logo_enabled_in_label'] && isset($settings['logo_path']) && $settings['logo_path'])
            @php
                $logoPath = storage_path('app/public/' . $settings['logo_path']);
                if (file_exists($logoPath)) {
                    $logoContent = file_get_contents($logoPath);
                    $logoBase64 = 'data:image/png;base64,' . base64_encode($logoContent);
                }
            @endphp
            @if(isset($logoBase64))
                <img src="{{ $logoBase64 }}" alt="Logo" style="max-height: 20px; margin-bottom: 5px;">
            @else
                <div class="logo">IFG - CÂMPUS JATAÍ</div>
            @endif
        @else
            <div class="logo">IFG - CÂMPUS JATAÍ</div>
        @endif
        <div class="nome">{{ $equipamento->nome }}</div>
        
        @php
            $fields = is_array($template->fields) ? $template->fields : [];
        @endphp
        
        @if(in_array('patrimonio', $fields) && $equipamento->patrimonio)
            <div class="detalhe"><strong>Patrimônio:</strong> {{ $equipamento->patrimonio }}</div>
        @endif
        
        @if(in_array('numero_serie', $fields) && $equipamento->numero_serie)
            <div class="detalhe"><strong>Série:</strong> {{ $equipamento->numero_serie }}</div>
        @endif
        
        @if(in_array('laboratorio', $fields) && $equipamento->laboratorio)
            <div class="detalhe"><strong>Local:</strong> {{ $equipamento->laboratorio->nome }}</div>
        @endif
        
        @if(in_array('id', $fields))
            <div class="detalhe"><strong>ID:</strong> #{{ $equipamento->id }}</div>
        @endif
        
        @if(in_array('tipo', $fields))
            <div class="detalhe"><strong>Tipo:</strong> {{ ucfirst($equipamento->tipo) }}</div>
        @endif
    </div>
</div>


