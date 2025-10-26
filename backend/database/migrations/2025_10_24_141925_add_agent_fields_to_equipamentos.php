<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('equipamentos', function (Blueprint $table) {
            // Campos de hardware coletados pelo agente
            $table->string('hostname')->nullable()->after('nome');
            $table->string('processador')->nullable()->after('modelo');
            $table->string('memoria_ram')->nullable()->after('processador');
            $table->string('disco')->nullable()->after('memoria_ram');
            
            // Campos de rede
            $table->string('ip_local')->nullable()->after('disco');
            $table->string('mac_address')->nullable()->after('ip_local');
            $table->string('gateway')->nullable()->after('mac_address');
            $table->json('dns_servers')->nullable()->after('gateway');
            
            // Campos de controle do agente
            $table->boolean('gerenciado_por_agente')->default(false)->after('dns_servers');
            $table->string('agent_version')->nullable()->after('gerenciado_por_agente');
            $table->timestamp('ultima_sincronizacao')->nullable()->after('agent_version');
            $table->string('dados_hash')->nullable()->after('ultima_sincronizacao');
            
            // Índices para performance
            $table->index('mac_address');
            $table->index('hostname');
            $table->index('gerenciado_por_agente');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('equipamentos', function (Blueprint $table) {
            // Remover índices
            $table->dropIndex(['mac_address']);
            $table->dropIndex(['hostname']);
            $table->dropIndex(['gerenciado_por_agente']);
            
            // Remover colunas
            $table->dropColumn([
                'hostname',
                'processador',
                'memoria_ram',
                'disco',
                'ip_local',
                'mac_address',
                'gateway',
                'dns_servers',
                'gerenciado_por_agente',
                'agent_version',
                'ultima_sincronizacao',
                'dados_hash',
            ]);
        });
    }
};
