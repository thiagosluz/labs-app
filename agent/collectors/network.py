"""
Coletor de informações de rede
"""
import psutil
import socket
import wmi


def collect_network():
    """
    Coleta informações de rede do computador
    
    Returns:
        dict: Dicionário com informações de rede
    """
    try:
        hostname = socket.gethostname()
        
        # IP local
        try:
            ip_local = socket.gethostbyname(hostname)
        except:
            ip_local = None
        
        # MAC Address (primeira interface ativa não-loopback)
        mac_address = get_mac_address()
        
        # Gateway padrão
        gateway = get_default_gateway()
        
        # DNS Servers (via Windows Registry)
        dns_servers = get_dns_servers()
        
        return {
            'ip_local': ip_local,
            'mac_address': mac_address,
            'gateway': gateway,
            'dns_servers': dns_servers,
        }
        
    except Exception as e:
        print(f"Erro ao coletar informações de rede: {e}")
        return {
            'ip_local': None,
            'mac_address': None,
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
            if 'Loopback' in interface:
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


def get_default_gateway():
    """
    Obtém o gateway padrão usando WMI
    
    Returns:
        str: IP do gateway ou None
    """
    try:
        c = wmi.WMI()
        for interface in c.Win32_NetworkAdapterConfiguration(IPEnabled=True):
            if interface.DefaultIPGateway:
                return interface.DefaultIPGateway[0]
    except:
        pass
    
    return None


def get_dns_servers():
    """
    Obtém servidores DNS configurados no Windows
    
    Returns:
        list: Lista de IPs dos servidores DNS
    """
    dns_servers = []
    
    try:
        import winreg
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
    
    return dns_servers if dns_servers else []

