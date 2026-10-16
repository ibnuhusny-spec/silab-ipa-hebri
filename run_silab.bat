@echo off
title SILAB-IPA - IAI YAPNAS JENEPONTO
echo =========================================================================
echo    SILAB-IPA: SISTEM INFORMASI MANAJEMEN INVENTARIS LABORATORIUM
echo       INSTITUT AGAMA ISLAM (IAI) YAPNAS JENEPONTO - TADRIS IPA
echo =========================================================================
echo.
echo Menjalankan server aplikasi di http://localhost:5173 ...
echo.
start "" "http://localhost:5173"
node server.js
pause
