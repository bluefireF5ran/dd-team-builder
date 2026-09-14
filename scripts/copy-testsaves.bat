@echo off
setlocal enabledelayedexpansion
rem ---------------------------------------------------------------------------
rem  Copy the live Darkest Dungeon saves into testsave\, so the tools read what
rem  the campaign actually looks like now.
rem
rem  profile_9 is left alone on purpose: it is not a test state.
rem
rem  Usage:  scripts\copy-testsaves.bat  ["<...\262060\remote>"]
rem  The path is optional; without it the one below is used.
rem
rem  testsave\ is gitignored - this copies a personal save into the working
rem  tree and nothing here ever commits it.
rem ---------------------------------------------------------------------------

set "SRC=%~1"
if "%SRC%"=="" set "SRC=D:\Program Files (x86)\Steam\userdata\312830650\262060\remote"

rem This file lives in scripts\, so the repo root is one up.
set "DST=%~dp0..\testsave"

if not exist "%SRC%" (
  echo Cannot find the save folder: "%SRC%"
  echo Pass it as the first argument if Steam is installed somewhere else.
  exit /b 1
)
if not exist "%DST%" mkdir "%DST%"

set "COPIED=0"
set "SKIPPED="

for /d %%P in ("%SRC%\profile_*") do (
  if /I "%%~nxP"=="profile_9" (
    set "SKIPPED=!SKIPPED! %%~nxP"
  ) else (
    echo Copying %%~nxP . . .
    robocopy "%%P" "%DST%\%%~nxP" /E /NFL /NDL /NJH /NJS /NP >nul
    rem robocopy says 0-7 for success; 8 and up is a real failure.
    if errorlevel 8 (
      echo   FAILED on %%~nxP
    ) else (
      set /a COPIED+=1
    )
  )
)

echo.
echo Copied !COPIED! profile^(s^) into "%DST%".
if not "!SKIPPED!"=="" echo Left alone:!SKIPPED!
endlocal
