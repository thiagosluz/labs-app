<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use App\Models\Equipamento;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Artisan;

class SystemSettingsController extends Controller
{
    /**
     * Listar configurações
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', SystemSetting::class);
        
        $group = $request->query('group');
        $query = SystemSetting::query();
        
        if ($group) {
            $query->where('group', $group);
        }
        
        $settings = $query->get()->mapWithKeys(function ($setting) {
            return [$setting->key => $setting->value];
        });
        
        return response()->json($settings);
    }

    /**
     * Atualizar configurações
     */
    public function update(Request $request): JsonResponse
    {
        Gate::authorize('update', SystemSetting::class);
        
        $validated = $request->validate([
            'logo_enabled_in_qr' => 'sometimes',
            'logo_enabled_in_label' => 'sometimes',
            'qr_color' => 'sometimes|nullable',
            'qr_background' => 'sometimes|nullable',
        ]);
        
        // Verificar se as cores foram alteradas
        $colorsChanged = false;
        $oldQrColor = SystemSetting::get('qr_color', '#000000');
        $oldQrBackground = SystemSetting::get('qr_background', '#FFFFFF');
        
        if (isset($validated['qr_color']) && $validated['qr_color'] !== $oldQrColor) {
            $colorsChanged = true;
        }
        if (isset($validated['qr_background']) && $validated['qr_background'] !== $oldQrBackground) {
            $colorsChanged = true;
        }
        
        foreach ($validated as $key => $value) {
            // Converter boolean para string
            if ($key === 'logo_enabled_in_qr' || $key === 'logo_enabled_in_label') {
                $boolValue = filter_var($value, FILTER_VALIDATE_BOOLEAN);
                SystemSetting::set($key, $boolValue, 'boolean', 'qrcode');
            } else {
                SystemSetting::set($key, $value ?? '', 'string', 'qrcode');
            }
        }
        
        // Se as cores mudaram, regenerar QR codes em background
        if ($colorsChanged) {
            Artisan::call('equipamentos:generate-qrcodes', [
                '--force' => true
            ]);
        }
        
        return response()->json(['message' => 'Configurações atualizadas com sucesso']);
    }

    /**
     * Upload de logo
     */
    public function uploadLogo(Request $request): JsonResponse
    {
        try {
            Gate::authorize('update', SystemSetting::class);
            
            \Log::info('Upload de logo iniciado', [
                'hasFile' => $request->hasFile('logo'),
                'allFiles' => $request->allFiles(),
            ]);
            
            $validated = $request->validate([
                'logo' => 'required|image|mimes:png,jpg,jpeg,svg|max:2048',
            ]);
            
            if ($request->hasFile('logo')) {
                \Log::info('Arquivo recebido', [
                    'filename' => $request->file('logo')->getClientOriginalName(),
                    'mime' => $request->file('logo')->getMimeType(),
                    'size' => $request->file('logo')->getSize(),
                ]);
                
                $path = $request->file('logo')->store('logos', 'public');
                \Log::info('Arquivo salvo', ['path' => $path]);
                
                // Deletar logo antiga se existir
                $oldLogo = SystemSetting::get('logo_path');
                if ($oldLogo && Storage::disk('public')->exists($oldLogo)) {
                    Storage::disk('public')->delete($oldLogo);
                }
                
                SystemSetting::set('logo_path', $path, 'string', 'general');
                \Log::info('Logo salva no sistema');
                
                return response()->json([
                    'message' => 'Logo enviada com sucesso',
                    'logo_url' => Storage::disk('public')->url($path),
                ]);
            }
            
            return response()->json(['error' => 'Arquivo não encontrado'], 400);
        } catch (\Exception $e) {
            \Log::error('Erro no upload de logo', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
