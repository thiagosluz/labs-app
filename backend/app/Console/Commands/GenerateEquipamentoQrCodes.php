<?php

namespace App\Console\Commands;

use App\Models\Equipamento;
use App\Services\QRCodeService;
use Illuminate\Console\Command;

class GenerateEquipamentoQrCodes extends Command
{
    protected $signature = 'equipamentos:generate-qrcodes {--force : Regenerar todos}';
    
    protected $description = 'Gerar QR codes para equipamentos';
    
    public function handle(QRCodeService $qrCodeService): int
    {
        $force = $this->option('force');
        
        $query = Equipamento::query();
        if (!$force) {
            $query->whereNull('qr_code_path');
        }
        
        $equipamentos = $query->get();
        $count = $equipamentos->count();
        
        if ($count === 0) {
            $this->info('Nenhum equipamento para processar.');
            return 0;
        }
        
        $this->info("Gerando QR codes para {$count} equipamentos...");
        
        $bar = $this->output->createProgressBar($count);
        $bar->start();
        
        foreach ($equipamentos as $equipamento) {
            try {
                if ($force && $equipamento->qr_code_path) {
                    $qrCodeService->deleteQrCode($equipamento->qr_code_path);
                }
                
                $path = $qrCodeService->generateForEquipamento($equipamento);
                $equipamento->update(['qr_code_path' => $path]);
            } catch (\Exception $e) {
                $this->error("Erro ao gerar QR code para equipamento {$equipamento->id}: " . $e->getMessage());
            }
            
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine();
        $this->info("QR codes gerados com sucesso!");
        
        return 0;
    }
}


