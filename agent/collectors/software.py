"""
Coletor de softwares instalados no Windows via Registry
"""
import winreg
from datetime import datetime


def collect_software():
    """
    Coleta lista de softwares instalados no Windows através do Registry
    
    Returns:
        list: Lista de dicionários com informações dos softwares
    """
    softwares = []
    
    # Caminhos do Registry onde ficam os softwares instalados
    keys = [
        r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall",
        r"SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall"
    ]
    
    for key_path in keys:
        try:
            key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, key_path)
            
            for i in range(winreg.QueryInfoKey(key)[0]):
                try:
                    subkey_name = winreg.EnumKey(key, i)
                    subkey = winreg.OpenKey(key, subkey_name)
                    
                    nome = get_value(subkey, "DisplayName")
                    if not nome:
                        continue
                    
                    # Filtrar entradas do sistema/updates do Windows
                    if is_system_entry(nome):
                        continue
                    
                    softwares.append({
                        'nome': nome,
                        'versao': get_value(subkey, "DisplayVersion"),
                        'fabricante': get_value(subkey, "Publisher"),
                        'data_instalacao': parse_install_date(get_value(subkey, "InstallDate")),
                    })
                    
                    winreg.CloseKey(subkey)
                except:
                    continue
            
            winreg.CloseKey(key)
        except:
            continue
    
    # Remover duplicatas (software pode aparecer em ambos os caminhos)
    unique_softwares = []
    seen = set()
    
    for software in softwares:
        key = (software['nome'], software['versao'])
        if key not in seen:
            seen.add(key)
            unique_softwares.append(software)
    
    return unique_softwares


def get_value(key, name):
    """
    Obtém valor de uma chave do Registry
    
    Args:
        key: Chave do Registry
        name: Nome do valor
    
    Returns:
        str: Valor ou None
    """
    try:
        value = winreg.QueryValueEx(key, name)[0]
        return value if value else None
    except:
        return None


def parse_install_date(date_str):
    """
    Converte data de instalação do formato YYYYMMDD para YYYY-MM-DD
    
    Args:
        date_str: String com data no formato YYYYMMDD
    
    Returns:
        str: Data no formato YYYY-MM-DD ou None
    """
    if not date_str or len(date_str) != 8:
        return None
    try:
        return datetime.strptime(date_str, "%Y%m%d").strftime("%Y-%m-%d")
    except:
        return None


def is_system_entry(name):
    """
    Verifica se é uma entrada do sistema que deve ser ignorada
    
    Args:
        name: Nome do software
    
    Returns:
        bool: True se for entrada do sistema
    """
    ignore_patterns = [
        'Update for',
        'Hotfix for',
        'Security Update',
        'KB',
        'Microsoft Visual C++',
    ]
    
    for pattern in ignore_patterns:
        if pattern in name:
            return True
    
    return False

