@echo off
cd /d "%~dp0"
title DD Ranking Engine
echo ============================================
echo   Darkest Dungeon - Ranking Engine
echo ============================================
echo.
if not exist "node_modules" (
  echo Instalando dependencias...
  call npm install
)
echo Iniciando servidor de desarrollo...
echo La pagina se abrira sola en http://localhost:3000/#/ranker
echo.
rem CRA abriria la raiz; abrimos nosotros la pagina del ranker al responder el servidor.
set "BROWSER=none"
start "" /min powershell -NoProfile -Command "$u='http://localhost:3000'; for($i=0;$i -lt 120;$i++){ try{ Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 2 | Out-Null; break }catch{}; Start-Sleep -Seconds 2 }; Start-Process ($u + '/#/ranker')"
call npm start
pause
