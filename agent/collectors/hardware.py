"""
Coletor de informações de hardware (Windows e Linux)
"""
import psutil
import platform
import sys


def collect_hardware():
    """
    Coleta informações de hardware do computador (Windows ou Linux)
    
    Returns:
        dict: Dicionário com informações de hardware
    """
    try:
        system_os = platform.system()
        
        if system_os == "Windows":
            return _collect_windows_hardware()
        elif system_os == "Linux":
            return _collect_linux_hardware()
        else:
            # Fallback para outros sistemas
            return _collect_generic_hardware()
            
    except Exception as e:
        print(f"Erro ao coletar hardware: {e}")
        return _get_default_hardware()


def _collect_windows_hardware():
    """Coleta hardware no Windows usando WMI"""
    try:
        import wmi  # Importação condicional - só aqui!
        c = wmi.WMI()
        
        # Sistema
        system = c.Win32_ComputerSystem()[0]
        bios = c.Win32_BIOS()[0]
        
        # CPU
        cpu = c.Win32_Processor()[0]
        cpu_cores = psutil.cpu_count(logical=False)
        
        # RAM
        total_ram = psutil.virtual_memory().total
        total_ram_gb = round(total_ram / (1024**3))
        
        # Disco
        disks = c.Win32_DiskDrive()
        if disks:
            disk = disks[0]
            disk_size = int(disk.Size) if disk.Size else 0
            disk_size_gb = round(disk_size / (1024**3))
            disk_type = "SSD" if "SSD" in disk.Model else "HDD"
        else:
            disk_size_gb = 0
            disk_type = "Unknown"
        
        return {
            'hostname': platform.node(),
            'fabricante': system.Manufacturer.strip() if system.Manufacturer else None,
            'modelo': system.Model.strip() if system.Model else None,
            'numero_serie': bios.SerialNumber.strip() if bios.SerialNumber else None,
            'processador': f"{cpu.Name.strip()} ({cpu_cores} cores)" if cpu.Name else None,
            'memoria_ram': f"{total_ram_gb}GB",
            'disco': f"{disk_size_gb}GB {disk_type}",
        }
    except ImportError:
        # WMI não disponível, usar fallback
        return _collect_generic_hardware()
    except Exception as e:
        print(f"Erro ao coletar hardware Windows: {e}")
        return _collect_generic_hardware()


def _collect_linux_hardware():
    """Coleta hardware no Linux usando /proc e /sys"""
    import subprocess
    import os
    
    hostname = platform.node()
    
    # Fabricante e Modelo (via DMI)
    fabricante = None
    modelo = None
    numero_serie = None
    
    try:
        # Tentar obter via dmidecode (requer permissões)
        result = subprocess.run(
            ['dmidecode', '-s', 'system-manufacturer'],
            capture_output=True,
            text=True,
            timeout=2
        )
        if result.returncode == 0:
            fabricante = result.stdout.strip()
    except:
        pass
    
    try:
        result = subprocess.run(
            ['dmidecode', '-s', 'system-product-name'],
            capture_output=True,
            text=True,
            timeout=2
        )
        if result.returncode == 0:
            modelo = result.stdout.strip()
    except:
        pass
    
    try:
        result = subprocess.run(
            ['dmidecode', '-s', 'system-serial-number'],
            capture_output=True,
            text=True,
            timeout=2
        )
        if result.returncode == 0:
            numero_serie = result.stdout.strip()
    except:
        pass
    
    # CPU
    processador = None
    cpu_cores = psutil.cpu_count(logical=False)
    try:
        with open('/proc/cpuinfo', 'r') as f:
            for line in f:
                if line.startswith('model name'):
                    processador = line.split(':')[1].strip()
                    break
    except:
        pass
    
    if processador:
        processador = f"{processador} ({cpu_cores} cores)"
    
    # RAM
    total_ram = psutil.virtual_memory().total
    total_ram_gb = round(total_ram / (1024**3))
    
    # Disco
    disk_size_gb = 0
    disk_type = "Unknown"
    try:
        # Obter tamanho do disco principal
        disk_usage = psutil.disk_usage('/')
        disk_size_gb = round(disk_usage.total / (1024**3))
        
        # Tentar detectar tipo (SSD/HDD) via /sys/block
        try:
            for block in os.listdir('/sys/block'):
                if block.startswith('sd') or block.startswith('nvme'):
                    queue_path = f'/sys/block/{block}/queue/rotational'
                    if os.path.exists(queue_path):
                        with open(queue_path, 'r') as f:
                            rotational = f.read().strip()
                            disk_type = "SSD" if rotational == "0" else "HDD"
                            break
        except:
            pass
    except:
        pass
    
    return {
        'hostname': hostname,
        'fabricante': fabricante,
        'modelo': modelo,
        'numero_serie': numero_serie,
        'processador': processador,
        'memoria_ram': f"{total_ram_gb}GB",
        'disco': f"{disk_size_gb}GB {disk_type}",
    }


def _collect_generic_hardware():
    """Coleta hardware genérico usando apenas psutil e platform"""
    total_ram = psutil.virtual_memory().total
    total_ram_gb = round(total_ram / (1024**3))
    cpu_cores = psutil.cpu_count(logical=False)
    
    # CPU info básico
    processador = None
    try:
        processador = platform.processor()
        if processador and cpu_cores:
            processador = f"{processador} ({cpu_cores} cores)"
    except:
        pass
    
    # Disco
    disk_size_gb = 0
    try:
        disk_usage = psutil.disk_usage('/')
        disk_size_gb = round(disk_usage.total / (1024**3))
    except:
        pass
    
    return {
        'hostname': platform.node(),
        'fabricante': None,
        'modelo': None,
        'numero_serie': None,
        'processador': processador,
        'memoria_ram': f"{total_ram_gb}GB",
        'disco': f"{disk_size_gb}GB Unknown",
    }


def _get_default_hardware():
    """Retorna estrutura padrão em caso de erro"""
    return {
        'hostname': platform.node(),
        'fabricante': None,
        'modelo': None,
        'numero_serie': None,
        'processador': None,
        'memoria_ram': None,
        'disco': None,
    }
