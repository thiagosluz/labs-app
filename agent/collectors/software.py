"""
Coletor de softwares instalados (Windows e Linux)
"""
import platform
import sys
from datetime import datetime


def collect_software():
    """
    Coleta lista de softwares instalados (Windows ou Linux)
    
    Returns:
        list: Lista de dicionários com informações dos softwares
    """
    try:
        system_os = platform.system()
        
        if system_os == "Windows":
            return _collect_windows_software()
        elif system_os == "Linux":
            return _collect_linux_software()
        else:
            return []
            
    except Exception as e:
        print(f"Erro ao coletar softwares: {e}")
        return []


def _collect_windows_software():
    """Coleta softwares instalados no Windows via Registry"""
    softwares = []
    
    try:
        import winreg  # Importação condicional - só aqui!
    except ImportError:
        return []
    
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
                        winreg.CloseKey(subkey)
                        continue
                    
                    # Filtrar entradas do sistema/updates do Windows
                    if is_system_entry(nome):
                        winreg.CloseKey(subkey)
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


def _collect_linux_software():
    """Coleta softwares instalados no Linux via dpkg/rpm"""
    import subprocess
    
    softwares = []
    
    # Tentar dpkg (Debian/Ubuntu)
    try:
        result = subprocess.run(
            ['dpkg-query', '-W', '-f=${Package}\t${Version}\t${Maintainer}\n'],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            for line in result.stdout.strip().split('\n'):
                if not line:
                    continue
                parts = line.split('\t')
                if len(parts) >= 2:
                    nome = parts[0]
                    versao = parts[1]
                    fabricante = parts[2] if len(parts) > 2 else None
                    
                    # Filtrar pacotes do sistema
                    if is_system_package(nome):
                        continue
                    
                    softwares.append({
                        'nome': nome,
                        'versao': versao,
                        'fabricante': fabricante,
                        'data_instalacao': None,  # dpkg não fornece data de instalação facilmente
                    })
            return softwares
    except:
        pass
    
    # Tentar rpm (RedHat/CentOS/Fedora)
    try:
        result = subprocess.run(
            ['rpm', '-qa', '--queryformat', '%{NAME}\t%{VERSION}\t%{VENDOR}\n'],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            for line in result.stdout.strip().split('\n'):
                if not line:
                    continue
                parts = line.split('\t')
                if len(parts) >= 2:
                    nome = parts[0]
                    versao = parts[1]
                    fabricante = parts[2] if len(parts) > 2 else None
                    
                    # Filtrar pacotes do sistema
                    if is_system_package(nome):
                        continue
                    
                    softwares.append({
                        'nome': nome,
                        'versao': versao,
                        'fabricante': fabricante,
                        'data_instalacao': None,
                    })
    except:
        pass
    
    return softwares


def get_value(key, name):
    """
    Obtém valor de uma chave do Registry (Windows)
    
    Args:
        key: Chave do Registry
        name: Nome do valor
    
    Returns:
        str: Valor ou None
    """
    try:
        import winreg  # Importação condicional
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
    Verifica se é uma entrada do sistema que deve ser ignorada (Windows)
    
    Args:
        name: Nome do software
    
    Returns:
        bool: True se for entrada do sistema
    """
    if not name:
        return True
    
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


def is_system_package(name):
    """
    Verifica se é um pacote do sistema que deve ser ignorado (Linux)
    
    Args:
        name: Nome do pacote
    
    Returns:
        bool: True se for pacote do sistema
    """
    if not name:
        return True
    
    # Filtrar pacotes de bibliotecas e dependências do sistema
    system_prefixes = [
        'lib',
        'python3-',
        'python-',
        'perl-',
        'ruby-',
        'node-',
        'gcc-',
        'g++',
        'binutils',
        'coreutils',
        'base-files',
        'dpkg',
        'rpm',
    ]
    
    for prefix in system_prefixes:
        if name.startswith(prefix):
            return True
    
    return False
