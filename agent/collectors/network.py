"""
Coletor de informações de rede (Windows e Linux)
"""
import psutil
import socket
import platform
import sys


def collect_network():
    """
    Coleta informações de rede do computador (Windows ou Linux)
    
    Returns:
        dict: Dicionário com informações de rede
    """
    try:
        system_os = platform.system()
        
        if system_os == "Windows":
            return _collect_windows_network()
        elif system_os == "Linux":
            return _collect_linux_network()
        else:
            return _collect_generic_network()
            
    except Exception as e:
        print(f"Erro ao coletar informações de rede: {e}")
        return {
            'ip_local': None,
            'mac_address': None,
            'gateway': None,
            'dns_servers': [],
        }


def _collect_windows_network():
    """Coleta informações de rede no Windows"""
    hostname = socket.gethostname()
    
    # IP local
    try:
        ip_local = socket.gethostbyname(hostname)
    except:
        ip_local = None
    
    # MAC Address
    mac_address = get_mac_address()
    
    # Gateway padrão
    gateway = None
    try:
        import wmi  # Importação condicional - só aqui!
        c = wmi.WMI()
        for interface in c.Win32_NetworkAdapterConfiguration(IPEnabled=True):
            if interface.DefaultIPGateway:
                gateway = interface.DefaultIPGateway[0]
                break
    except:
        pass
    
    # DNS Servers
    dns_servers = []
    try:
        import winreg  # Importação condicional - só aqui!
        key = winreg.OpenKey(
            winreg.HKEY_LOCAL_MACHINE,
            r"SYSTEM\CurrentControlSet\Services\Tcpip\Parameters"
        )
        
        # Tentar NameServer primeiro
        try:
            dns_str = winreg.QueryValueEx(key, "NameServer")[0]
            if dns_str:
                dns_servers = [dns.strip() for dns in dns_str.split(',') if dns.strip()]
        except:
            pass
        
        # Se não encontrou, tentar DhcpNameServer
        if not dns_servers:
            try:
                dns_str = winreg.QueryValueEx(key, "DhcpNameServer")[0]
                if dns_str:
                    dns_servers = [dns.strip() for dns in dns_str.split(' ') if dns.strip()]
            except:
                pass
        
        winreg.CloseKey(key)
    except:
        pass
    
    return {
        'ip_local': ip_local,
        'mac_address': mac_address,
        'gateway': gateway,
        'dns_servers': dns_servers if dns_servers else [],
    }


def _collect_linux_network():
    """Coleta informações de rede no Linux"""
    import subprocess
    
    hostname = socket.gethostname()
    
    # IP local
    ip_local = None
    try:
        # Obter IP da primeira interface não-loopback
        for interface, addrs in psutil.net_if_addrs().items():
            if interface == 'lo':
                continue
            for addr in addrs:
                if addr.family == socket.AF_INET:
                    ip_local = addr.address
                    break
            if ip_local:
                break
    except:
        pass
    
    # MAC Address
    mac_address = get_mac_address()
    
    # Gateway padrão
    gateway = None
    try:
        # Ler rota padrão
        with open('/proc/net/route', 'r') as f:
            for line in f:
                parts = line.split()
                if len(parts) >= 2 and parts[1] == '00000000':
                    # Converter hex para IP
                    hex_ip = parts[2]
                    if len(hex_ip) == 8:
                        ip_parts = [str(int(hex_ip[i:i+2], 16)) for i in range(6, -1, -2)]
                        gateway = '.'.join(ip_parts)
                        break
    except:
        # Fallback: usar ip route
        try:
            result = subprocess.run(
                ['ip', 'route', 'show', 'default'],
                capture_output=True,
                text=True,
                timeout=2
            )
            if result.returncode == 0:
                parts = result.stdout.split()
                if 'via' in parts:
                    idx = parts.index('via')
                    if idx + 1 < len(parts):
                        gateway = parts[idx + 1]
        except:
            pass
    
    # DNS Servers
    dns_servers = []
    try:
        # Ler /etc/resolv.conf
        with open('/etc/resolv.conf', 'r') as f:
            for line in f:
                if line.startswith('nameserver'):
                    dns = line.split()[1] if len(line.split()) > 1 else None
                    if dns:
                        dns_servers.append(dns)
    except:
        pass
    
    return {
        'ip_local': ip_local,
        'mac_address': mac_address,
        'gateway': gateway,
        'dns_servers': dns_servers,
    }


def _collect_generic_network():
    """Coleta informações de rede genéricas"""
    hostname = socket.gethostname()
    
    try:
        ip_local = socket.gethostbyname(hostname)
    except:
        ip_local = None
    
    mac_address = get_mac_address()
    
    return {
        'ip_local': ip_local,
        'mac_address': mac_address,
        'gateway': None,
        'dns_servers': [],
    }


def get_mac_address():
    """
    Obtém o MAC Address da primeira interface de rede ativa
    
    Returns:
        str: MAC Address ou None
    """
    try:
        for interface, addrs in psutil.net_if_addrs().items():
            # Ignorar interface loopback
            if 'lo' in interface.lower() or 'Loopback' in interface:
                continue
                
            for addr in addrs:
                if addr.family == psutil.AF_LINK:
                    mac = addr.address
                    # Verificar se não é MAC vazio ou inválido
                    if mac and mac != '00:00:00:00:00:00':
                        return mac
    except:
        pass
    
    return None
