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
    }
}
