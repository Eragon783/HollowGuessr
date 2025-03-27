<?php

include "./scripts.php";

$zone = $_GET["zone"];
$fichier = $_GET["fichier"];

$chemin_du_fichier = dirname(__DIR__) . "/données/$zone/coordonnées.json";
$coordonnées = obtenir_json($chemin_du_fichier);

echo json_encode($coordonnées[$fichier]);