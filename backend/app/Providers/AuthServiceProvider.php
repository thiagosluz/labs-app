<?php

namespace App\Providers;

use App\Models\Equipamento;
use App\Models\LabelTemplate;
use App\Models\Laboratorio;
use App\Models\Manutencao;
use App\Models\Software;
use App\Models\SystemSetting;
use App\Policies\EquipamentoPolicy;
use App\Policies\LabelTemplatePolicy;
use App\Policies\LaboratorioPolicy;
use App\Policies\ManutencaoPolicy;
use App\Policies\SoftwarePolicy;
use App\Policies\SystemSettingPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Laboratorio::class => LaboratorioPolicy::class,
        Equipamento::class => EquipamentoPolicy::class,
        Software::class => SoftwarePolicy::class,
        Manutencao::class => ManutencaoPolicy::class,
        SystemSetting::class => SystemSettingPolicy::class,
        LabelTemplate::class => LabelTemplatePolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}

