@echo off
chcp 65001 >nul
title अर्थसंयम (Arthasanyam) — Local Jamakharch Vault Launcher
cd /d "%~dp0"
echo ============================================================
echo   अर्थसंयम (Arthasanyam) — 100%% Offline Jamakharch Vault
echo ============================================================
echo.
if exist "arthasanyam-portable-offline.html" (
  echo Opening Portable Offline Vault in your browser...
  start "" "arthasanyam-portable-offline.html"
)
echo Starting Local Vite Dev Server on http://localhost:5173 ...
npm run dev -- --port 5173 --open
pause
