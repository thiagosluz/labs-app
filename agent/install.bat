@echo off
REM ======================================
REM LabAgent - Instalador de Dependencias
REM ======================================

echo.
echo ========================================
echo  Instalador de Dependencias - LabAgent
echo ========================================
echo.

REM Verificar se Python esta instalado
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Python nao encontrado!
    echo.
    echo Por favor, instale Python 3.8+ de:
    echo https://www.python.org/downloads/
    echo.
    echo Certifique-se de marcar "Add Python to PATH" durante a instalacao.
    pause
    exit /b 1
)

echo [OK] Python encontrado:
python --version
echo.

REM Atualizar pip
echo Atualizando pip...
python -m pip install --upgrade pip
echo.

REM Instalar dependencias
echo Instalando dependencias...
echo.
pip install -r requirements.txt

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo  INSTALACAO CONCLUIDA COM SUCESSO!
    echo ========================================
    echo.
    echo Dependencias instaladas:
    echo  - requests
    echo  - psutil
    echo  - WMI
    echo  - pywin32
    echo  - PyYAML
    echo  - netifaces
    echo.
    echo Para executar o agente:
    echo   python agent.py
    echo.
) else (
    echo.
    echo [ERRO] Falha ao instalar dependencias!
    echo.
    echo Tente executar manualmente:
    echo   pip install -r requirements.txt
    echo.
)

pause

