@echo off
setlocal
cd /d "%~dp0.."
title DD Team Builder - Best in slot
echo ============================================
echo   Darkest Dungeon - Best in slot
echo ============================================
echo.
echo Los BIS no son un fichero que se regenere: src\data\bisIndex.js
echo los deriva en caliente de la libreria de comps, de modelUsage.json
echo y de la legalidad de rango.
echo.
echo O sea que cada comp que entra puede mover un BIS sin que nadie
echo toque una linea. Esto los recalcula y te dice cuales se han
echo movido desde la ultima foto.
echo.

if not exist "node_modules" (
  echo Instalando dependencias...
  call npm install
  echo.
)

rem El index tiene que estar al dia: los BIS se leen de la libreria empaquetada,
rem asi que una comp nueva sin indexar no cuenta para nada de lo de abajo.
node scripts\generatePresetCompsIndex.js
if errorlevel 1 goto fallo
echo.

node scripts\reportBis.js
if errorlevel 1 goto fallo

echo.
echo --------------------------------------------
echo   QUE MAS PUEDES PEDIRLE
echo --------------------------------------------
echo   scripts\reportBis.js --all      la tabla entera, 4 rangos por clase
echo   scripts\reportBis.js --thin     solo las celdas con pocas muestras
echo   scripts\reportBis.js --modded   incluye los heroes de mods
echo.

choice /c SN /n /m "Guardar esta foto como la nueva referencia? [S/N] "
if errorlevel 2 goto singuardar

echo.
node scripts\reportBis.js --save
if errorlevel 1 goto fallo
echo.
echo Listo. La proxima vez se comparara contra esta.
echo.
pause
exit /b 0

:singuardar
echo.
echo No se ha guardado: la proxima comparacion sigue siendo contra la foto vieja.
echo.
pause
exit /b 0

:fallo
echo.
echo ERROR. Revisa el mensaje de arriba.
echo.
pause
exit /b 1
