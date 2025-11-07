<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter(array_unique(array_merge(
        explode(',', env('CORS_ALLOWED_ORIGINS', '')),
        [
            'http://localhost:3000',
            'http://localhost',
            'http://127.0.0.1:3000',
            'http://127.0.0.1',
        ],
        // Adicionar FRONTEND_URL se configurada
        env('FRONTEND_URL') ? [env('FRONTEND_URL')] : [],
        // Adicionar APP_URL se configurada (para produção)
        env('APP_ENV') === 'production' && env('APP_URL') ? [env('APP_URL')] : [],
    ))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];

