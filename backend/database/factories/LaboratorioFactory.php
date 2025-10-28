<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Laboratorio>
 */
class LaboratorioFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nome' => 'Laboratório ' . $this->faker->numberBetween(1, 20),
            'localizacao' => $this->faker->randomElement(['Bloco A - Sala 101', 'Bloco B - Sala 205', 'Bloco C - Sala 308', 'Bloco D - Sala 102']),
            'responsavel_id' => User::factory(),
            'quantidade_maquinas' => $this->faker->numberBetween(15, 40),
            'status' => $this->faker->randomElement(['ativo', 'inativo', 'manutencao']),
            'descricao' => $this->faker->sentence(),
        ];
    }
}

