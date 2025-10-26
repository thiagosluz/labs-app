<?php

namespace App\Console\Commands;

use App\Models\AgentApiKey;
use Illuminate\Console\Command;

class GenerateAgentApiKey extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'agent:generate-key
                            {--name= : Nome do agente}
                            {--lab= : ID do laboratório}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Gera uma nova API Key para o agente';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $name = $this->option('name') ?? $this->ask('Nome do agente');
        $labId = $this->option('lab') ?? $this->ask('ID do laboratório (opcional, deixe vazio para pular)');

        $key = AgentApiKey::generateKey();

        $agentKey = AgentApiKey::create([
            'name' => $name,
            'key' => $key,
            'laboratorio_id' => $labId ?: null,
            'created_by' => 1, // Admin user
        ]);

        $this->info('API Key gerada com sucesso!');
        $this->warn('ATENÇÃO: Copie esta chave agora. Ela não será exibida novamente!');
        $this->line('');
        $this->line('API Key: ' . $key);
        $this->line('ID: ' . $agentKey->id);
        $this->line('Nome: ' . $agentKey->name);

        return 0;
    }
}
