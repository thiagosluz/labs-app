#!/usr/bin/env python3
"""
Teste sem processador
"""
import requests
import json

def test_no_processor():
    """Testa sem o campo processador"""
    url = "http://localhost:8000/api/v1/agent/sync-equipamento"
    headers = {
        'X-Agent-API-Key': '1ec6880e1b5b6343d2b181e0fe8f94899dabe154b5026ac03eadd1d9bb0b2723',
        'Content-Type': 'application/json',
        'User-Agent': 'LabAgent/1.0',
    }
    
    # Dados sem processador
    data = {
        'hostname': 'DESKTOP-FLDUFR2',
        'fabricante': 'Acer',
        'modelo': 'Nitro AN515-54',
        'numero_serie': 'NHQ6PAL00B0270443C9501',
        'memoria_ram': '32GB',
        'disco': '932GB HDD',
        'ip_local': '172.31.64.1',
        'mac_address': '7C-8A-E1-DA-7C-C6',
        'gateway': '10.3.0.1',
        'dns_servers': ['10.3.0.22'],
        'laboratorio_id': 1,
        'dados_hash': 'no_processor_test_123',
    }
    
    print("Testando sem processador...")
    
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
    test_no_processor()
