<?php

namespace App\Providers;

use App\Models\Equipamento;
use App\Observers\EquipamentoObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Equipamento::observe(EquipamentoObserver::class);
        
        // Configurar cookies para funcionar melhor com IPs
        $appUrl = config('app.url');
        $sessionDomain = config('session.domain');
        
        // Se SESSION_DOMAIN estiver vazio ou não definido, remover completamente
        if (empty($sessionDomain) || $sessionDomain === '') {
            config(['session.domain' => null]);
        }
        
        // Extrair host da URL
        $host = parse_url($appUrl, PHP_URL_HOST);
        
        // Se for um IP ou usar HTTP, configurar cookies apropriadamente
        if (filter_var($host, FILTER_VALIDATE_IP) || parse_url($appUrl, PHP_URL_SCHEME) === 'http') {
            config(['session.secure' => false]);
            config(['session.same_site' => 'lax']);
            config(['session.domain' => null]); // Não definir domínio para IPs
        }
    }
}
