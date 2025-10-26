@echo off
echo ========================================
echo  LabAgent - Desinstalacao do Servico
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

echo Parando servico LabAgent...
net stop LabAgentService

echo.
echo Removendo servico...
sc delete LabAgentService

echo.
echo ========================================
echo  Desinstalacao concluida!
echo ========================================
echo.
echo O servico LabAgent foi removido do sistema.
echo.
echo NOTA: Os arquivos em C:\LabAgent nao foram removidos.
echo Se desejar, voce pode remove-los manualmente.
echo.
pause

