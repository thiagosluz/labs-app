#!/usr/bin/env python3
"""
Teste específico para campo JSON
"""
import requests
import json

def test_json_field():
    """Testa especificamente o campo dns_servers"""
    url = "http://localhost:8000/api/v1/agent/sync-equipamento"
    headers = {
        'X-Agent-API-Key': '1ec6880e1b5b6343d2b181e0fe8f94899dabe154b5026ac03eadd1d9bb0b2723',
        'Content-Type': 'application/json',
        'User-Agent': 'LabAgent/1.0',
    }
    
    # Teste com dns_servers como array
    data1 = {
        'hostname': 'TESTE-JSON-1',
        'numero_serie': 'JSON123456',
        'fabricante': 'Teste',
        'modelo': 'Teste Model',
        'processador': 'Intel Test',
        'memoria_ram': '8GB',
        'disco': '500GB',
        'ip_local': '192.168.1.100',
        'mac_address': 'AA-BB-CC-DD-EE-FF',
        'gateway': '192.168.1.1',
        'dns_servers': ['8.8.8.8', '8.8.4.4'],  # Array
        'laboratorio_id': 1,
        'dados_hash': 'json_test_1',
    }
    
    print("Teste 1: dns_servers como array")
    try:
        response = requests.post(url, json=data1, headers=headers, timeout=10)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"ERRO: {e}")
    
    print("\n" + "="*50 + "\n")
    
    # Teste com dns_servers como null
    data2 = {
        'hostname': 'TESTE-JSON-2',
        'numero_serie': 'JSON123457',
        'fabricante': 'Teste',
        'modelo': 'Teste Model',
        'processador': 'Intel Test',
        'memoria_ram': '8GB',
        'disco': '500GB',
        'ip_local': '192.168.1.101',
        'mac_address': 'AA-BB-CC-DD-EE-GG',
        'gateway': '192.168.1.1',
        'dns_servers': None,  # Null
        'laboratorio_id': 1,
        'dados_hash': 'json_test_2',
    }
    
    print("Teste 2: dns_servers como null")
    try:
        response = requests.post(url, json=data2, headers=headers, timeout=10)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"ERRO: {e}")

if __name__ == "__main__":
    test_json_field()
