@echo off
REM Script para iniciar simultaneamente o Back-end Python (FastAPI) e o Front-end Next.js 3D do Shift3D
SET PATH=C:\Users\ADM03\.tools\node-v24.21.0-win-x64;C:\Users\ADM03\.tools\python312;C:\Users\ADM03\.tools\python312\Scripts;%PATH%

echo Iniciando Back-end Shift3D (FastAPI + DDD) em http://localhost:8000 ...
start "Shift3D Backend (FastAPI)" /D "%~dp0backend" "C:\Users\ADM03\.tools\python312\python.exe" main.py

echo Iniciando Front-end Shift3D (Next.js + React Three Fiber) em http://localhost:3000 ...
start "Shift3D Frontend (Next.js)" /D "%~dp0frontend" "C:\Users\ADM03\.tools\node-v24.21.0-win-x64\npm.cmd" run dev

echo Ambos os servidores foram iniciados! Acesse http://localhost:3000 no seu navegador.
