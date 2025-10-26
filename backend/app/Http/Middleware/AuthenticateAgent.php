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
        $apiKey = $request->header('X-Agent-API-Key');

        if (!$apiKey) {
            return response()->json(['error' => 'API Key não fornecida'], 401);
        }

        $agentKey = AgentApiKey::active()->where('key', $apiKey)->first();

        if (!$agentKey) {
            return response()->json(['error' => 'API Key inválida ou inativa'], 401);
        }

        // Marcar como usado
        $agentKey->markAsUsed(
            $request->ip(),
            $request->input('hostname', 'unknown')
        );

        // Adicionar ao request para uso posterior
        $request->merge(['agent_key' => $agentKey]);

        return $next($request);
    }
}

