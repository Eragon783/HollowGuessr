@echo off

:: git init
:: git remote add origin https://github.com/Eragon783/HollowGuessr.git
:: git fetch origin
:: git checkout -b main

git add --all
git commit -m "..."
git fetch origin
git push origin main --force-with-lease

pause