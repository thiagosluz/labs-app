#!/usr/bin/env python3
"""
Teste para verificar restauração de soft delete
"""
import requests
import json

def test_soft_delete_restore():
    """Testa restauração de equipamento soft deleted"""
    url = "http://localhost:8000/api/v1/agent/sync-equipamento"
    headers = {
        'X-Agent-API-Key': '1ec6880e1b5b6343d2b181e0fe8f94899dabe154b5026ac03eadd1d9bb0b2723',
        'Content-Type': 'application/json',
        'User-Agent': 'LabAgent/1.0',
    }
    
    # Dados do equipamento
    data = {
        'hostname': 'SOFT-DELETE-TEST',
        'numero_serie': 'SOFT123456',
        'fabricante': 'Teste Soft Delete',
        'modelo': 'Teste Model',
        'processador': 'Intel Test',
        'memoria_ram': '8GB',
        'disco': '500GB',
        'ip_local': '192.168.1.200',
        'mac_address': 'AA-BB-CC-DD-EE-HH',
        'gateway': '192.168.1.1',
        'dns_servers': ['8.8.8.8'],
        'laboratorio_id': 1,
        'dados_hash': 'soft_delete_test_123',
    }
    
    print("=== Teste de Restauração de Soft Delete ===")
    print("1. Criando equipamento via agente...")
    
    try:
        response = requests.post(url, json=data, headers=headers, timeout=30)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"SUCESSO - Equipamento criado/atualizado: ID {result['equipamento_id']}, Action: {result['action']}")
            
            # Agora simular que o equipamento foi soft deleted
            print("\n2. Simulando soft delete...")
            print("   (Execute no frontend: deletar o equipamento)")
            print("   (Depois execute este teste novamente para ver a restauração)")
            
        else:
            print("ERRO - Erro na criacao do equipamento")
            
    except Exception as e:
        print(f"ERRO na requisicao: {e}")

if __name__ == "__main__":
    test_soft_delete_restore()
