<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Equipamento;
use App\Models\Software;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class AgentController extends Controller
{
    /**
     * Sincronizar equipamento
     * POST /api/v1/agent/sync-equipamento
     */
    public function syncEquipamento(Request $request): JsonResponse
    {
        // Log de entrada do request
        Log::info('=== INÍCIO sync-equipamento ===', [
            'method' => $request->method(),
            'content_type' => $request->header('Content-Type'),
            'content_length' => $request->header('Content-Length'),
            'request_size' => strlen($request->getContent()),
        ]);

        try {
            $validated = $request->validate([
                'hostname' => 'required|string|max:255',
                'numero_serie' => 'nullable|string|max:255',
                'fabricante' => 'nullable|string|max:255',
                'modelo' => 'nullable|string|max:255',
                'processador' => 'nullable|string|max:255',
                'memoria_ram' => 'nullable|string|max:255',
                'disco' => 'nullable|string|max:255',
                'ip_local' => 'nullable|string|max:255',
                'mac_address' => 'nullable|string|max:255',
                'gateway' => 'nullable|string|max:255',
                'dns_servers' => 'nullable|array',
                'laboratorio_id' => 'required|exists:laboratorios,id',
                'dados_hash' => 'required|string|max:255',
            ]);

            // Buscar equipamento existente por número de série ou MAC (incluindo soft deleted)
            $equipamento = null;
            
            // Primeiro, tentar por número de série
            if (!empty($validated['numero_serie'])) {
                $equipamento = Equipamento::withTrashed()
                    ->where('numero_serie', $validated['numero_serie'])
                    ->first();
            }
            
            // Se não encontrou por número de série, tentar por MAC
            if (!$equipamento && !empty($validated['mac_address'])) {
                $equipamento = Equipamento::withTrashed()
                    ->where('mac_address', $validated['mac_address'])
                    ->first();
            }

            // Sanitização básica
            $hostname = mb_substr(trim($validated['hostname']), 0, 255);
            $data = [
                'nome' => $hostname,
                'hostname' => $hostname,
                'tipo' => 'computador',
                'fabricante' => isset($validated['fabricante']) ? mb_substr((string) $validated['fabricante'], 0, 255) : null,
                'modelo' => isset($validated['modelo']) ? mb_substr((string) $validated['modelo'], 0, 255) : null,
                'numero_serie' => isset($validated['numero_serie']) ? mb_substr((string) $validated['numero_serie'], 0, 255) : null,
                'processador' => isset($validated['processador']) ? mb_substr((string) $validated['processador'], 0, 255) : null,
                'memoria_ram' => isset($validated['memoria_ram']) ? mb_substr((string) $validated['memoria_ram'], 0, 255) : null,
                'disco' => isset($validated['disco']) ? mb_substr((string) $validated['disco'], 0, 255) : null,
                'ip_local' => isset($validated['ip_local']) ? mb_substr((string) $validated['ip_local'], 0, 255) : null,
                'mac_address' => isset($validated['mac_address']) ? mb_substr((string) $validated['mac_address'], 0, 255) : null,
                'gateway' => isset($validated['gateway']) ? mb_substr((string) $validated['gateway'], 0, 255) : null,
                'dns_servers' => $validated['dns_servers'] ?? null,
                'laboratorio_id' => $validated['laboratorio_id'],
                'estado' => 'em_uso',
                'gerenciado_por_agente' => true,
                'agent_version' => $request->agent_key->version ?? '1.0',
                'ultima_sincronizacao' => now(),
                'dados_hash' => mb_substr($validated['dados_hash'], 0, 255),
            ];

            $wasRecentlyCreated = false;
            $wasRestored = false;

            if ($equipamento) {
                // Se estava soft deleted, restaurar
                if ($equipamento->trashed()) {
                    $equipamento->restore();
                    $wasRestored = true;
                    Log::info("Equipamento restaurado pelo agente: {$equipamento->id}");
                }
                
                // Atualizar apenas se hash mudou ou foi restaurado
                if ($equipamento->dados_hash !== $data['dados_hash'] || $wasRestored) {
                    $equipamento->update($data);
                    Log::info("Equipamento atualizado pelo agente: {$equipamento->id}");
                }
            } else {
                // Criar novo
                $equipamento = Equipamento::create($data);
                $wasRecentlyCreated = true;
                Log::info("Novo equipamento criado pelo agente: {$equipamento->id}");
            }

            return response()->json([
                'equipamento_id' => $equipamento->id,
                'action' => $wasRecentlyCreated ? 'created' : ($wasRestored ? 'restored' : 'updated'),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Erro de validação em sync-equipamento', [
                'errors' => $e->errors(),
                'input' => $request->all(),
            ]);
            return response()->json([
                'message' => 'Erro de validação',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            Log::error('Erro fatal em sync-equipamento', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
            ]);
            return response()->json([
                'message' => 'Erro interno do servidor',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Sincronizar softwares
     * POST /api/v1/agent/sync-softwares
     */
    public function syncSoftwares(Request $request): JsonResponse
    {
        // Log imediato no início do método
        Log::info('=== INÍCIO sync-softwares ===', [
            'method' => $request->method(),
            'content_type' => $request->header('Content-Type'),
            'content_length' => $request->header('Content-Length'),
            'has_json' => $request->has('softwares'),
            'request_size' => strlen($request->getContent()),
        ]);
        
        try {
            // Verificar se o payload está presente
            $softwaresInput = $request->input('softwares', []);
            
            // Log do payload recebido para debug (apenas primeiro para não poluir logs)
            Log::info('Recebida requisição sync-softwares', [
                'payload_size' => is_array($softwaresInput) ? count($softwaresInput) : 0,
                'payload_type' => gettype($softwaresInput),
                'first_software' => is_array($softwaresInput) && isset($softwaresInput[0]) ? array_slice($softwaresInput[0], 0, 3) : null,
            ]);

            // Validar estrutura básica
            $validated = $request->validate([
                'softwares' => 'required|array|min:1',
                'softwares.*.nome' => 'required|string|max:255',
                'softwares.*.versao' => 'nullable|string|max:255',
                'softwares.*.fabricante' => 'nullable|string|max:255',
                'softwares.*.data_instalacao' => 'nullable|string|max:50',
                'softwares.*.chave_licenca' => 'nullable|string|max:255',
            ]);
            
            // Garantir que temos um array válido
            if (!is_array($validated['softwares']) || empty($validated['softwares'])) {
                return response()->json([
                    'message' => 'Array de softwares vazio ou inválido',
                    'software_ids' => [],
                    'total' => 0,
                ], 400);
            }

            $softwareIds = [];
            $errors = [];
            
            // Processar em transação para melhor performance
            DB::beginTransaction();
            
            try {
                // Processar em chunks de 50 para não sobrecarregar memória
                $chunks = array_chunk($validated['softwares'], 50);
                $processed = 0;
                $totalChunks = count($chunks);
                
                Log::info('Iniciando processamento em chunks', [
                    'total_softwares' => count($validated['softwares']),
                    'chunk_size' => 50,
                    'total_chunks' => $totalChunks,
                ]);
                
                foreach ($chunks as $chunkIndex => $chunk) {
                    Log::info("Processando chunk " . ($chunkIndex + 1) . "/$totalChunks", [
                        'chunk_size' => count($chunk),
                        'total_processed' => $processed,
                    ]);
                    
                    foreach ($chunk as $index => $softwareData) {
                        $realIndex = ($chunkIndex * 50) + $index;
                        
                        try {
                            // Normalizar data_instalacao (flexível)
                            $dataInstalacao = null;
                            if (!empty($softwareData['data_instalacao'])) {
                                try {
                                    $dataInstalacao = \Carbon\Carbon::parse($softwareData['data_instalacao'])->format('Y-m-d');
                                } catch (\Throwable $e) {
                                    $dataInstalacao = null;
                                }
                            }

                            // Validar e sanitizar nome (obrigatório)
                            $nome = trim($softwareData['nome'] ?? '');
                            if (empty($nome)) {
                                continue;
                            }
                            $nome = mb_substr($nome, 0, 255);
                            
                            // Filtrar por versão
                            $versao = isset($softwareData['versao']) && !empty(trim($softwareData['versao'])) 
                                ? mb_substr(trim($softwareData['versao']), 0, 255) 
                                : null;
                            
                            // Buscar software existente (incluindo soft deleted)
                            $query = Software::withTrashed()->where('nome', $nome);
                            
                            if ($versao !== null && $versao !== '') {
                                $query->where('versao', $versao);
                            } else {
                                $query->whereNull('versao');
                            }
                            
                            $software = $query->first();
                            
                            if ($software) {
                                // Se estava soft deleted, restaurar
                                if ($software->trashed()) {
                                    $software->restore();
                                }
                                
                                // Preparar dados para atualização
                                $dataToUpdate = [
                                    'detectado_por_agente' => true,
                                ];
                                
                                // Atualizar apenas campos fornecidos
                                if (isset($softwareData['fabricante'])) {
                                    $fabricante = !empty(trim($softwareData['fabricante']))
                                        ? mb_substr(trim($softwareData['fabricante']), 0, 255)
                                        : null;
                                    $dataToUpdate['fabricante'] = $fabricante ?? $software->fabricante;
                                }
                                
                                if ($dataInstalacao !== null) {
                                    $dataToUpdate['data_instalacao'] = $dataInstalacao;
                                }
                                
                                if (isset($softwareData['chave_licenca'])) {
                                    $chaveLicenca = !empty(trim($softwareData['chave_licenca']))
                                        ? mb_substr(trim($softwareData['chave_licenca']), 0, 255)
                                        : null;
                                    $dataToUpdate['chave_licenca'] = $chaveLicenca ?? $software->chave_licenca;
                                }
                                
                                // Atualizar apenas se houver mudanças
                                $software->update($dataToUpdate);
                            } else {
                                // Criar novo software
                                // Sanitizar dados antes de criar (já temos nome e versao sanitizados acima)
                                $fabricante = isset($softwareData['fabricante']) && !empty(trim($softwareData['fabricante']))
                                    ? mb_substr(trim($softwareData['fabricante']), 0, 255)
                                    : null;
                                $chaveLicenca = isset($softwareData['chave_licenca']) && !empty(trim($softwareData['chave_licenca']))
                                    ? mb_substr(trim($softwareData['chave_licenca']), 0, 255)
                                    : null;
                                
                                // Criar com apenas campos válidos
                                $dataToCreate = [
                                    'nome' => $nome,
                                    'detectado_por_agente' => true,
                                    'tipo_licenca' => 'proprietario',
                                ];
                                
                                if ($versao !== null) {
                                    $dataToCreate['versao'] = $versao;
                                }
                                if ($fabricante !== null) {
                                    $dataToCreate['fabricante'] = $fabricante;
                                }
                                if ($dataInstalacao !== null) {
                                    $dataToCreate['data_instalacao'] = $dataInstalacao;
                                }
                                if ($chaveLicenca !== null) {
                                    $dataToCreate['chave_licenca'] = $chaveLicenca;
                                }
                                
                                $software = Software::create($dataToCreate);
                            }
                            
                            $softwareIds[] = $software->id;
                            $processed++;
                    
                        } catch (\Throwable $e) {
                            $errors[] = [
                                'index' => $realIndex,
                                'nome' => $softwareData['nome'] ?? 'desconhecido',
                                'error' => $e->getMessage(),
                            ];
                            Log::warning('Falha ao processar software', [
                                'index' => $realIndex,
                                'nome' => $softwareData['nome'] ?? 'desconhecido',
                                'error' => $e->getMessage(),
                            ]);
                            // Continuar processando os demais
                            continue;
                        }
                    }
                }
            
                DB::commit();
                
                Log::info('sync-softwares concluído', [
                    'total_processado' => $processed,
                    'total_sucesso' => count($softwareIds),
                    'total_erros' => count($errors),
                ]);
                
            } catch (\Throwable $e) {
                DB::rollBack();
                Log::error('Erro durante transação, rollback realizado', [
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                ]);
                throw $e;
            }

            return response()->json([
                'software_ids' => $softwareIds,
                'total' => count($softwareIds),
                'errors_count' => count($errors),
                'errors' => $errors,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Erro de validação em sync-softwares', [
                'errors' => $e->errors(),
                'input' => $request->all(),
            ]);
            return response()->json([
                'message' => 'Erro de validação',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            Log::error('Erro fatal em sync-softwares', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
            ]);
            return response()->json([
                'message' => 'Erro interno do servidor',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Sincronizar relacionamento equipamento-softwares
     * POST /api/v1/agent/sync-equipamento-softwares
     */
    public function syncEquipamentoSoftwares(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'equipamento_id' => 'required|exists:equipamentos,id',
            'software_ids' => 'required|array',
            'software_ids.*' => 'exists:softwares,id',
        ]);

        $equipamento = Equipamento::findOrFail($validated['equipamento_id']);

        // Sincronizar (adiciona novos, remove ausentes)
        $equipamento->softwares()->sync($validated['software_ids']);

        return response()->json([
            'message' => 'Softwares sincronizados com sucesso',
            'total_softwares' => count($validated['software_ids']),
        ]);
    }
}

