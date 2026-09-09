@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0.."
title DD Team Builder - Subir comps
echo ============================================
echo   Darkest Dungeon - Subir comps nuevas
echo ============================================
echo.

for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD') do set "RAMA=%%b"
echo Rama actual: !RAMA!
echo.

if not exist "node_modules" (
  echo Instalando dependencias...
  call npm install
  echo.
)

rem Una comp guardada desde la app es un fichero suelto: hasta que no se
rem regenera el index no esta en el bundle, y subirla sin el index deja el
rem repo diciendo que existe una comp que la app no carga.
echo Regenerando el index...
node scripts\generatePresetCompsIndex.js
if errorlevel 1 goto fallo
echo.

rem --check sale con 1 si hay renombrados pendientes. No se aborta por eso: una
rem comp recien guardada ya viene con su nombre taxonomico, y si algo se ha
rem descolocado es cosa de rebuild_taxonomy, no de este bat.
node scripts\nameComps.js --check >nul 2>&1
if not errorlevel 1 goto taxonomia_ok
echo --------------------------------------------
echo   AVISO: hay nombres de comp sin actualizar.
echo   Pasa antes bat\rebuild_taxonomy.bat si quieres subirlos ya.
echo --------------------------------------------
echo.
:taxonomia_ok

git add -- src/data/presetComps
if errorlevel 1 goto fallo

set "COUNT=0"
for /f "delims=" %%f in ('git diff --cached --name-only -- src/data/presetComps') do set /a COUNT+=1

if "!COUNT!"=="0" (
  echo No hay ninguna comp nueva ni modificada. Nada que subir.
  echo.
  pause
  exit /b 0
)

echo --------------------------------------------
echo   QUE SE VA A SUBIR  ^(!COUNT! ficheros^)
echo --------------------------------------------
git diff --cached --name-status -- src/data/presetComps
echo.

echo --------------------------------------------
echo   COMPROBANDO
echo --------------------------------------------
set CI=true
call npx react-scripts test --testPathPattern="presetComp|compNaming|compIdentity|compGenerator" --watchAll=false
if errorlevel 1 goto fallo_test
echo.

set "MSG=Add comps to the library"
echo Mensaje del commit ^(Enter para dejar el de por defecto, sin comillas^):
set /p "MSG=  [!MSG!] "
echo.

echo --------------------------------------------
echo Se hara commit de src\data\presetComps y push a origin/!RAMA!.
echo El resto de cambios que tengas a medias NO se tocan.
echo.

choice /c SN /n /m "Continuar? [S/N] "
if errorlevel 2 goto cancelado

echo.
git commit -m "!MSG!" -- src/data/presetComps
if errorlevel 1 goto fallo_commit

echo.
git push origin HEAD
if errorlevel 1 goto fallo_push

echo.
echo --------------------------------------------
echo   Subido a origin/!RAMA!.
echo --------------------------------------------
echo.
pause
exit /b 0

:cancelado
echo.
echo Cancelado. Las comps se quedan preparadas ^(git add hecho^) pero sin commit.
echo Para soltarlas: git restore --staged src/data/presetComps
echo.
pause
exit /b 0

:fallo_test
echo.
echo Los tests fallan, asi que no se sube nada.
echo Las comps se quedan preparadas; suelta con:
echo   git restore --staged src/data/presetComps
echo.
pause
exit /b 1

:fallo_commit
echo.
echo ERROR al hacer el commit. No se ha subido nada.
echo.
pause
exit /b 1

:fallo_push
echo.
echo El commit SI se ha hecho, pero el push ha fallado.
echo Suele ser que la rama remota ha avanzado: git pull --rebase y reintenta.
echo.
pause
exit /b 1

:fallo
echo.
echo ERROR. Revisa el mensaje de arriba.
echo.
pause
exit /b 1
