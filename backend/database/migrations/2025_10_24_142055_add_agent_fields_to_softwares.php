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
        Schema::table('softwares', function (Blueprint $table) {
            $table->date('data_instalacao')->nullable()->after('data_expiracao');
            $table->string('chave_licenca')->nullable()->after('data_instalacao');
            $table->boolean('detectado_por_agente')->default(false)->after('chave_licenca');
            
            // Índice composto para busca rápida (evitar duplicatas)
            $table->index(['nome', 'versao', 'fabricante']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('softwares', function (Blueprint $table) {
            $table->dropIndex(['nome', 'versao', 'fabricante']);
            $table->dropColumn(['data_instalacao', 'chave_licenca', 'detectado_por_agente']);
        });
    }
};
