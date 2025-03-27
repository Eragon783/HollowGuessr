$(function () {
    mettre_à_jour_les_scores();
    $("#recharger").click(lancer_le_jeu);

    let url_bouton_jeux = "./scripts/obtenir_bouton_jeux.php";
    const zone_par_défaut = localStorage.getItem("zone_par_défaut");
    if (zone_par_défaut) {
        url_bouton_jeux += `?zone_par_défaut=${zone_par_défaut}`;
    }

    $.getJSON(url_bouton_jeux, données => {
        $(données.bouton).prependTo("#menu").change(bouton_jeux_change);
        bouton_jeux_change();
    }).fail((_, statut, erreur) => console.error("Erreur:", statut, erreur));
});

function bouton_jeux_change() {
    const jeu_sélectionné = $("#choix-jeu").val();

    let est_localisation = false
    $.getJSON("./données/zones.json", données => {
        est_localisation = (données[jeu_sélectionné]["type"] == "localisation")

        let url_bouton_dimension = `./scripts/obtenir_bouton_dimension.php?jeu=${jeu_sélectionné}`;
        if (est_localisation == true) {
            url_bouton_dimension = `./scripts/obtenir_bouton_dimension.php?jeu=${jeu_sélectionné}`;

            const dimension_par_défaut = localStorage.getItem("dimension_par_défaut");
            if (dimension_par_défaut) {
                url_bouton_dimension += `&dimension_par_défaut=${dimension_par_défaut}`;
            }
        }
        
        localStorage.setItem("zone_par_défaut", jeu_sélectionné);

        $("#carte").attr("src", "./images/chargement.gif");

        const nouvelle_image = new Image();
        nouvelle_image.src = `./images/cartes/${jeu_sélectionné}/corrigée_petite.webp`;
        nouvelle_image.onload = () => $("#carte").attr("src", nouvelle_image.src);

        $("#zoom").attr("src", nouvelle_image.src);
        $("#choix-dimension").remove();

        if (est_localisation == true) {
            $.getJSON(url_bouton_dimension, données => {
                const $bouton_dimension = $(données.bouton).insertAfter("#choix-jeu");
                $bouton_dimension.change(() => {
                    const dimension_sélectionnée = $("#choix-dimension option:selected").text();
                    localStorage.setItem("dimension_par_défaut", dimension_sélectionnée);
                    lancer_le_jeu();
                });
                lancer_le_jeu();
                $("link[rel='icon']").attr("href", `./images/favicon/${$("#choix-dimension").attr("favicon")}.png`);
            }).fail((_, statut, erreur) => console.error("Erreur:", statut, erreur));
        } else lancer_le_jeu();

    }).fail((_, statut, erreur) => console.error("Erreur:", statut, erreur));
}

$("#carte").click(évènement => {
    if (!$("#score").length) {
        const carte = $("#carte")[0];
        const dimensions_carte = carte.getBoundingClientRect();

        const fichiers_marqueurs = [
            "./images/marqueurs/bleu.webp",
            "./images/marqueurs/rouge.webp",
            "./images/marqueurs/jaune.webp",
            "./images/marqueurs/gris.webp"
        ];

        const ancien_marqueur = $("img.marqueur");
        const fichier_marqueur = ancien_marqueur.length
            ? ancien_marqueur.attr("src")
            : fichiers_marqueurs[Math.floor(Math.random() * fichiers_marqueurs.length)];

        const position_x = Math.round((évènement.clientX - dimensions_carte.left) * (carte.naturalWidth / dimensions_carte.width));
        const position_y = Math.round((évènement.clientY - dimensions_carte.top) * (carte.naturalHeight / dimensions_carte.height));

        $("<img>", {
            id: "marqueur-réponse",
            src: fichier_marqueur,
            class: "marqueur élément-éphémère",
            x: position_x,
            y: position_y,
            css: { left: évènement.pageX, top: évènement.pageY }
        }).appendTo("main");

        ancien_marqueur.remove();

        if (!$("#confirmer-jeu").length) {
            $("<button>", {
                id: "confirmer-jeu",
                text: "Confirm"
            }).appendTo("main").click(confirmer_jeu_clic);
        }
    }
});

