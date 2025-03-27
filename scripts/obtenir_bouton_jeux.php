<?php

include "./scripts.php";

$zone_par_défaut = $_GET["zone_par_défaut"] ?? null;

$chemin_du_fichier = dirname(__DIR__) . "/données/zones.json";
$zones = obtenir_json($chemin_du_fichier);

$bouton = "";
$nombre_de_caractères_maximum = 30;

foreach ($zones as $index => $zone) {
    $selectionné = ($zone["id"] == $zone_par_défaut || (!$zone_par_défaut && $index == 0)) ? " selected" : "";
    $bouton .= "
    <option 
        value='" . $zone["id"] . "' 
        title='" . ((strlen($zone["nom"]) > $nombre_de_caractères_maximum + 3) ? $zone["nom"] : "") . "'
        $selectionné
    >" . obtenir_texte_tronqué($zone["nom"], $nombre_de_caractères_maximum) . "</option>";
}

echo json_encode(array("bouton" => "<select id='choix-jeu' aria-label='Choix de la zone'>$bouton</select>"));