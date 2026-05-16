@echo off
title Outreach Bot
cd /d "C:\Users\Agam\gmail_bot\outreach-os"
:loop
echo [%date% %time%] Bot starting >> "%TEMP%\outreach-bot.log"
"C:\Program Files\nodejs\npm.cmd" run bot >> "%TEMP%\outreach-bot.log" 2>&1
echo [%date% %time%] Bot exited, restarting in 5s >> "%TEMP%\outreach-bot.log"
timeout /t 5 /nobreak >nul
goto loop
