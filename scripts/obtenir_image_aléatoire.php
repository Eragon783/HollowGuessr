<?php

include "./scripts.php";

$zone = $_GET["zone"];
$dimension = isset($_GET["dimension"]) && $_GET["dimension"] !== "null" ? $_GET["dimension"] : null;
$exclure = $_GET["exclure"] ?? null;

if (isset($dimension)) {
    $chemin_du_dossier = dirname(__DIR__) . "/images/screenshots/$zone/screenshots_$dimension/";
} else $chemin_du_dossier = dirname(__DIR__) . "/images/screenshots/$zone/";

$fichiers = obtenir_les_fichiers($chemin_du_dossier);

if ($exclure !== null && in_array($exclure, $fichiers)) {
    $fichiers = array_diff($fichiers, [$exclure]);
}

echo json_encode(array("fichier" => $fichiers[array_rand($fichiers)]));