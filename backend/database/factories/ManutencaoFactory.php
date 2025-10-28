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
            'data' => $this->faker->dateTimeBetween('-1 year', '+30 days'),
            'tipo' => $this->faker->randomElement(['corretiva', 'preventiva']),
            'descricao' => $this->faker->sentence(),
            'tecnico_id' => User::factory(),
            'status' => $this->faker->randomElement(['pendente', 'em_andamento', 'concluida', 'cancelada']),
        ];
    }
}

