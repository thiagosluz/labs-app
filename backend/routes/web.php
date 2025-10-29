<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::get('/', function () {
    return view('welcome');
});

// Serve storage files (QR codes, logos, etc.)
Route::get('/storage/{path}', function ($path) {
    // Remover duplos slashes e normalizar caminho
    $filePath = ltrim(str_replace('//', '/', $path), '/');
    
    // Verificar se o arquivo existe no storage público
    if (!Storage::disk('public')->exists($filePath)) {
        abort(404, 'File not found: ' . $filePath);
    }
    
    try {
        // Servir o arquivo com headers apropriados
        $file = Storage::disk('public')->get($filePath);
        $mimeType = Storage::disk('public')->mimeType($filePath) ?? 'application/octet-stream';
        
        return response($file, 200)
            ->header('Content-Type', $mimeType)
            ->header('Cache-Control', 'public, max-age=31536000');
    } catch (\Exception $e) {
        abort(500, 'Error serving file');
    }
})->where('path', '.*');
