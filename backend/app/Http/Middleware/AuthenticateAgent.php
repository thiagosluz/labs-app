<?php

namespace App\Http\Middleware;

use App\Models\AgentApiKey;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateAgent
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            \Illuminate\Support\Facades\Log::info('Agent middleware - Início', [
                'path' => $request->path(),
                'method' => $request->method(),
                'content_length' => $request->header('Content-Length'),
            ]);
            
            $apiKey = $request->header('X-Agent-API-Key');

            if (!$apiKey) {
                \Illuminate\Support\Facades\Log::warning('Agent middleware - API Key não fornecida');
                return response()->json(['error' => 'API Key não fornecida'], 401);
            }

            $agentKey = AgentApiKey::active()->where('key', $apiKey)->first();

            if (!$agentKey) {
                \Illuminate\Support\Facades\Log::warning('Agent middleware - API Key inválida', [
                    'key_prefix' => substr($apiKey, 0, 10) . '...',
                ]);
                return response()->json(['error' => 'API Key inválida ou inativa'], 401);
            }

            // Marcar como usado
            $agentKey->markAsUsed(
                $request->ip(),
                $request->input('hostname', 'unknown')
            );

            // Adicionar ao request para uso posterior
            $request->merge(['agent_key' => $agentKey]);
            
            \Illuminate\Support\Facades\Log::info('Agent middleware - Autenticação OK', [
                'agent_id' => $agentKey->id,
            ]);

            return $next($request);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Agent middleware - Erro fatal', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            return response()->json([
                'error' => 'Erro interno no middleware',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}

