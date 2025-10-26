@echo off
echo ========================================
echo  LabAgent - Instalacao como Servico
echo ========================================
echo.

REM Verificar se esta rodando como Administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERRO: Este script precisa ser executado como Administrador!
    echo Clique com botao direito e selecione "Executar como administrador"
    pause
    exit /b 1
)

echo Instalando LabAgent como servico do Windows...
echo.

REM Instalar NSSM se nao estiver presente
if not exist "%~dp0nssm.exe" (
    echo AVISO: nssm.exe nao encontrado.
    echo Por favor, baixe NSSM de https://nssm.cc/download
    echo e coloque nssm.exe nesta pasta.
    pause
    exit /b 1
)

REM Criar diretorio C:\LabAgent se nao existir
if not exist "C:\LabAgent" mkdir "C:\LabAgent"

REM Copiar arquivos
echo Copiando arquivos para C:\LabAgent...
xcopy /E /Y "%~dp0..\*.*" "C:\LabAgent\"

REM Instalar servico com NSSM
echo.
echo Instalando servico...
"%~dp0nssm.exe" install LabAgentService "C:\Windows\System32\python.exe" "C:\LabAgent\agent.py"
"%~dp0nssm.exe" set LabAgentService AppDirectory "C:\LabAgent"
"%~dp0nssm.exe" set LabAgentService DisplayName "LabAgent - Inventario Automatizado"
"%~dp0nssm.exe" set LabAgentService Description "Agente de coleta automatica de inventario de hardware e software"
"%~dp0nssm.exe" set LabAgentService Start SERVICE_AUTO_START

echo.
echo Iniciando servico...
"%~dp0nssm.exe" start LabAgentService

echo.
echo ========================================
echo  Instalacao concluida!
echo ========================================
echo.
echo O servico LabAgent foi instalado e iniciado.
echo Para gerenciar o servico, use:
echo   - services.msc (Gerenciador de Servicos)
echo   - ou os comandos: net start/stop LabAgentService
echo.
echo Logs serao salvos em: C:\LabAgent\agent.log
echo.
pause

