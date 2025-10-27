<?php

use App\Http\Controllers\Api\V1\AgentController;
use App\Http\Controllers\Api\V1\AgentManagementController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\EquipamentoController;
use App\Http\Controllers\Api\V1\EtiquetaController;
use App\Http\Controllers\Api\V1\LabelTemplateController;
use App\Http\Controllers\Api\V1\LaboratorioController;
use App\Http\Controllers\Api\V1\ManutencaoController;
use App\Http\Controllers\Api\V1\PublicEquipamentoController;
use App\Http\Controllers\Api\V1\RelatorioController;
use App\Http\Controllers\Api\V1\SoftwareController;
use App\Http\Controllers\Api\V1\SystemSettingsController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Version 1
|--------------------------------------------------------------------------
*/

// Rotas públicas (sem autenticação)
Route::prefix('v1')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    
    // Endpoint público para visualização de equipamentos via QR code
    Route::get('/public/equipamentos/{equipamento}', [PublicEquipamentoController::class, 'show']);
});

// Rotas protegidas (com autenticação via sessão - SPA)
Route::prefix('v1')->middleware(['auth:sanctum'])->group(function () {
    
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/relatorios/equipamentos-por-laboratorio', [DashboardController::class, 'relatorioEquipamentosPorLaboratorio']);
    Route::get('/relatorios/softwares-por-laboratorio', [DashboardController::class, 'relatorioSoftwaresPorLaboratorio']);
    Route::get('/relatorios/manutencoes/{dataInicio}/{dataFim}', [DashboardController::class, 'relatorioManutencoesPorPeriodo']);

    // Usuários
    Route::get('users', [UserController::class, 'index']);
    Route::get('users/{user}', [UserController::class, 'show']);

    // Laboratórios
    Route::apiResource('laboratorios', LaboratorioController::class);
    Route::post('/laboratorios/bulk-destroy', [LaboratorioController::class, 'bulkDestroy']);

    // Equipamentos
    Route::apiResource('equipamentos', EquipamentoController::class);
    Route::post('/equipamentos/{equipamento}/softwares', [EquipamentoController::class, 'attachSoftware']);
    Route::delete('/equipamentos/{equipamento}/softwares/{software}', [EquipamentoController::class, 'detachSoftware']);
    Route::post('/equipamentos/bulk-destroy', [EquipamentoController::class, 'bulkDestroy']);
    Route::post('/equipamentos/{equipamento}/regenerate-qr', [EquipamentoController::class, 'regenerateQrCode']);
    
    // Etiquetas
    Route::get('/equipamentos/{equipamento}/etiqueta', [EtiquetaController::class, 'single']);
    Route::post('/equipamentos/etiquetas/bulk', [EtiquetaController::class, 'bulk']);

    // Softwares
    Route::apiResource('softwares', SoftwareController::class);
    Route::post('/softwares/bulk-destroy', [SoftwareController::class, 'bulkDestroy']);

    // Manutenções
    Route::apiResource('manutencoes', ManutencaoController::class);
    Route::post('/manutencoes/bulk-destroy', [ManutencaoController::class, 'bulkDestroy']);

    // Relatórios PDF
    Route::get('/relatorios/equipamentos/pdf', [RelatorioController::class, 'equipamentosPdf']);
    Route::get('/relatorios/manutencoes/pdf', [RelatorioController::class, 'manutencoesPdf']);
    Route::get('/relatorios/softwares/pdf', [RelatorioController::class, 'softwaresPdf']);
    Route::get('/relatorios/laboratorios/pdf', [RelatorioController::class, 'laboratoriosPdf']);

    // Relatórios Excel
    Route::get('/relatorios/equipamentos/excel', [RelatorioController::class, 'equipamentosExcel']);
    Route::get('/relatorios/manutencoes/excel', [RelatorioController::class, 'manutencoesExcel']);
    Route::get('/relatorios/softwares/excel', [RelatorioController::class, 'softwaresExcel']);
    Route::get('/relatorios/laboratorios/excel', [RelatorioController::class, 'laboratoriosExcel']);

    // Gerenciamento de Agentes (Admin)
    Route::get('/agent-management', [AgentManagementController::class, 'index']);
    Route::post('/agent-management', [AgentManagementController::class, 'store']);
    Route::delete('/agent-management/{agentKey}', [AgentManagementController::class, 'destroy']);
    Route::post('/agent-management/{agentKey}/reactivate', [AgentManagementController::class, 'reactivate']);
    Route::post('/agent-management/bulk-destroy', [AgentManagementController::class, 'bulkDestroy']);
    Route::get('/agent-management/download', [AgentManagementController::class, 'downloadAgent']);
    
    // Configurações do Sistema (Admin)
    Route::get('/system-settings', [SystemSettingsController::class, 'index']);
    Route::post('/system-settings', [SystemSettingsController::class, 'update']);
    Route::post('/system-settings/upload-logo', [SystemSettingsController::class, 'uploadLogo']);
    
    // Templates de Etiquetas (Admin/Tecnico)
    Route::get('/label-templates', [LabelTemplateController::class, 'index']);
    Route::post('/label-templates', [LabelTemplateController::class, 'store']);
    Route::put('/label-templates/{labelTemplate}', [LabelTemplateController::class, 'update']);
    Route::delete('/label-templates/{labelTemplate}', [LabelTemplateController::class, 'destroy']);
    Route::post('/label-templates/{labelTemplate}/duplicate', [LabelTemplateController::class, 'duplicate']);
    Route::post('/label-templates/{labelTemplate}/set-default', [LabelTemplateController::class, 'setDefault']);
});

// Rotas do Agente (autenticação via API Key)
Route::prefix('v1/agent')->middleware('agent.auth')->group(function () {
    Route::post('/sync-equipamento', [AgentController::class, 'syncEquipamento']);
    Route::post('/sync-softwares', [AgentController::class, 'syncSoftwares']);
    Route::post('/sync-equipamento-softwares', [AgentController::class, 'syncEquipamentoSoftwares']);
});