function confirmer_jeu_clic() {
    if (!$("#score").length) {
        const carte = $("#carte");
        const dimensions_carte = carte[0].getBoundingClientRect();

        const jeu_sélectionné = $("#choix-jeu").val();
        const dimension_sélectionnée = $("#choix-dimension").val();

        const marqueur_réponse = $("#marqueur-réponse");
        const screenshot = $("#screenshot");
        const dimensions_screenshot = screenshot[0].getBoundingClientRect();

        $.getJSON(`./scripts/obtenir_localisation.php?zone=${jeu_sélectionné}&fichier=${encodeURIComponent(screenshot.attr("fichier_image_aléatoire"))}`, données => {
            const différence_x = marqueur_réponse.attr("x") - données.x;
            const différence_y = marqueur_réponse.attr("y") - données.y;
            const distance = Math.abs(différence_x) + Math.abs(différence_y);

            $.getJSON("./données/zones.json", zone => {

                const seuil_proche = parseInt(zone[jeu_sélectionné].score.seuil_100);
                const seuil_loin = parseInt(zone[jeu_sélectionné].score.seuil_0);
                const score = distance <= seuil_proche ? 100 :
                    distance >= seuil_loin ? 0 :
                        Math.round(100 - ((distance - seuil_proche) / (seuil_loin - seuil_proche) * 100));

                $("#confirmer-jeu").remove();
                $("#carte").css("cursor", "default");
                if (dimension_sélectionnée != null) {
                    screenshot.attr("src", `./images/screenshots/${jeu_sélectionné}/screenshots_${dimension_sélectionnée}/${screenshot.attr("fichier_image_aléatoire")}`);
                }

                const marqueur_solution = $("<img>", {
                    class: "marqueur élément-éphémère",
                    id: "marqueur-solution",
                    src: `./images/marqueurs/${zone[jeu_sélectionné].marqueur}.webp`,
                    x: données.x,
                    y: données.y,
                    css: {
                        left: carte.offset().left + Math.round(données.x * (dimensions_carte.width / carte[0].naturalWidth)) + "px",
                        top: carte.offset().top + Math.round(données.y * (dimensions_carte.height / carte[0].naturalHeight)) + "px"
                    }
                }).appendTo("main");

                marqueur_solution.on("load", () => {
                    const ligne = $("<div>", { id: "ligne", class: "élément-éphémère" }).appendTo("main");
                    tracer_une_ligne(ligne, marqueur_réponse, marqueur_solution);
                });

                const emotes = {
                    triste: ["hornet_cry", "hornet_facepalm", "hornet_why", "knight_cry", "knight_ugh", "zote_mad"],
                    moyen: ["knight_think", "hornet_wut", "knight_wut"],
                    bien: ["hornet_git_gud", "knight_hype", "knight_giggle"]
                };

                const emote = score <= 100 / 3 ? emotes.triste[Math.floor(Math.random() * emotes.triste.length)] :
                    score <= 200 / 3 ? emotes.moyen[Math.floor(Math.random() * emotes.moyen.length)] :
                        emotes.bien[Math.floor(Math.random() * emotes.bien.length)];

                $("<div>", {
                    id: "score",
                    class: "élément-éphémère",
                    html: `<p><span id="animated-score">0</span><small>/100</small></p>
                           <img class='emote' src='./images/emotes/${emote}.webp'>`
                }).appendTo("main");

                let start;
                const duration = 2000;
                const easeOutCubic = t => 1 - Math.pow(1 - t, 5);

                const step = timestamp => {
                    if (!start) start = timestamp;
                    let progress = Math.min((timestamp - start) / duration, 1);
                    let currentScore = Math.round(easeOutCubic(progress) * score);
                    $("#animated-score").text(currentScore);
                    if (progress < 1) requestAnimationFrame(step);
                };

                requestAnimationFrame(step);

                if (dimension_sélectionnée != null) {

                    const dimension_solution = $("#choix-dimension").attr("dimension-solution");
                    const largeur = dimensions_screenshot.width * dimension_sélectionnée / dimension_solution;
                    const hauteur = dimensions_screenshot.height * dimension_sélectionnée / dimension_solution;

                    $("<div>", {
                        id: "carré",
                        class: "élément-éphémère",
                        css: {
                            width: largeur + "px",
                            height: hauteur + "px",
                            top: screenshot.offset().top + dimensions_screenshot.width / 2 - largeur / 2 + "px",
                            left: screenshot.offset().left + dimensions_screenshot.height / 2 - hauteur / 2 + "px"
                        }
                    }).appendTo("main");
                }

                localStorage.setItem(`screenshot_${screenshot.attr("fichier_image_aléatoire")}`, score);
                localStorage.setItem(`screenshot_${screenshot.attr("fichier_image_aléatoire")}_timestamp`, Date.now());
                mettre_à_jour_les_scores();

                $("<button>", {
                    id: "continue",
                    class: "élément-éphémère",
                    html: "Continue"
                }).appendTo("main").on("click", lancer_le_jeu);
            })

        }).fail((_, statut, erreur) => console.error("Erreur:", statut, erreur));
    }
}

