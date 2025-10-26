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
        Schema::create('equipamentos', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->enum('tipo', ['computador', 'projetor', 'roteador', 'switch', 'impressora', 'scanner', 'outro'])->default('computador');
            $table->string('fabricante')->nullable();
            $table->string('modelo')->nullable();
            $table->string('numero_serie')->unique()->nullable();
            $table->string('patrimonio')->unique()->nullable();
            $table->date('data_aquisicao')->nullable();
            $table->enum('estado', ['em_uso', 'reserva', 'manutencao', 'descartado'])->default('em_uso');
            $table->foreignId('laboratorio_id')->nullable()->constrained('laboratorios')->nullOnDelete();
            $table->text('especificacoes')->nullable();
            $table->string('foto')->nullable();
            $table->json('anexos')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipamentos');
    }
};

