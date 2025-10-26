"""
LabAgent - Agente de Inventário Automatizado
Coleta informações de hardware e software do computador e sincroniza com a API Laravel
"""
import time
import hashlib
import json
import sys
from collectors import hardware, software, network
from api.client import LaravelAPIClient
from utils.logger import setup_logger
from utils.config_manager import ConfigManager

AGENT_VERSION = "1.0.0"


def generate_hash(data):
    """
    Gera hash SHA256 dos dados para detectar mudanças
    
    Args:
        data: Dicionário com dados
    
    Returns:
        str: Hash SHA256 dos dados
    """
    json_str = json.dumps(data, sort_keys=True)
    return hashlib.sha256(json_str.encode()).hexdigest()


def main():
    """Função principal do agente"""
    # Configurar logger
    logger = setup_logger()
    logger.info(f"LabAgent v{AGENT_VERSION} iniciando...")
    
    # Carregar configurações
    config = ConfigManager()
    
    # Verificar configuração na primeira execução
    if not config.get('api.key'):
        logger.warning("API Key não configurada!")
        print("\n" + "="*60)
        print("CONFIGURAÇÃO INICIAL DO AGENTE")
        print("="*60)
        api_key = input("\nDigite a API Key fornecida pelo administrador: ").strip()
        if not api_key:
            logger.error("API Key não pode ser vazia!")
            sys.exit(1)
        config.set('api.key', api_key)
        config.save()
        logger.info("API Key configurada")
    
    if not config.get('laboratorio.id'):
        logger.warning("Laboratório não configurado!")
        print("\n" + "="*60)
        lab_id = input("Digite o ID do laboratório deste computador: ").strip()
        try:
            lab_id = int(lab_id)
            config.set('laboratorio.id', lab_id)
            config.save()
            logger.info(f"Laboratório configurado: {lab_id}")
        except ValueError:
            logger.error("ID do laboratório deve ser um número!")
            sys.exit(1)
    
    # Inicializar cliente API
    try:
        client = LaravelAPIClient(
            config.get('api.url'),
            config.get('api.key')
        )
        logger.info("Cliente API inicializado")
    except Exception as e:
        logger.error(f"Erro ao inicializar cliente API: {e}")
        sys.exit(1)
    
    last_hash = None
    intervalo = config.get('coleta.intervalo_segundos', 300)
    
    logger.info(f"Agente iniciado. Intervalo de coleta: {intervalo}s")
    print("\n" + "="*60)
    print(f"LabAgent v{AGENT_VERSION} está rodando...")
    print(f"Pressione Ctrl+C para parar")
    print("="*60 + "\n")
    
    # Loop principal
    while True:
        try:
            logger.info("=== Iniciando ciclo de coleta ===")
            
            # Coletar informações
            logger.info("Coletando informações de hardware...")
            hw_data = hardware.collect_hardware()
            logger.debug(f"Hardware: {hw_data}")
            
            logger.info("Coletando informações de rede...")
            net_data = network.collect_network()
            logger.debug(f"Rede: {net_data}")
            
            logger.info("Coletando softwares instalados...")
            sw_data = software.collect_software()
            logger.info(f"Softwares encontrados: {len(sw_data)}")
            
            # Combinar dados do equipamento
            equipamento_data = {
                **hw_data,
                **net_data,
                'laboratorio_id': config.get('laboratorio.id'),
                'dados_hash': '',  # Será preenchido
            }
            
            # Gerar hash dos dados
            current_hash = generate_hash(equipamento_data)
            equipamento_data['dados_hash'] = current_hash
            
            # Verificar se houve mudança
            if current_hash != last_hash:
                logger.info("🔄 Mudanças detectadas, sincronizando com servidor...")
                
                # 1. Sincronizar equipamento
                logger.info("Sincronizando equipamento...")
                eq_response = client.sync_equipamento(equipamento_data)
                equipamento_id = eq_response['equipamento_id']
                action = eq_response['action']
                logger.info(f"✅ Equipamento {action}: ID {equipamento_id}")
                
                # 2. Sincronizar softwares
                if sw_data:
                    logger.info(f"Sincronizando {len(sw_data)} softwares...")
                    sw_response = client.sync_softwares(sw_data)
                    software_ids = sw_response['software_ids']
                    logger.info(f"✅ Softwares processados: {sw_response['total']}")
                    
                    # 3. Sincronizar relacionamento
                    logger.info("Sincronizando relacionamento equipamento-softwares...")
                    client.sync_equipamento_softwares(equipamento_id, software_ids)
                    logger.info("✅ Relacionamento sincronizado")
                else:
                    logger.warning("Nenhum software encontrado para sincronizar")
                
                last_hash = current_hash
                logger.info("🎉 Sincronização concluída com sucesso!")
            else:
                logger.info("✓ Nenhuma mudança detectada desde última sincronização")
            
        except KeyboardInterrupt:
            logger.info("Encerrando agente por solicitação do usuário...")
            print("\n\nAgente encerrado.")
            break
            
        except Exception as e:
            logger.error(f"❌ Erro durante sincronização: {e}", exc_info=True)
            logger.info("Tentando novamente no próximo ciclo...")
        
        # Aguardar intervalo configurado
        logger.info(f"⏳ Aguardando {intervalo} segundos até próxima coleta...\n")
        try:
            time.sleep(intervalo)
        except KeyboardInterrupt:
            logger.info("Encerrando agente...")
            break


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n❌ Erro fatal: {e}")
        input("\nPressione Enter para fechar...")
        sys.exit(1)

