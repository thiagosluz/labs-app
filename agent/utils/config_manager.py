"""
Gerenciador de configurações do agente
"""
import yaml
import os


class ConfigManager:
    """Gerenciador de configurações via arquivo YAML"""
    
    def __init__(self, config_file='config.yaml'):
        """
        Inicializa o gerenciador de configurações
        
        Args:
            config_file: Caminho do arquivo de configuração
        """
        self.config_file = config_file
        self.config = self._load_config()
    
    def _load_config(self):
        """
        Carrega configurações do arquivo YAML
        
        Returns:
            dict: Configurações carregadas
        """
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    return yaml.safe_load(f) or {}
            except Exception as e:
                print(f"Erro ao carregar configuração: {e}")
                return self._default_config()
        else:
            # Criar arquivo com configurações padrão
            return self._default_config()
    
    def _default_config(self):
        """
        Retorna configurações padrão
        
        Returns:
            dict: Configurações padrão
        """
        return {
            'api': {
                'url': 'http://localhost:8000/api/v1/agent',
                'key': '',
            },
            'laboratorio': {
                'id': None,
            },
            'coleta': {
                'intervalo_segundos': 300,  # 5 minutos
            },
            'logging': {
                'level': 'INFO',
                'arquivo': 'agent.log',
                'max_size_mb': 10,
            },
        }
    
    def get(self, key, default=None):
        """
        Obtém valor de configuração usando notação de ponto
        
        Args:
            key: Chave de configuração (ex: 'api.url')
            default: Valor padrão se não encontrado
        
        Returns:
            Valor da configuração ou default
        """
        keys = key.split('.')
        value = self.config
        
        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default
        
        return value
    
    def set(self, key, value):
        """
        Define valor de configuração usando notação de ponto
        
        Args:
            key: Chave de configuração (ex: 'api.key')
            value: Valor a definir
        """
        keys = key.split('.')
        config = self.config
        
        # Navegar até o penúltimo nível
        for k in keys[:-1]:
            if k not in config:
                config[k] = {}
            config = config[k]
        
        # Definir valor
        config[keys[-1]] = value
    
    def save(self):
        """
        Salva configurações no arquivo YAML
        """
        try:
            with open(self.config_file, 'w', encoding='utf-8') as f:
                yaml.dump(self.config, f, default_flow_style=False, allow_unicode=True)
        except Exception as e:
            print(f"Erro ao salvar configuração: {e}")

