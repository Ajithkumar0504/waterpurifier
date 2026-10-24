@echo off
title Califnco Water Project - Admin & Store
echo ========================================================
echo        Califnco Water Project - Admin & Store
echo ========================================================
echo.
cd /d "%~dp0admin-panel"
echo Starting Admin Dashboard and Store Preview...
echo Once started, open your browser at: http://localhost:3000
echo.
npm run dev
pause
