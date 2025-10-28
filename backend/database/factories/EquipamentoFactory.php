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
        $tipo = $this->faker->randomElement(['computador', 'projetor', 'roteador', 'switch', 'impressora']);
        
        return [
            'nome' => $this->getNomePorTipo($tipo),
            'tipo' => $tipo,
            'fabricante' => $this->faker->randomElement(['Dell', 'HP', 'Lenovo', 'Epson', 'TP-Link', 'Cisco']),
            'modelo' => $this->faker->bothify('??-####'),
            'numero_serie' => $this->faker->unique()->bothify('SN-########'),
            'patrimonio' => $this->faker->unique()->numerify('PAT-######'),
            'data_aquisicao' => $this->faker->dateTimeBetween('-5 years', 'now'),
            'estado' => $this->faker->randomElement(['em_uso', 'reserva', 'manutencao', 'descartado']),
            'laboratorio_id' => Laboratorio::factory(),
            'especificacoes' => $this->faker->sentence(),
        ];
    }

    private function getNomePorTipo(string $tipo): string
    {
        return match($tipo) {
            'computador' => 'Desktop ' . $this->faker->bothify('PC-###'),
            'projetor' => 'Projetor ' . $this->faker->bothify('PRJ-###'),
            'roteador' => 'Roteador ' . $this->faker->bothify('RT-###'),
            'switch' => 'Switch ' . $this->faker->bothify('SW-###'),
            'impressora' => 'Impressora ' . $this->faker->bothify('IMP-###'),
            default => 'Equipamento ' . $this->faker->bothify('EQ-###'),
        };
    }
}

