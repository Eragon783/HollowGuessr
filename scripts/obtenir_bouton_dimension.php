<?php

include "./scripts.php";

$zone = $_GET["jeu"];
$dimension_par_défaut = $_GET["dimension_par_défaut"] ?? null;

$chemin_du_fichier = dirname(__DIR__) . "/données/zones.json";
$zones = obtenir_json($chemin_du_fichier)[$zone];

$bouton = "";
$difficultés = ["Easy", "Medium", "Hard", "Impossible"];

foreach ($zones["dimensions"]["associées_aux_difficultés"] as $index => $dimension) {
    $selectionné = ($dimension_par_défaut && $difficultés[$index] == $dimension_par_défaut) || (!$dimension_par_défaut && $index == 1) ? " selected" : "";
    $bouton .= "<option value='$dimension'$selectionné>$difficultés[$index]</option>";
}

echo json_encode(array("bouton" => "
    <select 
        id='choix-dimension' 
        facteur-de-zoom='" . $zones["facteur_de_zoom"] . "' 
        dimension-solution='" . $zones["dimensions"]["solution"] . "' 
        seuil-100='" . $zones["score"]["seuil_100"] . "' 
        seuil-0='" . $zones["score"]["seuil_0"] . "' 
        marqueur='" . $zones["marqueur"] . "' 
        favicon='" . $zones["favicon"] . "' 
        aria-label='Choix du niveau de difficulté'
    >$bouton</select>
"));