function tracer_une_ligne(ligne, point_1, point_2) {
    const rect_1 = point_1[0].getBoundingClientRect();
    const rect_2 = point_2[0].getBoundingClientRect();

    const centre_1 = {
        x: rect_1.left + rect_1.width / 2 + document.documentElement.scrollLeft,
        y: rect_1.top + rect_1.height / 2 + document.documentElement.scrollTop
    };

    const centre_2 = {
        x: rect_2.left + rect_2.width / 2 + document.documentElement.scrollLeft,
        y: rect_2.top + rect_2.height / 2 + document.documentElement.scrollTop
    };

    const distance = Math.hypot(centre_2.x - centre_1.x, centre_2.y - centre_1.y);
    const angle = Math.atan2(centre_2.y - centre_1.y, centre_2.x - centre_1.x) * 180 / Math.PI;

    Object.assign(ligne[0].style, {
        width: `${distance}px`,
        transform: `rotate(${angle}deg)`,
        transformOrigin: "0% 50%",
        position: "absolute",
        top: `${centre_1.y}px`,
        left: `${centre_1.x}px`
    });
}

function lancer_le_jeu() {
    $(".élément-éphémère").remove();
    $("#carte").css("cursor", "pointer");

    const jeu_sélectionné = $("#choix-jeu").val();
    const dimension_sélectionnée = $("#choix-dimension").val() ?? null;

    let url = `./scripts/obtenir_image_aléatoire.php?zone=${jeu_sélectionné}&dimension=${dimension_sélectionnée}`;

    const fichier_image_aléatoire = $("#screenshot").attr("fichier_image_aléatoire");
    if (fichier_image_aléatoire) {
        url += `&exclure=${fichier_image_aléatoire}`;
    }

    $.getJSON(url, données => {
        const screenshot = $("#screenshot");
        screenshot.attr({
            "fichier_image_aléatoire": données.fichier,
            "src": "./images/chargement.gif"
        });

        const image = new Image();

        if (dimension_sélectionnée != null) {
            image.src = `./images/screenshots/${jeu_sélectionné}/screenshots_${dimension_sélectionnée}/${données.fichier}`;

            image.onload = () => {
                const nouvelle_taille = parseInt(dimension_sélectionnée);
                const décalage_x = (image.width - nouvelle_taille) / 2;
                const décalage_y = (image.height - nouvelle_taille) / 2;

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = canvas.height = nouvelle_taille;

                ctx.drawImage(image, décalage_x, décalage_y, nouvelle_taille, nouvelle_taille, 0, 0, nouvelle_taille, nouvelle_taille);

                screenshot.attr("src", canvas.toDataURL("image/webp"));
            };
        }
        else {
            image.src = `./images/screenshots/${jeu_sélectionné}/${données.fichier}`;

            image.onload = () => {
                screenshot.attr("src", image.src);
            };
        }

    }).fail((_, statut, erreur) => console.error("Erreur:", statut, erreur));

    $.getJSON(`./scripts/obtenir_nombre_de_fichiers.php?zone=${jeu_sélectionné}&dimension=${dimension_sélectionnée}`, réponse => {

        let message_html = "<strong>" + réponse.nombre_de_fichiers + "</strong> different locations possible with these parameters.";

        if (jeu_sélectionné.startsWith("hollow_knight_silksong_")) {
            message_html += " The screenshots are of poor quality, as they come from gameplay videos recorded during the demo presented at E3 2019.";
        }
        if (jeu_sélectionné.startsWith("hollow_knight_npc")) {
            message_html += " If an NPC is in more than one place in the game, indicate the place where he is most often.";
        }
        if (jeu_sélectionné.startsWith("hollow_knight_areas")) {
            message_html += " To get the maximum number of points, click on the center of the area.";
        }

        $("<p>", {
            class: "message élément-éphémère",
            html: message_html
        }).insertAfter("#jeu");
    }).fail((_, statut, erreur) => console.error("Erreur:", statut, erreur));
}

