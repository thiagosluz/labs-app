@echo off
REM ======================================
REM LabAgent - Script de Build
REM Compila o agente Python em executavel
REM ======================================

echo.
echo ========================================
echo  Compilador LabAgent
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

echo Compilando LabAgent...
echo.
echo Isso pode levar alguns minutos...
echo.

REM Compilar com PyInstaller
pyinstaller --onefile ^
    --name=LabAgent ^
    --icon=NONE ^
    --hidden-import=wmi ^
    --hidden-import=win32api ^
    --hidden-import=win32com ^
    --hidden-import=pythoncom ^
    --hidden-import=netifaces ^
    --add-data "config.yaml.template;." ^
    --noconsole ^
    agent.py

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo  BUILD CONCLUIDO COM SUCESSO!
    echo ========================================
    echo.
    echo Executavel gerado em:
    echo   dist\LabAgent.exe
    echo.
    echo Tamanho: 
    dir dist\LabAgent.exe | find "LabAgent.exe"
    echo.
    
    REM Copiar para diretorio do backend
    echo Copiando para backend...
    if not exist "..\backend\storage\app\public\agent" mkdir "..\backend\storage\app\public\agent"
    copy /Y "dist\LabAgent.exe" "..\backend\storage\app\public\agent\LabAgent-Setup.exe"
    
    if %errorlevel% equ 0 (
        echo [OK] Executavel copiado para backend!
        echo.
        echo Agora voce pode fazer download pelo painel web:
        echo   http://localhost:3000/agentes
        echo.
    )
) else (
    echo.
    echo [ERRO] Falha ao compilar!
    echo.
)

pause

