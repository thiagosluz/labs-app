<?php

namespace Database\Factories;

use App\Models\Laboratorio;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Equipamento>
 */
class EquipamentoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $tipo = fake()->randomElement(['computador', 'projetor', 'roteador', 'switch', 'impressora']);
        
        return [
            'nome' => $this->getNomePorTipo($tipo),
            'tipo' => $tipo,
            'fabricante' => fake()->randomElement(['Dell', 'HP', 'Lenovo', 'Epson', 'TP-Link', 'Cisco']),
            'modelo' => fake()->bothify('??-####'),
            'numero_serie' => fake()->unique()->bothify('SN-########'),
            'patrimonio' => fake()->unique()->numerify('PAT-######'),
            'data_aquisicao' => fake()->dateTimeBetween('-5 years', 'now'),
            'estado' => fake()->randomElement(['em_uso', 'reserva', 'manutencao', 'descartado']),
            'laboratorio_id' => Laboratorio::factory(),
            'especificacoes' => fake()->sentence(),
        ];
    }

    private function getNomePorTipo(string $tipo): string
    {
        return match($tipo) {
            'computador' => 'Desktop ' . fake()->bothify('PC-###'),
            'projetor' => 'Projetor ' . fake()->bothify('PRJ-###'),
            'roteador' => 'Roteador ' . fake()->bothify('RT-###'),
            'switch' => 'Switch ' . fake()->bothify('SW-###'),
            'impressora' => 'Impressora ' . fake()->bothify('IMP-###'),
            default => 'Equipamento ' . fake()->bothify('EQ-###'),
        };
    }
}

