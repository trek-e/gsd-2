@echo off
setlocal

if "%~1"=="-f" (
  if exist "%~2" (
    exit /b 0
  ) else (
    exit /b 1
  )
)

if "%~1"=="-d" (
  if exist "%~2\NUL" (
    exit /b 0
  ) else (
    exit /b 1
  )
)

echo Unsupported test arguments: %*
exit /b 2
