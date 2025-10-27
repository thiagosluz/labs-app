<?php

namespace Database\Seeders;

use App\Models\LabelTemplate;
use Illuminate\Database\Seeder;

class LabelTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'name' => 'Padrão 10x5cm',
                'width' => 10.0,
                'height' => 5.0,
                'qr_size' => 4.0,
                'qr_position' => 'left',
                'show_logo' => false,
                'logo_position' => null,
                'fields' => ['patrimonio', 'numero_serie', 'laboratorio', 'id', 'tipo'],
                'styles' => [
                    'header_color' => '#22c55e',
                    'font_size_name' => 14,
                    'font_size_detail' => 9,
                ],
                'is_default' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Médio 8x4cm',
                'width' => 8.0,
                'height' => 4.0,
                'qr_size' => 3.0,
                'qr_position' => 'left',
                'show_logo' => false,
                'logo_position' => null,
                'fields' => ['patrimonio', 'laboratorio', 'id'],
                'styles' => [
                    'header_color' => '#22c55e',
                    'font_size_name' => 12,
                    'font_size_detail' => 8,
                ],
                'is_default' => false,
                'is_active' => true,
            ],
            [
                'name' => 'Compacto 6x3cm',
                'width' => 6.0,
                'height' => 3.0,
                'qr_size' => 2.5,
                'qr_position' => 'left',
                'show_logo' => false,
                'logo_position' => null,
                'fields' => ['patrimonio', 'id'],
                'styles' => [
                    'header_color' => '#22c55e',
                    'font_size_name' => 10,
                    'font_size_detail' => 7,
                ],
                'is_default' => false,
                'is_active' => true,
            ],
            [
                'name' => 'Grande 12x6cm',
                'width' => 12.0,
                'height' => 6.0,
                'qr_size' => 5.0,
                'qr_position' => 'left',
                'show_logo' => false,
                'logo_position' => null,
                'fields' => ['patrimonio', 'numero_serie', 'laboratorio', 'id', 'tipo'],
                'styles' => [
                    'header_color' => '#22c55e',
                    'font_size_name' => 16,
                    'font_size_detail' => 10,
                ],
                'is_default' => false,
                'is_active' => true,
            ],
        ];

        foreach ($templates as $template) {
            LabelTemplate::updateOrCreate(
                ['name' => $template['name']],
                $template
            );
        }
    }
}


