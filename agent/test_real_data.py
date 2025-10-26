#!/usr/bin/env python3
"""
Teste com dados reais do agente
"""
import requests
import json
from collectors import hardware, software, network

def test_real_data():
    """Testa com dados reais do agente"""
    url = "http://localhost:8000/api/v1/agent/sync-equipamento"
    headers = {
        'X-Agent-API-Key': '1ec6880e1b5b6343d2b181e0fe8f94899dabe154b5026ac03eadd1d9bb0b2723',
        'Content-Type': 'application/json',
        'User-Agent': 'LabAgent/1.0',
    }
    
    # Coletar dados reais
    print("Coletando dados reais...")
    hw_data = hardware.collect_hardware()
    net_data = network.collect_network()
    
    # Combinar dados
    data = {
        **hw_data,
        **net_data,
        'laboratorio_id': 1,
        'dados_hash': 'real_data_test_123',  # Hash diferente para forçar atualização
    }
    
    print("Enviando dados reais...")
    print(f"Dados: {json.dumps(data, indent=2, ensure_ascii=False)}")
    
    try:
        response = requests.post(url, json=data, headers=headers, timeout=30)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("SUCESSO!")
        else:
            print("ERRO!")
            
    except Exception as e:
        print(f"ERRO na requisicao: {e}")

if __name__ == "__main__":
    test_real_data()