$(window).resize(() => {
    if ($("#carré").length) {
        const carte = $("#carte");
        const dimensions_carte = carte[0].getBoundingClientRect();

        const dimension_sélectionnée = $("#choix-dimension").val();
        const screenshot = $("#screenshot");
        const dimensions_screenshot = screenshot[0].getBoundingClientRect();

        const dimension_solution = $("#choix-dimension").attr("dimension-solution");
        const largeur = dimensions_screenshot.width * dimension_sélectionnée / dimension_solution;
        const hauteur = dimensions_screenshot.height * dimension_sélectionnée / dimension_solution;

        const positionner_marqueur = marqueur => {
            marqueur.css({
                left: carte.offset().left + Math.round(marqueur.attr("x") * (dimensions_carte.width / carte[0].naturalWidth)) + "px",
                top: carte.offset().top + Math.round(marqueur.attr("y") * (dimensions_carte.height / carte[0].naturalHeight)) + "px"
            });
        };

        positionner_marqueur($("#marqueur-réponse"));
        positionner_marqueur($("#marqueur-solution"));

        $("#carré").css({
            width: largeur + "px",
            height: hauteur + "px",
            top: screenshot.offset().top + dimensions_screenshot.width / 2 - largeur / 2 + "px",
            left: screenshot.offset().left + dimensions_screenshot.height / 2 - hauteur / 2 + "px"
        });

        tracer_une_ligne($("#ligne"), $("#marqueur-réponse"), $("#marqueur-solution"));
    }
});

const image = $("#carte");
const loupe = $("#loupe");
const image_zoom = $("#zoom");

const est_appareil_tactile = "ontouchstart" in window || navigator.maxTouchPoints > 0;

if (!est_appareil_tactile) {
    $.getJSON("./données/zones.json", données => {
        image.on("mousemove", e => {
            if (!$("#score").length) {
                const rect = image[0].getBoundingClientRect();
                const { clientX: x, clientY: y } = e;
                const { naturalWidth: largeur_naturelle, naturalHeight: hauteur_naturelle } = image[0];
                const { width: largeur_affichée, height: hauteur_affichée } = rect;

                const facteur_x = largeur_naturelle / largeur_affichée;
                const facteur_y = hauteur_naturelle / hauteur_affichée;

                const facteur_zoom = parseFloat(données[$("#choix-jeu").val()]["facteur_de_zoom"]);

                image_zoom.css({
                    width: largeur_naturelle * facteur_zoom + "px",
                    height: hauteur_naturelle * facteur_zoom + "px",
                    left: -(x - rect.left) * facteur_x * facteur_zoom + loupe.width() / 2 + "px",
                    top: -(y - rect.top) * facteur_y * facteur_zoom + loupe.height() / 2 + "px"
                });

                loupe.css({
                    left: x - rect.left - loupe.width() / 2 + "px",
                    top: y - rect.top - loupe.height() / 2 + "px",
                    display: facteur_zoom !== 0 ? "block" : "none"
                });
            }
        });
    });

    image.on("mouseleave", () => loupe.css("display", "none"));
}

