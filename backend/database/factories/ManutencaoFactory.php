<?php

namespace Database\Factories;

use App\Models\Equipamento;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Manutencao>
 */
class ManutencaoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'equipamento_id' => Equipamento::factory(),
            'data' => fake()->dateTimeBetween('-1 year', '+30 days'),
            'tipo' => fake()->randomElement(['corretiva', 'preventiva']),
            'descricao' => fake()->sentence(),
            'tecnico_id' => User::factory()->create(['role' => 'tecnico']),
            'status' => fake()->randomElement(['pendente', 'em_andamento', 'concluida', 'cancelada']),
        ];
    }
}

