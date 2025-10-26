<?php

namespace App\Observers;

use App\Models\Equipamento;
use App\Services\QRCodeService;

class EquipamentoObserver
{
    protected $qrCodeService;
    
    public function __construct(QRCodeService $qrCodeService)
    {
        $this->qrCodeService = $qrCodeService;
    }
    
    public function created(Equipamento $equipamento): void
    {
        // Gerar QR code automaticamente ao criar equipamento
        $path = $this->qrCodeService->generateForEquipamento($equipamento);
        $equipamento->update(['qr_code_path' => $path]);
    }
    
    public function deleted(Equipamento $equipamento): void
    {
        // Deletar QR code quando equipamento é excluído
        $this->qrCodeService->deleteQrCode($equipamento->qr_code_path);
    }
}


