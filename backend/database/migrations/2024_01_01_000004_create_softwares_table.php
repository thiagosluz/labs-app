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
        Schema::create('softwares', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->string('versao')->nullable();
            $table->string('fabricante')->nullable();
            $table->enum('tipo_licenca', ['livre', 'educacional', 'proprietario'])->default('livre');
            $table->integer('quantidade_licencas')->nullable();
            $table->date('data_expiracao')->nullable();
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
        Schema::dropIfExists('softwares');
    }
};

