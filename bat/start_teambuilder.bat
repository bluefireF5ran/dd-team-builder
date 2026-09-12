@echo off
cd /d "%~dp0.."
title DD Team Builder

rem El vigilante de comps, en su propia ventana y minimizado.
rem
rem Sin el, el index se genera una vez (prestart) y la libreria que ve la app es
rem la que habia al arrancar: sueltas un .json en src\data\presetComps y no
rem existe hasta que reinicias el servidor. Con el, el index se regenera solo, el
rem servidor de desarrollo lo recoge y la pagina se recarga con la comp dentro.
rem
rem Si prefieres hacerlo a mano: bat\refresh_comps.bat, o "npm run comps:index".
start "DD comps watcher" /min cmd /c node scripts\watchPresetComps.js

echo Iniciando DD Team Builder...
call npm start

rem npm start ha terminado (Ctrl+C o cierre): el vigilante ya no pinta nada.
taskkill /fi "WINDOWTITLE eq DD comps watcher*" /t /f >nul 2>&1
pause
