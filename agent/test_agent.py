#!/usr/bin/env python3
"""
Teste simples do agente para verificar os dados enviados
"""
import json
from collectors import hardware, software, network
from api.client import LaravelAPIClient

def test_data_collection():
    """Testa a coleta de dados"""
    print("=== Teste de Coleta de Dados ===")
    
    # Coletar dados
    print("Coletando hardware...")
    hw_data = hardware.collect_hardware()
    print(f"Hardware: {json.dumps(hw_data, indent=2, ensure_ascii=False)}")
    
    print("\nColetando rede...")
    net_data = network.collect_network()
    print(f"Rede: {json.dumps(net_data, indent=2, ensure_ascii=False)}")
    
    print("\nColetando softwares...")
    sw_data = software.collect_software()
    print(f"Softwares encontrados: {len(sw_data)}")
    if sw_data:
        print(f"Primeiro software: {json.dumps(sw_data[0], indent=2, ensure_ascii=False)}")
    
    # Combinar dados
    equipamento_data = {
        **hw_data,
        **net_data,
        'laboratorio_id': 1,
        'dados_hash': 'test_hash',
    }
    
    print(f"\nDados do equipamento:")
    print(json.dumps(equipamento_data, indent=2, ensure_ascii=False))
    
    # Testar cliente API
    print("\n=== Teste de Cliente API ===")
    try:
        client = LaravelAPIClient(
            'http://localhost:8000/api/v1/agent',
            '1ec6880e1b5b6343d2b181e0fe8f94899dabe154b5026ac03eadd1d9bb0b2723'
        )
        print("Cliente API inicializado com sucesso")
        
        # Testar requisição
        print("Testando requisição...")
        response = client.sync_equipamento(equipamento_data)
        print(f"Resposta: {response}")
        
    except Exception as e:
        print(f"Erro no cliente API: {e}")

if __name__ == "__main__":
    test_data_collection()
