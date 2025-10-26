#!/usr/bin/env python3
"""
Teste mínimo
"""
import requests
import json

def test_minimal():
    """Teste com dados mínimos"""
    url = "http://localhost:8000/api/v1/agent/sync-equipamento"
    headers = {
        'X-Agent-API-Key': '1ec6880e1b5b6343d2b181e0fe8f94899dabe154b5026ac03eadd1d9bb0b2723',
        'Content-Type': 'application/json',
        'User-Agent': 'LabAgent/1.0',
    }
    
    # Dados mínimos
    data = {
        'hostname': 'MINIMAL-TEST',
        'numero_serie': 'MIN123456',
        'laboratorio_id': 1,
        'dados_hash': 'minimal_test_123',
    }
    
    print("Teste mínimo...")
    
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
    test_minimal()
