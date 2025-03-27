:: Désactive l'affichage des commandes dans la console pour un affichage plus propre
@echo off

:: Initialisation du dépôt Git
:: git init

:: Ajout du remote
:: git remote add origin https://github.com/Eragon783/HollowGuessr.git

:: Récupération des données du dépôt distant
:: git fetch origin

:: Création et passage sur la branche "main"
:: git checkout -b main

:: Ajoute tous les fichiers et modifications au commit
git add --all

:: Crée un commit avec le message "..."
git commit -m "..."

:: Récupère les dernières mises à jour du dépôt distant pour éviter les conflits
git fetch origin

:: Pousse les modifications sur la branche "main" en empêchant l'écrasement si des changements ont été faits sur le dépôt distant
git push origin main --force-with-lease

:: Met en pause le script pour voir le résultat avant que la fenêtre ne se ferme
pause