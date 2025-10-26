"""
Coletor de informações de hardware do Windows
"""
import wmi
import psutil
import platform


def collect_hardware():
    """
    Coleta informações de hardware do computador Windows
    
    Returns:
        dict: Dicionário com informações de hardware
    """
    try:
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
            'fabricante': system.Manufacturer.strip(),
            'modelo': system.Model.strip(),
            'numero_serie': bios.SerialNumber.strip(),
            'processador': f"{cpu.Name.strip()} ({cpu_cores} cores)",
            'memoria_ram': f"{total_ram_gb}GB",
            'disco': f"{disk_size_gb}GB {disk_type}",
        }
        
    except Exception as e:
        print(f"Erro ao coletar hardware: {e}")
        return {
            'hostname': platform.node(),
            'fabricante': None,
            'modelo': None,
            'numero_serie': None,
            'processador': None,
            'memoria_ram': None,
            'disco': None,
        }

