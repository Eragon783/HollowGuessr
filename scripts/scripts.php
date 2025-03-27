<?php

function obtenir_les_fichiers($chemin_du_dossier) {
    return array_diff(scandir($chemin_du_dossier), array("..", "."));
}

function obtenir_json($chemin_du_fichier) {
    return json_decode(file_get_contents($chemin_du_fichier), true);
}

function obtenir_texte_tronqué($texte, $nombre_de_caractères_maximum) {
    if (strlen($texte) > $nombre_de_caractères_maximum + 3) {
        return substr($texte, 0, $nombre_de_caractères_maximum) . "...";
    }
    return $texte;
}