function mettre_à_jour_les_scores() {
    const clés_screenshots = Object.keys(localStorage)
        .filter(clé => clé.startsWith("screenshot_") && !clé.endsWith("_timestamp"));

    if (clés_screenshots.length > 0) {
        $("#statistiques .nombre-de-parties .valeur").text(clés_screenshots.length);
    }

    const scores = clés_screenshots.map(clé => parseFloat(localStorage.getItem(clé)))
        .filter(valeur => !isNaN(valeur));

    const total_scores = scores.reduce((total, valeur) => total + valeur, 0);
    const moyenne = scores.length ? (total_scores / scores.length).toFixed(1) : "0.0";

    if (moyenne !== "0.0") {
        $("#statistiques .moyenne .valeur").text(moyenne);
    }
    if (total_scores !== 0) {
        $("#statistiques .total .valeur").text(total_scores);
    }

    $.getJSON("./données/zones.json", données => {
        let nombre_fichiers = 0;
        const requêtes = [];

        if (typeof données === 'object' && données !== null) {
            Object.values(données).forEach(zone => {
                if (zone.dimensions?.associées_aux_difficultés) {
                    zone.dimensions.associées_aux_difficultés.forEach(dimension => {
                        requêtes.push($.getJSON(`./scripts/obtenir_nombre_de_fichiers.php?zone=${zone.id}&dimension=${dimension}`, réponse => {
                            nombre_fichiers += réponse.nombre_de_fichiers;
                        }));
                    });
                } else {
                    requêtes.push($.getJSON(`./scripts/obtenir_nombre_de_fichiers.php?zone=${zone.id}`, réponse => {
                        nombre_fichiers += réponse.nombre_de_fichiers;
                    }));
                }
            });
        } else {
            console.error("Les données reçues ne sont pas un objet valide.");
        }

        $.when(...requêtes).then(() => {
            const nombre_fichiers_formaté = nombre_fichiers.toLocaleString('fr-FR').replace(/\s/g, ".");
            $("#statistiques .nombre-de-parties .quotient").text(nombre_fichiers_formaté);
            $("#statistiques .total .quotient").text((nombre_fichiers * 100).toLocaleString('fr-FR').replace(/\s/g, "."));
        });
    });

    if (clés_screenshots.length > 30) {
        const clés_triées = clés_screenshots
            .map(clé => ({ clé, horodatage: localStorage.getItem(clé + "_timestamp") || 0 }))
            .sort((a, b) => b.horodatage - a.horodatage)
            .slice(0, 30)
            .map(item => item.clé);

        const derniers_scores = clés_triées.map(clé => parseFloat(localStorage.getItem(clé)))
            .filter(valeur => !isNaN(valeur));

        const total_derniers_scores = derniers_scores.reduce((total, valeur) => total + valeur, 0);
        const moyenne_derniers_scores = derniers_scores.length ? (total_derniers_scores / derniers_scores.length).toFixed(1) : "0.0";

        if (!$("#statistiques-30").length) {
            $("<div>", {
                id: "statistiques-30",
                html: "<div class='moyenne'><p><span class='valeur'>0</span><small>/<span class='quotient'>100</span></small></p><p class='label'>Average score</p></div><div class='total'><p><span class='valeur'>0</span><small>/<span class='quotient'>3000</span></small></p><p class='label'>Total score</p></div>"
            }).insertAfter("#statistiques-container #statistiques");

            $("<p>", {
                html: "For your last 30 games:"
            }).insertAfter("#statistiques-container #statistiques");
        }

        setTimeout(() => {
            if (moyenne_derniers_scores !== "0.0") {
                $("#statistiques-30 .moyenne .valeur").text(moyenne_derniers_scores);
            }
            if (total_derniers_scores !== 0) {
                $("#statistiques-30 .total .valeur").text(total_derniers_scores);
            }
        }, 0);
    }
}