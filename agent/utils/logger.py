"""
Sistema de logging para o agente
"""
import logging
from logging.handlers import RotatingFileHandler
import os


def setup_logger(log_file='agent.log', log_level='INFO', max_bytes=10*1024*1024, backup_count=5):
    """
    Configura o sistema de logging
    
    Args:
        log_file: Caminho do arquivo de log
        log_level: Nível de log (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        max_bytes: Tamanho máximo do arquivo de log (default: 10MB)
        backup_count: Número de backups a manter
    
    Returns:
        logging.Logger: Logger configurado
    """
    # Criar logger
    logger = logging.getLogger('LabAgent')
    logger.setLevel(getattr(logging, log_level.upper()))
    
    # Limpar handlers existentes
    logger.handlers.clear()
    
    # Formato das mensagens
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Handler para arquivo com rotação
    file_handler = RotatingFileHandler(
        log_file,
        maxBytes=max_bytes,
        backupCount=backup_count,
        encoding='utf-8'
    )
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    
    # Handler para console
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    return logger

