@echo off
setlocal
cd /d "%~dp0"
title DD Team Builder - Taxonomia de comps
echo ============================================
echo   Darkest Dungeon - Taxonomia de comps
echo ============================================
echo.
echo Relee TODAS las comps de src\data\presetComps y vuelve a
echo derivar familia + variante para cada una.
echo.

if not exist "node_modules" (
  echo Instalando dependencias...
  call npm install
  echo.
)

rem --check sale con 1 si hay renombrados pendientes, 0 si ya esta al dia.
node scripts\nameComps.js --check
if errorlevel 1 goto cambios

echo.
echo No hay nada que hacer.
echo.
pause
exit /b 0

:cambios
echo.
echo --------------------------------------------
echo   CAMBIOS PROPUESTOS
echo --------------------------------------------
node scripts\nameComps.js --changed
echo.
echo --------------------------------------------
echo Se reescribira teamName, se renombraran los ficheros y se
echo regenerara el index. Los nombres de autor se guardan en "alias".
echo Deshacer: git checkout -- src/data/presetComps
echo.

choice /c SN /n /m "Aplicar? [S/N] "
if errorlevel 2 goto cancelado

echo.
node scripts\nameComps.js --apply
if errorlevel 1 goto fallo

echo.
echo --------------------------------------------
echo   COMPROBANDO
echo --------------------------------------------
set CI=true
call npx react-scripts test --testPathPattern=compNaming --watchAll=false
if errorlevel 1 goto fallo_test

echo.
echo Listo.
echo.
pause
exit /b 0

:cancelado
echo.
echo Cancelado, no se ha tocado nada.
echo.
pause
exit /b 0

:fallo
echo.
echo ERROR al aplicar. Revisa el mensaje de arriba.
echo Para volver atras: git checkout -- src/data/presetComps
echo.
pause
exit /b 1

:fallo_test
echo.
echo Los ficheros SI se han renombrado, pero los tests fallan.
echo Revisa el fallo o vuelve atras con: git checkout -- src/data/presetComps
echo.
pause
exit /b 1
