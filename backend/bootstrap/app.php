<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);
        
        // Registrar middleware alias para o agente
        $middleware->alias([
            'agent.auth' => \App\Http\Middleware\AuthenticateAgent::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Log todas as exceções não capturadas
        $exceptions->respond(function (\Throwable $e, $request) {
            \Illuminate\Support\Facades\Log::error('Exception não capturada', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'headers' => $request->headers->all(),
            ]);
            
            // Retornar resposta padrão
            return null; // Laravel vai tratar normalmente
        });
    })->create();
