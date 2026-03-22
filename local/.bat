@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo Iniciando aplicacoes...
echo ==========================================

set LOCAL_DIR=%~dp0
for %%i in ("%LOCAL_DIR%..") do set ROOT_DIR=%%~fi

set FRONTEND_DIR=%ROOT_DIR%\frontend
set NODE_DIR=%ROOT_DIR%\backend-mock
set JAVA_DIR=%ROOT_DIR%\backend\debit-authorizer-simulator

REM ===== FRONTEND ANGULAR =====
echo.
echo [1/3] Frontend Angular
cd /d "%FRONTEND_DIR%"
call npm install
if errorlevel 1 (
    echo Erro no npm install do frontend Angular.
    pause
    exit /b 1
)
start "" /min cmd /c "cd /d ""%FRONTEND_DIR%"" && npm start"

REM ===== BACKEND NODE =====
echo.
echo [2/3] Backend Node
cd /d "%NODE_DIR%"
call npm install
if errorlevel 1 (
    echo Erro no npm install do backend Node.
    pause
    exit /b 1
)
start "" /min cmd /c "cd /d ""%NODE_DIR%"" && npm run dev"

REM ===== BACKEND JAVA SPRING BOOT =====
echo.
echo [3/3] Backend Java Spring Boot
cd /d "%JAVA_DIR%"

if not exist pom.xml (
    echo Erro: nao foi encontrado pom.xml em:
    echo %JAVA_DIR%
    pause
    exit /b 1
)

if exist mvnw.cmd (
    call mvnw.cmd clean package -DskipTests
) else (
    call mvn clean package -DskipTests
)

if errorlevel 1 (
    echo Erro ao gerar o jar do backend Java.
    pause
    exit /b 1
)

set JAR_FILE=
for %%f in (target\*.jar) do (
    set JAR_FILE=%%f
    goto :jar_found
)

:jar_found
if "%JAR_FILE%"=="" (
    echo Erro: nenhum arquivo .jar foi encontrado na pasta target.
    pause
    exit /b 1
)

start "" /min cmd /c "cd /d ""%JAVA_DIR%"" && java -Dapp.csv.cenarios-file=""%LOCAL_DIR%simulador_cenarios_testes.csv"" -jar ""%JAR_FILE%"""

REM ===== ABRIR NAVEGADOR =====
timeout /t 8 /nobreak > nul
start "" http://localhost:4200

echo.
echo ===============================================================
echo Todas as aplicacoes foram iniciadas - Tecle ENTER para fechar este terminal.
echo ===============================================================
pause