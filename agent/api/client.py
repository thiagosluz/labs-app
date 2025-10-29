"""
Cliente para comunicação com a API Laravel
"""
import requests
import time


class LaravelAPIClient:
    """Cliente HTTP para comunicação com a API do Laravel"""
    
    def __init__(self, base_url, api_key):
        """
        Inicializa o cliente da API
        
        Args:
            base_url: URL base da API (ex: http://localhost:8000/api/v1/agent)
            api_key: Chave de API para autenticação
        """
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.timeout = 60
        self.max_retries = 3
    
    def _headers(self, hostname='unknown'):
        """
        Gera headers HTTP para as requisições
        
        Args:
            hostname: Nome do computador
        
        Returns:
            dict: Headers HTTP
        """
        return {
            'X-Agent-API-Key': self.api_key,
            'Content-Type': 'application/json',
            'User-Agent': 'LabAgent/1.0',
        }
    
    def _request(self, method, endpoint, data=None, hostname='unknown'):
        """
        Faz requisição HTTP com retry automático
        
        Args:
            method: Método HTTP (GET, POST, etc)
            endpoint: Endpoint da API (ex: sync-equipamento)
            data: Dados para enviar
            hostname: Nome do computador
        
        Returns:
            dict: Resposta JSON da API
        
        Raises:
            requests.RequestException: Se todas as tentativas falharem
        """
        url = f"{self.base_url}/{endpoint}"
        
        for attempt in range(self.max_retries):
            try:
                response = requests.request(
                    method,
                    url,
                    json=data,
                    headers=self._headers(hostname),
                    timeout=self.timeout
                )
                response.raise_for_status()
                return response.json()
                
            except requests.RequestException as e:
                if attempt == self.max_retries - 1:
                    # Última tentativa falhou, propagar erro
                    raise
                
                # Aguardar antes de tentar novamente (exponential backoff)
                wait_time = 2 ** attempt
                print(f"Tentativa {attempt + 1} falhou, aguardando {wait_time}s...")
                time.sleep(wait_time)
    
    def sync_equipamento(self, data):
        """
        Sincroniza dados do equipamento
        
        Args:
            data: Dicionário com dados do equipamento
        
        Returns:
            dict: Resposta da API com equipamento_id e action
        """
        return self._request('POST', 'sync-equipamento', data, data.get('hostname'))
    
    def sync_softwares(self, softwares, batch_size=25):
        """
        Sincroniza lista de softwares em lotes
        
        Args:
            softwares: Lista de dicionários com dados dos softwares
            batch_size: Tamanho de cada lote (padrão: 25)
        
        Returns:
            dict: Resposta agregada com software_ids e total
        """
        if not softwares:
            return {'software_ids': [], 'total': 0, 'errors_count': 0}
        
        total_batches = (len(softwares) + batch_size - 1) // batch_size
        all_software_ids = []
        total_errors = 0
        
        for i in range(0, len(softwares), batch_size):
            batch = softwares[i:i + batch_size]
            batch_num = (i // batch_size) + 1
            
            print(f"Processando lote {batch_num}/{total_batches} ({len(batch)} softwares)...")
            
            response = self._request('POST', 'sync-softwares', {'softwares': batch})
            all_software_ids.extend(response.get('software_ids', []))
            total_errors += response.get('errors_count', 0)
        
        return {
            'software_ids': all_software_ids,
            'total': len(all_software_ids),
            'errors_count': total_errors
        }
    
    def sync_equipamento_softwares(self, equipamento_id, software_ids):
        """
        Sincroniza relacionamento equipamento-softwares
        
        Args:
            equipamento_id: ID do equipamento
            software_ids: Lista de IDs dos softwares
        
        Returns:
            dict: Resposta da API
        """
        return self._request('POST', 'sync-equipamento-softwares', {
            'equipamento_id': equipamento_id,
            'software_ids': software_ids,
        })

