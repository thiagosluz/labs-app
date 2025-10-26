<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Software>
 */
class SoftwareFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $softwares = [
            ['nome' => 'Microsoft Office', 'fabricante' => 'Microsoft', 'tipo_licenca' => 'educacional'],
            ['nome' => 'Visual Studio Code', 'fabricante' => 'Microsoft', 'tipo_licenca' => 'livre'],
            ['nome' => 'Adobe Photoshop', 'fabricante' => 'Adobe', 'tipo_licenca' => 'proprietario'],
            ['nome' => 'LibreOffice', 'fabricante' => 'The Document Foundation', 'tipo_licenca' => 'livre'],
            ['nome' => 'AutoCAD', 'fabricante' => 'Autodesk', 'tipo_licenca' => 'educacional'],
            ['nome' => 'IntelliJ IDEA', 'fabricante' => 'JetBrains', 'tipo_licenca' => 'educacional'],
            ['nome' => 'Python', 'fabricante' => 'Python Software Foundation', 'tipo_licenca' => 'livre'],
            ['nome' => 'MySQL', 'fabricante' => 'Oracle', 'tipo_licenca' => 'livre'],
        ];

        $software = fake()->randomElement($softwares);
        $tipoLicenca = $software['tipo_licenca'];

        return [
            'nome' => $software['nome'],
            'versao' => fake()->numerify('#.#.#'),
            'fabricante' => $software['fabricante'],
            'tipo_licenca' => $tipoLicenca,
            'quantidade_licencas' => $tipoLicenca !== 'livre' ? fake()->numberBetween(10, 100) : null,
            'data_expiracao' => $tipoLicenca === 'proprietario' ? fake()->dateTimeBetween('now', '+2 years') : null,
            'descricao' => fake()->sentence(),
        ];
    }
}

