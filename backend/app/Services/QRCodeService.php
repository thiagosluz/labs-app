<?php

namespace App\Services;

use App\Models\Equipamento;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Storage;

class QRCodeService
{
    public function generateForEquipamento(Equipamento $equipamento): string
    {
        // URL pública para visualização
        $url = config('app.frontend_url', 'http://localhost:3000') . '/equipamento/' . $equipamento->id . '/public';
        
        // Gerar QR code como PNG usando format SVG (não requer imagick)
        $qrCode = QrCode::format('svg')
            ->size(400)
            ->margin(1)
            ->errorCorrection('H')
            ->generate($url);
        
        // Salvar no storage
        $filename = 'qrcodes/equipamento_' . $equipamento->id . '_' . time() . '.svg';
        Storage::disk('public')->put($filename, $qrCode);
        
        return $filename;
    }
    
    public function deleteQrCode(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
    
    public function getPublicUrl(Equipamento $equipamento): string
    {
        return config('app.frontend_url', 'http://localhost:3000') . '/equipamento/' . $equipamento->id . '/public';
    }
}

