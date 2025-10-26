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
        Schema::create('laboratorios', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->string('localizacao');
            $table->foreignId('responsavel_id')->nullable()->constrained('users')->nullOnDelete();
            $table->integer('quantidade_maquinas')->default(0);
            $table->enum('status', ['ativo', 'inativo', 'manutencao'])->default('ativo');
            $table->text('descricao')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('laboratorios');
    }
};

