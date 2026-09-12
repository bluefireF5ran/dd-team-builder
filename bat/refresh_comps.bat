@echo off
setlocal
cd /d "%~dp0.."
title DD Team Builder - Refrescar comps
echo ============================================
echo   Darkest Dungeon - Refrescar comps
echo ============================================
echo.
echo Vuelve a leer src\data\presetComps y regenera el index.
echo.
echo Con "npm start" levantado NO hace falta reiniciar nada: el
echo servidor vigila el index, recompila solo y la pagina se
echo recarga con las comps nuevas ya dentro.
echo.

node scripts\generatePresetCompsIndex.js
if errorlevel 1 goto fallo

echo.
echo Listo. Si tenias la app abierta, ya se ha recargado sola.
echo.
pause
exit /b 0

:fallo
echo.
echo ERROR. Revisa el mensaje de arriba.
echo.
pause
exit /b 1
