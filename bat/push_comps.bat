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
echo   COMPROBANDO  ^(lo mismo que el CI de GitHub: lint + tests + build^)
echo --------------------------------------------
set CI=true

rem Los tres pasos son los del workflow, en el mismo orden y con el mismo CI=true.
rem Antes aqui solo corrian cuatro ficheros de tests y ni se compilaba, asi que el
rem bat daba verde y GitHub rojo: lo unico que sirve es correr lo que corre el CI.

rem El lint va primero aunque `npm run build` ya lo haga: tarda seis segundos
rem frente a los cincuenta de la tanda entera, y con CI=true un simple aviso de
rem eslint ^(un import que sobra^) es "Failed to compile" alli. Fallar rapido.
echo [1/3] Lint...
call npx eslint src/ --max-warnings 0
if errorlevel 1 goto fallo_lint
echo.

rem La suite ENTERA, no solo los tests de comps: una comp nueva entra en el
rem indice, y el indice lo lee media libreria. Pasar cuatro ficheros de tests y
rem que el CI se caiga en un quinto es justo lo que hay que evitar.
rem Via npm, que el hook pretest regenera el indice igual que hace el CI.
echo [2/3] Tests...
call npm test -- --watchAll=false
if errorlevel 1 goto fallo_test
echo.

rem Y compilar. Los tests no cubren todo el arbol: un import roto en un fichero
rem sin test pasa lint y pasa tests, y solo se cae aqui. Son ~25 segundos.
echo [3/3] Build...
call npm run build
if errorlevel 1 goto fallo_build
echo.

rem Lo de arriba se ha comprobado sobre el ARBOL DE TRABAJO, pero el commit solo
rem lleva src\data\presetComps. Si el verde de aqui depende de un fichero que no
rem se sube, el CI lo vera rojo. No se aborta: es legitimo dejar cosas a medias,
rem pero hay que decirlo antes de empujar, no leerlo en GitHub diez minutos despues.
set "SUCIO="
for /f "delims=" %%f in ('git status --porcelain -- . ":(exclude)src/data/presetComps"') do set "SUCIO=1"
if not defined SUCIO goto arbol_limpio
echo --------------------------------------------
echo   AVISO: hay cambios FUERA de presetComps que NO se van a subir:
git status --short -- . ":(exclude)src/data/presetComps"
echo.
echo   El lint y los tests de arriba los han visto; el CI de GitHub no.
echo   Si alguno de esos ficheros es lo que hace que pasen, commitealo aparte.
echo --------------------------------------------
echo.
:arbol_limpio

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

:fallo_lint
echo.
echo El lint falla, asi que no se sube nada: con CI=true el build de GitHub
echo trata los avisos como errores y el push saldria en rojo.
echo Arregla lo de arriba ^(suele ser un import o una variable sin usar^).
echo Las comps se quedan preparadas; suelta con:
echo   git restore --staged src/data/presetComps
echo.
pause
exit /b 1

:fallo_build
echo.
echo El build falla, asi que no se sube nada: el CI se caeria en el mismo sitio.
echo Las comps se quedan preparadas; suelta con:
echo   git restore --staged src/data/presetComps
echo.
pause
exit /b 1

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
