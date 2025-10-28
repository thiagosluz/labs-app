<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Criar usuários específicos
        $admin = User::create([
            'name' => 'Administrador',
            'email' => 'admin@ifg.edu.br',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'active' => true,
        ]);

        $tecnico = User::create([
            'name' => 'João Silva - Técnico',
            'email' => 'tecnico@ifg.edu.br',
            'password' => bcrypt('password'),
            'role' => 'tecnico',
            'active' => true,
        ]);

        $visualizador = User::create([
            'name' => 'Maria Santos - Professora',
            'email' => 'professor@ifg.edu.br',
            'password' => bcrypt('password'),
            'role' => 'visualizador',
            'active' => true,
        ]);

        // Criar laboratórios
        $lab1 = \App\Models\Laboratorio::create([
            'nome' => 'Laboratório de Informática 1',
            'localizacao' => 'Bloco A - Sala 101',
            'responsavel_id' => $tecnico->id,
            'quantidade_maquinas' => 30,
            'status' => 'ativo',
            'descricao' => 'Laboratório principal com 30 computadores',
        ]);

        $lab2 = \App\Models\Laboratorio::create([
            'nome' => 'Laboratório de Redes',
            'localizacao' => 'Bloco B - Sala 205',
            'responsavel_id' => $tecnico->id,
            'quantidade_maquinas' => 25,
            'status' => 'ativo',
            'descricao' => 'Laboratório especializado em redes de computadores',
        ]);

        // Criar softwares
        $softwares = [
            ['nome' => 'Microsoft Office 365', 'versao' => '2023', 'fabricante' => 'Microsoft', 'tipo_licenca' => 'educacional', 'quantidade_licencas' => 50, 'data_expiracao' => now()->addYear()],
            ['nome' => 'Visual Studio Code', 'versao' => '1.85', 'fabricante' => 'Microsoft', 'tipo_licenca' => 'livre', 'quantidade_licencas' => null, 'data_expiracao' => null],
            ['nome' => 'LibreOffice', 'versao' => '7.6', 'fabricante' => 'The Document Foundation', 'tipo_licenca' => 'livre', 'quantidade_licencas' => null, 'data_expiracao' => null],
            ['nome' => 'Adobe Photoshop', 'versao' => '2024', 'fabricante' => 'Adobe', 'tipo_licenca' => 'proprietario', 'quantidade_licencas' => 20, 'data_expiracao' => now()->addMonths(6)],
            ['nome' => 'IntelliJ IDEA', 'versao' => '2023.3', 'fabricante' => 'JetBrains', 'tipo_licenca' => 'educacional', 'quantidade_licencas' => 30, 'data_expiracao' => now()->addMonths(18)],
        ];

        $softwareModels = [];
        foreach ($softwares as $softwareData) {
            $softwareModels[] = \App\Models\Software::create($softwareData);
        }

        // Associar softwares aos laboratórios
        $lab1->softwares()->attach($softwareModels);
        $lab2->softwares()->attach([$softwareModels[1]->id, $softwareModels[2]->id, $softwareModels[4]->id]);

        // Criar equipamentos para o Lab 1
        for ($i = 1; $i <= 10; $i++) {
            $equipamento = \App\Models\Equipamento::create([
                'nome' => "Desktop Lab1-PC{$i}",
                'tipo' => 'computador',
                'fabricante' => 'Dell',
                'modelo' => 'OptiPlex 3080',
                'numero_serie' => "SN-LAB1-{$i}",
                'patrimonio' => "PAT-00{$i}",
                'data_aquisicao' => now()->subYears(2),
                'estado' => 'em_uso',
                'laboratorio_id' => $lab1->id,
                'especificacoes' => 'Intel Core i5, 8GB RAM, SSD 256GB',
            ]);

            // Associar alguns softwares aos equipamentos
            $equipamento->softwares()->attach([
                $softwareModels[0]->id => ['data_instalacao' => now()->subMonths(6)],
                $softwareModels[1]->id => ['data_instalacao' => now()->subMonths(6)],
                $softwareModels[2]->id => ['data_instalacao' => now()->subMonths(6)],
            ]);
        }

        // Criar alguns equipamentos adicionais
        \App\Models\Equipamento::create([
            'nome' => 'Projetor Epson PowerLite',
            'tipo' => 'projetor',
            'fabricante' => 'Epson',
            'modelo' => 'PowerLite X49',
            'numero_serie' => 'SN-PROJ-001',
            'patrimonio' => 'PAT-PROJ-001',
            'estado' => 'em_uso',
            'laboratorio_id' => $lab1->id,
        ]);

        \App\Models\Equipamento::create([
            'nome' => 'Switch Cisco 24 Portas',
            'tipo' => 'switch',
            'fabricante' => 'Cisco',
            'modelo' => 'Catalyst 2960',
            'numero_serie' => 'SN-SW-001',
            'patrimonio' => 'PAT-SW-001',
            'estado' => 'em_uso',
            'laboratorio_id' => $lab2->id,
        ]);

        // Criar algumas manutenções
        $equipamentos = \App\Models\Equipamento::where('tipo', 'computador')->take(3)->get();
        
        foreach ($equipamentos as $equipamento) {
            \App\Models\Manutencao::create([
                'equipamento_id' => $equipamento->id,
                'data' => now()->subDays(rand(10, 60)),
                'tipo' => 'preventiva',
                'descricao' => 'Limpeza preventiva e atualização de software',
                'tecnico_id' => $tecnico->id,
                'status' => 'concluida',
            ]);
        }

        // Criar um histórico de movimentação
        $equipamentoMovido = $equipamentos->first();
        \App\Models\HistoricoMovimentacao::create([
            'equipamento_id' => $equipamentoMovido->id,
            'laboratorio_origem_id' => $lab2->id,
            'laboratorio_destino_id' => $lab1->id,
            'usuario_id' => $tecnico->id,
            'observacao' => 'Transferência para atender demanda do laboratório 1',
        ]);

        $this->command->info('Banco de dados populado com sucesso!');
        $this->command->info('Usuários criados:');
        $this->command->info('Admin: admin@ifg.edu.br / password');
        $this->command->info('Técnico: tecnico@ifg.edu.br / password');
        $this->command->info('Professor: professor@ifg.edu.br / password');
    }
}
