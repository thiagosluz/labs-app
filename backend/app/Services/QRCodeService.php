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
        
        // Verificar se deve incluir logo
        $withLogo = \App\Models\SystemSetting::get('logo_enabled_in_qr', false);
        $logoPath = null;
        
        if ($withLogo) {
            $logoPath = \App\Models\SystemSetting::get('logo_path');
        }
        
        // Verificar cores personalizadas
        $qrColor = \App\Models\SystemSetting::get('qr_color', '#000000');
        $qrBackground = \App\Models\SystemSetting::get('qr_background', '#FFFFFF');
        
        // Gerar QR code
        $qrCode = QrCode::format('svg')
            ->size(400)
            ->margin(1)
            ->errorCorrection('H');
        
        // Aplicar cores se personalizadas
        if ($qrColor !== '#000000' || $qrBackground !== '#FFFFFF') {
            // Converter hex para RGB (0-255)
            $colorR = hexdec(substr($qrColor, 1, 2));
            $colorG = hexdec(substr($qrColor, 3, 2));
            $colorB = hexdec(substr($qrColor, 5, 2));
            
            $bgR = hexdec(substr($qrBackground, 1, 2));
            $bgG = hexdec(substr($qrBackground, 3, 2));
            $bgB = hexdec(substr($qrBackground, 5, 2));
            
            $qrCode->color($colorR, $colorG, $colorB);
            $qrCode->backgroundColor($bgR, $bgG, $bgB);
        }
        
        // Aplicar logo se configurado
        if ($logoPath && Storage::disk('public')->exists($logoPath)) {
            $qrCode->mergeString(Storage::disk('public')->get($logoPath), .2); // 20% do tamanho
        }
        
        $qrCodeGenerated = $qrCode->generate($url);
        
        // Salvar no storage
        $filename = 'qrcodes/equipamento_' . $equipamento->id . '_' . time() . '.svg';
        Storage::disk('public')->put($filename, $qrCodeGenerated);
        
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
    
    /**
     * Gerar QR code com logo e cores personalizadas
     */
    public function generateWithCustomStyle(Equipamento $equipamento, array $options = []): string
    {
        $url = config('app.frontend_url', 'http://localhost:3000') . '/equipamento/' . $equipamento->id . '/public';
        
        $size = $options['size'] ?? 400;
        $color = $options['color'] ?? '#000000';
        $background = $options['background'] ?? '#FFFFFF';
        $logoPath = $options['logo_path'] ?? null;
        $logoSize = $options['logo_size'] ?? 0.2;
        
        // Converter hex para RGB (0-255)
        $colorR = hexdec(substr($color, 1, 2));
        $colorG = hexdec(substr($color, 3, 2));
        $colorB = hexdec(substr($color, 5, 2));
        
        $bgR = hexdec(substr($background, 1, 2));
        $bgG = hexdec(substr($background, 3, 2));
        $bgB = hexdec(substr($background, 5, 2));
        
        $qrCode = QrCode::format('svg')
            ->size($size)
            ->margin(1)
            ->errorCorrection('H')
            ->color($colorR, $colorG, $colorB)
            ->backgroundColor($bgR, $bgG, $bgB);
        
        if ($logoPath && Storage::disk('public')->exists($logoPath)) {
            $qrCode->mergeString(Storage::disk('public')->get($logoPath), $logoSize);
        }
        
        $qrCodeGenerated = $qrCode->generate($url);
        
        $filename = 'qrcodes/equipamento_' . $equipamento->id . '_' . time() . '.svg';
        Storage::disk('public')->put($filename, $qrCodeGenerated);
        
        return $filename;
    }
}

