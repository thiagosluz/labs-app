#!/usr/bin/env python3
"""
Teste simples com dados mínimos
"""
import requests
import json

def test_simple_request():
    """Testa requisição com dados mínimos"""
    url = "http://localhost:8000/api/v1/agent/sync-equipamento"
    headers = {
        'X-Agent-API-Key': '1ec6880e1b5b6343d2b181e0fe8f94899dabe154b5026ac03eadd1d9bb0b2723',
        'Content-Type': 'application/json',
        'User-Agent': 'LabAgent/1.0',
    }
    
    data = {
        'hostname': 'TESTE-PC',
        'numero_serie': 'TEST123456',
        'fabricante': 'Teste',
        'modelo': 'Teste Model',
        'processador': 'Intel Test',
        'memoria_ram': '8GB',
        'disco': '500GB',
        'ip_local': '192.168.1.100',
        'mac_address': 'AA-BB-CC-DD-EE-FF',
        'gateway': '192.168.1.1',
        'dns_servers': ['8.8.8.8'],
        'laboratorio_id': 1,
        'dados_hash': 'test_hash_123',
    }
    
    print("Enviando requisição...")
    print(f"URL: {url}")
    print(f"Headers: {headers}")
    print(f"Data: {json.dumps(data, indent=2)}")
    
    try:
        response = requests.post(url, json=data, headers=headers, timeout=30)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Sucesso!")
        else:
            print("❌ Erro!")
            
    except Exception as e:
        print(f"❌ Erro na requisição: {e}")

if __name__ == "__main__":
    test_simple_request()
