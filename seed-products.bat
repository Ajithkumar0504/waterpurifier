@echo off
title Califnco Water Project - Seed Products
echo ========================================================
echo   Califnco Water - Seeding 50 Products into Firestore
echo ========================================================
echo.
cd /d "%~dp0admin-panel"
node scripts/seed.mjs
pause
