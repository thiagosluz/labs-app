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
        Schema::create('label_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('width', 5, 2); // em cm
            $table->decimal('height', 5, 2); // em cm
            $table->decimal('qr_size', 5, 2)->default(4.0); // tamanho do QR em cm
            $table->string('qr_position')->default('left'); // left, right
            $table->boolean('show_logo')->default(false);
            $table->string('logo_position')->nullable(); // top, bottom, side
            $table->json('fields')->nullable(); // quais campos exibir
            $table->json('styles')->nullable(); // cores, fontes, tamanhos
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('label_templates');
    }
};
