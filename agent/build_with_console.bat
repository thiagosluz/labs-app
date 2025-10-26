@echo off
REM ======================================
REM LabAgent - Build com Console (Debug)
REM Compila o agente com janela de console
REM ======================================

echo.
echo ========================================
echo  Compilador LabAgent (COM CONSOLE)
echo ========================================
echo.

REM Verificar se Python esta instalado
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Python nao encontrado!
    pause
    exit /b 1
)

echo [OK] Python encontrado
echo.

REM Verificar se PyInstaller esta instalado
pip show pyinstaller >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] PyInstaller nao encontrado. Instalando...
    pip install pyinstaller
    echo.
)

echo [OK] PyInstaller pronto
echo.

REM Limpar builds anteriores
if exist "dist" rmdir /s /q dist
if exist "build" rmdir /s /q build
if exist "agent.spec" del /q agent.spec

echo Compilando LabAgent (COM CONSOLE)...
echo.
echo Isso pode levar alguns minutos...
echo.

REM Compilar com PyInstaller (COM CONSOLE para debug)
pyinstaller --onefile ^
    --name=LabAgent-Debug ^
    --icon=NONE ^
    --hidden-import=wmi ^
    --hidden-import=win32api ^
    --hidden-import=win32com ^
    --hidden-import=pythoncom ^
    --hidden-import=netifaces ^
    --add-data "config.yaml.template;." ^
    agent.py

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo  BUILD CONCLUIDO COM SUCESSO!
    echo ========================================
    echo.
    echo Executavel gerado em:
    echo   dist\LabAgent-Debug.exe
    echo.
    echo Este executavel mostra a janela de console
    echo para facilitar debug e testes.
    echo.
) else (
    echo.
    echo [ERRO] Falha ao compilar!
    echo.
)

pause

