<?php

include "./scripts.php";

$zone = $_GET["zone"];
$dimension = isset($_GET["dimension"]) && $_GET["dimension"] !== "null" ? $_GET["dimension"] : null;

if (isset($dimension)) {
    $chemin_du_dossier = dirname(__DIR__) . "/images/screenshots/$zone/screenshots_$dimension";
} else $chemin_du_dossier = dirname(__DIR__) . "/images/screenshots/$zone/";

$nombre_de_fichiers = count(obtenir_les_fichiers($chemin_du_dossier));

echo json_encode(["nombre_de_fichiers" => $nombre_de_fichiers]);