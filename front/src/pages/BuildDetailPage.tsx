// On importe useEffect (pour faire des actions au chargement, comme allumer la lumière en entrant dans une pièce) et useState (pour se souvenir de choses, comme un carnet de notes)
import { useEffect, useState } from "react";
// On importe useParams (pour lire l'adresse URL, comme lire le numéro sur une porte), useNavigate (pour changer de page, comme tourner une page de livre), et Link (pour créer un lien cliquable, comme un bouton d'ascenseur)
import { useParams, useNavigate, Link } from "react-router-dom";
// On importe les fonctions qui parlent au serveur : récupérer un build, le modifier, le supprimer, et récupérer les listes de maps, agents et armes — comme envoyer des lettres au bureau des informations
import { getBuild, updateBuild, deleteBuild, getMaps, getAgents, getWeapons } from "../lib/api";
// On importe useSession pour savoir qui est connecté — comme vérifier le badge d'identité du visiteur
import { useSession } from "../lib/auth-client";

// On définit la forme d'un Build — comme un formulaire avec des cases à remplir : id, nom, style de jeu, notes, agent, maps et armes
type Build = {
    // L'identifiant unique du build — comme un numéro de série
    id: string;
    // Le nom du build — comme le titre d'une recette
    name: string;
    // Le style de jeu (agressif, défensif...) — comme choisir entre attaque et défense au foot
    gameplay: string;
    // Les notes optionnelles — comme des petits mots sur un post-it, ou rien du tout
    notes: string | null;
    // L'identifiant de l'agent choisi — comme le numéro du joueur dans l'équipe
    agentId: string;
    // L'identifiant du créateur du build — comme savoir qui a écrit la recette
    userId: string;
    // Les infos de l'agent : id, nom, portrait et portrait en pied optionnel — comme la fiche d'identité d'un personnage
    agent: { id: string; name: string; portrait: string; fullPortrait?: string };
    // La liste des maps associées, chacune avec ses infos — comme la liste des terrains de jeu préférés
    maps: { map: { id: string; name: string } }[];
    // La liste des armes associées, chacune avec ses infos et image — comme la liste des outils dans une boîte à outils
    weapons: { weapon: { id: string; name: string; image: string } }[];
};

// Le type d'une map : juste un id et un nom — comme une étiquette sur une boîte
type MapItem = { id: string; name: string };
// Le type d'un agent : id, nom et portrait — comme une petite carte de collection
type AgentItem = { id: string; name: string; portrait: string };
// Le type d'une arme : id, nom et image — comme une vignette dans un album
type WeaponItem = { id: string; name: string; image: string };

// Les 3 options de style de jeu possibles — comme les 3 modes d'un ventilateur : fort, moyen, les deux
const gameplayOptions = ["Aggressive", "Defensive", "Polyvalent"];
// La traduction en français de chaque style — comme un dictionnaire anglais-français
const gameplayLabels: Record<string, string> = {
    // "Aggressive" se dit "Agressif" en français
    Aggressive: "Agressif",
    // "Defensive" se dit "Défensif" en français
    Defensive: "Défensif",
    // "Polyvalent" reste pareil en français
    Polyvalent: "Polyvalent",
};

// On déclare la fonction principale de la page — comme ouvrir le plan de construction d'une maison
function BuildDetailPage() {
    // On récupère l'id dans l'URL — comme lire le numéro de chambre sur la porte de l'hôtel
    const { id } = useParams();
    // On prépare la fonction pour changer de page — comme avoir une télécommande pour zapper
    const navigate = useNavigate();
    // On récupère la session de l'utilisateur connecté — comme regarder qui est assis sur la chaise
    const { data: session } = useSession();

    // On crée un tiroir pour stocker le build actuel, vide au début — comme un cadre photo vide
    const [build, setBuild] = useState<Build | null>(null);
    // On crée un tiroir pour toutes les maps disponibles — comme une étagère vide prête à recevoir des jeux
    const [allMaps, setAllMaps] = useState<MapItem[]>([]);
    // On crée un tiroir pour tous les agents disponibles — comme un casier vide pour ranger les figurines
    const [allAgents, setAllAgents] = useState<AgentItem[]>([]);
    // On crée un tiroir pour l'agent sélectionné (son id), vide au début — comme une place de parking réservée mais vide
    const [agentId, setAgentId] = useState("");
    // On crée un tiroir pour le style de jeu choisi, vide au début — comme un bouton radio pas encore appuyé
    const [gameplay, setGameplay] = useState("");
    // On crée un tiroir pour les notes, vide au début — comme un bloc-notes tout neuf
    const [notes, setNotes] = useState("");
    // On crée un tiroir pour les maps sélectionnées, liste vide au début — comme un panier de courses vide
    const [selectedMaps, setSelectedMaps] = useState<string[]>([]);
    // On crée un tiroir pour toutes les armes disponibles — comme un arsenal vide
    const [allWeapons, setAllWeapons] = useState<WeaponItem[]>([]);
    // On crée un tiroir pour les armes sélectionnées, liste vide au début — comme un étui à armes vide
    const [selectedWeapons, setSelectedWeapons] = useState<string[]>([]);
    // On crée un interrupteur pour savoir si le menu déroulant des agents est ouvert ou fermé — comme un store qu'on lève ou baisse
    const [agentDropdownOpen, setAgentDropdownOpen] = useState(false);
    // On crée un interrupteur pour savoir si la fenêtre popup des maps est ouverte — comme une porte qu'on ouvre ou ferme
    const [mapModalOpen, setMapModalOpen] = useState(false);
    // On crée un interrupteur pour savoir si la fenêtre popup des armes est ouverte — comme une vitrine qu'on ouvre ou ferme
    const [weaponModalOpen, setWeaponModalOpen] = useState(false);

    // Au chargement de la page (ou quand l'id change), on va chercher toutes les données — comme aller faire les courses au démarrage
    useEffect(() => {
        // Si on a bien un id dans l'URL — comme vérifier qu'on a bien l'adresse avant de partir
        if (id) {
            // On va chercher le build correspondant à cet id — comme commander un plat au restaurant par son numéro
            getBuild(id).then((data) => {
                // On range le build reçu dans son tiroir — comme poser le plat sur la table
                setBuild(data);
                // On met à jour l'agent sélectionné avec celui du build — comme pointer le bon joueur
                setAgentId(data.agentId);
                // On met à jour le style de jeu — comme régler le mode de jeu
                setGameplay(data.gameplay);
                // On met à jour les notes (ou une chaîne vide si y'en a pas) — comme lire le post-it ou constater qu'il est vide
                setNotes(data.notes || "");
                // On extrait les ids des maps du build et on les met dans le panier — comme cocher les maps déjà choisies
                setSelectedMaps(data.maps.map((m: any) => m.map.id));
                // On extrait les ids des armes du build et on les met dans l'étui — comme cocher les armes déjà choisies
                setSelectedWeapons(data.weapons.map((w: any) => w.weapon.id));
            // Si ça échoue, on affiche l'erreur dans la console — comme noter un problème dans un cahier de bord
            }).catch(console.error);
            // On va chercher la liste de toutes les maps et on les range — comme récupérer le catalogue des terrains
            getMaps().then(setAllMaps).catch(console.error);
            // On va chercher la liste de tous les agents et on les range — comme récupérer le catalogue des personnages
            getAgents().then(setAllAgents).catch(console.error);
            // On va chercher la liste de toutes les armes et on les range — comme récupérer le catalogue des armes
            getWeapons().then(setAllWeapons).catch(console.error);
        }
    // Ce code se relance seulement si l'id change — comme re-chercher seulement si on change de numéro de chambre
    }, [id]);

    // On cherche dans la liste des agents celui qui correspond à l'id sélectionné — comme retrouver un ami dans une foule par son nom
    const selectedAgent = allAgents.find((a) => a.id === agentId);

    // On vérifie si l'utilisateur connecté est bien le créateur du build — comme vérifier si c'est TON dessin ou celui de quelqu'un d'autre
    const isOwner = session?.user?.id === build?.userId;

    // Fonction pour mettre à jour le build quand on clique sur "Modifier" — comme sauvegarder ses modifications dans un document
    const handleUpdate = async () => {
        // Si pas d'id, on ne fait rien — comme ne pas envoyer une lettre sans adresse
        if (!id) return;
        // On essaie de mettre à jour — comme tenter d'enregistrer ses changements
        try {
            // On envoie les modifications au serveur — comme poster sa lettre avec les nouvelles infos
            await updateBuild(id, { agentId, gameplay, notes, mapIds: selectedMaps, weaponIds: selectedWeapons });
            // On retourne à la page des builds — comme retourner à la bibliothèque après avoir modifié un livre
            navigate("/builds");
        // Si ça rate, on note l'erreur — comme écrire le problème dans le cahier de bord
        } catch (err) { console.error(err); }
    };

    // Fonction pour supprimer le build quand on clique sur "Supprimer" — comme jeter un dessin à la poubelle
    const handleDelete = async () => {
        // Si pas d'id, on ne fait rien — comme ne pas chercher quelque chose qu'on ne connaît pas
        if (!id) return;
        // On essaie de supprimer — comme tenter d'effacer un fichier
        try {
            // On envoie l'ordre de suppression au serveur — comme dire au bibliothécaire de retirer le livre
            await deleteBuild(id);
            // On retourne à la page des builds — comme retourner voir les étagères
            navigate("/builds");
        // Si ça rate, on note l'erreur — comme noter que la suppression n'a pas marché
        } catch (err) { console.error(err); }
    };

    // Si le build n'est pas encore chargé, on affiche un écran de chargement — comme montrer un sablier pendant qu'on attend
    if (!build) {
        // On retourne un écran centré qui prend toute la hauteur — comme un rideau en attendant le spectacle
        return (
            // Conteneur plein écran avec fond beige et contenu centré — comme une scène vide avec un projecteur au milieu
            <div className="min-h-screen bg-beige flex items-center justify-center">
                {/* Petit cercle qui tourne — comme une roue de chargement, un moulin qui tourne */}
                <div className="w-8 h-8 border-2 border-val-red border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Si le build est chargé, on affiche la vraie page — comme lever le rideau sur le spectacle
    return (
        // Conteneur principal de la page avec fond beige — comme le cadre d'un tableau
        <div className="min-h-screen bg-beige">
            {/* Titre en haut — lien pour retourner à la liste des builds */}
            <div className="px-[41px] pt-[64px] pb-0">
                {/* Lien cliquable vers /builds avec une flèche et le texte "BUILDS" — comme un panneau de sortie */}
                <Link to="/builds" className="flex items-center gap-2">
                    {/* Petite flèche triangulaire pointant à gauche — comme une flèche de retour dessinée avec des bordures CSS */}
                    <div className="w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-r-[13px] border-r-[#0f1923]" />
                    {/* Texte "BUILDS" en grand, gras et italique — comme un titre de chapitre */}
                    <h1 className="font-oswald text-[36px] font-bold italic uppercase tracking-[4px] text-[#0f1923]" style={{ lineHeight: "0.56" }}>
                        BUILDS
                    </h1>
                </Link>
            </div>

            {/* Sous-titre "Tes créations" — comme un sous-chapitre */}
            <div className="px-[24px] pt-[40px] pb-[10px]">
                {/* Texte du sous-titre en gras — comme un petit panneau indicatif */}
                <h2 className="font-rajdhani text-[30px] font-bold text-[#2a343e]" style={{ lineHeight: "0.67" }}>
                    Tes créations
                </h2>
            </div>

            {/* Carte principale du build — comme une fiche de personnage dans un jeu de rôle */}
            <div className="px-[22px]">
                {/* Conteneur de la carte avec fond clair, bordure et coins arrondis — comme un cadre photo élégant */}
                <div className="bg-[#f8f8f8] rounded-[5px] border border-[#1e1e1e] w-full overflow-hidden">
                    {/* Image d'en-tête montrant l'agent — comme la photo en haut d'une carte de collection */}
                    <div className="relative w-full h-[122px] overflow-hidden rounded-t-[4px] border-b border-[#1e1e1e] bg-[#0f1923]">
                        {/* Portrait de l'agent sélectionné (ou celui du build par défaut) — comme la photo de profil */}
                        <img
                            // On utilise le portrait de l'agent sélectionné, ou celui du build si aucun n'est sélectionné
                            src={selectedAgent?.portrait || build.agent.portrait}
                            // Texte alternatif avec le nom de l'agent — pour les lecteurs d'écran, comme une description audio
                            alt={selectedAgent?.name || build.agent.name}
                            // L'image remplit l'espace en gardant ses proportions, alignée en haut — comme un poster bien cadré
                            className="w-full h-full object-contain object-top"
                        />
                        {/* Nom du build affiché en bas à gauche de l'image — comme une légende sous une photo */}
                        <span className="absolute bottom-[5px] left-[15px] font-rajdhani text-[12px] font-medium text-[#f8f8f8]" style={{ lineHeight: "1.33" }}>
                            {/* On affiche le nom du build — comme l'étiquette d'un produit */}
                            {build.name}
                        </span>
                    </div>

                    {/* Sélecteur d'agent sous forme de menu déroulant — comme un tiroir qu'on ouvre pour choisir */}
                    <div className="mx-[16px] mt-[16px] relative">
                        {/* Bouton principal du menu déroulant — comme le couvercle d'une boîte */}
                        <button
                            // C'est un bouton, pas un lien — pour des raisons d'accessibilité
                            type="button"
                            // Au clic, si on est le propriétaire, on ouvre/ferme le menu — comme basculer un interrupteur
                            onClick={() => isOwner && setAgentDropdownOpen(!agentDropdownOpen)}
                            // Style du bouton : largeur complète, bordure, coins arrondis — comme un joli bouton de télécommande
                            className="w-full h-[30px] flex items-center justify-between bg-[#f8f8f8] rounded-[5px] border border-[#2a343e] px-[8px]"
                        >
                            {/* Côté gauche : portrait miniature + nom de l'agent — comme un badge avec photo et nom */}
                            <div className="flex items-center gap-[8px]">
                                {/* Petite image de l'agent — comme une photo d'identité miniature */}
                                <img src={selectedAgent?.portrait || build.agent.portrait} alt="" className="w-[16px] h-[16px] rounded-sm" />
                                {/* Nom de l'agent en gras — comme le nom sur un badge */}
                                <span className="font-rajdhani text-[15px] font-bold text-[#2a343e]">
                                    {selectedAgent?.name || build.agent.name}
                                </span>
                            </div>
                            {/* Flèche de droite qui tourne quand le menu est ouvert — comme une flèche indicatrice de direction */}
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={`transition-transform ${agentDropdownOpen ? "rotate-90" : ""}`}>
                                {/* Dessin de la flèche en forme de chevron — comme un ">" */}
                                <path d="M8 5l5 5-5 5" stroke="#2a343e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>

                        {/* Si le menu déroulant est ouvert, on affiche la liste des agents — comme ouvrir un tiroir plein de cartes */}
                        {agentDropdownOpen && (
                            // Conteneur de la liste déroulante, positionné juste en dessous du bouton — comme un tiroir qui sort
                            <div className="absolute top-full left-0 right-0 mt-1 bg-[#f8f8f8] border border-[#2a343e] rounded-[5px] max-h-[200px] overflow-y-auto z-30 shadow-lg">
                                {/* On parcourt chaque agent et on crée un bouton pour chacun — comme étaler toutes les cartes sur la table */}
                                {allAgents.map((agent) => (
                                    // Bouton pour chaque agent dans la liste — comme une option dans un menu de restaurant
                                    <button
                                        // Clé unique pour React — comme un numéro de série pour chaque élément
                                        key={agent.id}
                                        // C'est un bouton, pas un lien
                                        type="button"
                                        // Au clic, on sélectionne cet agent et on ferme le menu — comme choisir un plat et fermer la carte
                                        onClick={() => { setAgentId(agent.id); setAgentDropdownOpen(false); }}
                                        // Style : surligné si c'est l'agent déjà sélectionné — comme un élément coché dans une liste
                                        className={`w-full flex items-center gap-2 px-[8px] py-[6px] hover:bg-beige-dark transition-colors ${agentId === agent.id ? "bg-beige-dark" : ""}`}
                                    >
                                        {/* Portrait miniature de l'agent — comme une vignette */}
                                        <img src={agent.portrait} alt="" className="w-[20px] h-[20px] rounded-sm" />
                                        {/* Nom de l'agent — comme l'étiquette à côté de la vignette */}
                                        <span className="font-rajdhani text-[14px] font-bold text-[#2a343e]">{agent.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Ligne de séparation horizontale — comme un trait tiré avec une règle pour séparer les sections */}
                    <div className="h-[1px] bg-[#1e1e1e] mx-[26px] my-[16px]" />

                    {/* Section style de jeu — comme choisir sa stratégie avant un match */}
                    <div className="px-[16px] mb-[10px]">
                        {/* Titre "Style de jeu" — comme l'en-tête d'une section de formulaire */}
                        <h3 className="font-rajdhani text-[14px] font-bold text-black ml-[5px]" style={{ lineHeight: "1.14" }}>
                            Style de jeu
                        </h3>
                        {/* Conteneur des 3 boutons de style — comme 3 interrupteurs côte à côte */}
                        <div className="flex gap-[8px] mt-[8px]">
                            {/* On parcourt les 3 options de style et on crée un bouton pour chacune — comme afficher 3 badges */}
                            {gameplayOptions.map((g) => (
                                // Bouton pour chaque style de jeu — comme un bouton radio visuel
                                <button
                                    // Clé unique basée sur la valeur du style
                                    key={g}
                                    // Au clic, si on est le propriétaire, on sélectionne ce style — comme appuyer sur un bouton de mode
                                    onClick={() => isOwner && setGameplay(g)}
                                    // Style : rouge si sélectionné, bordure grise sinon — comme un bouton qui s'allume quand on le presse
                                    className={`h-[22px] px-[10px] rounded-[4px] font-rajdhani text-[12px] font-medium border transition-colors ${
                                        gameplay === g
                                            ? "bg-val-red text-[#f8f8f8] border-val-red"
                                            : "bg-[#f8f8f8] text-[#2a343e] border-[#2a343e]"
                                    }`}
                                >
                                    {/* On affiche le label français du style — comme traduire le bouton */}
                                    {gameplayLabels[g]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Ligne de séparation — comme un trait de crayon entre deux sections */}
                    <div className="h-[1px] bg-[#1e1e1e] mx-[26px] my-[10px]" />

                    {/* Section maps préférées — comme une liste de terrains de jeu favoris */}
                    <div className="px-[16px] mb-[10px]">
                        {/* Titre de la section — comme l'étiquette d'un rayon dans un magasin */}
                        <h3 className="font-rajdhani text-[14px] font-bold text-[#0f1923] ml-[5px]" style={{ lineHeight: "1.14" }}>
                            Map Preferees
                        </h3>
                        {/* Conteneur des badges de maps sélectionnées + bouton ajouter — comme un bracelet avec des perles */}
                        <div className="flex gap-[5px] flex-wrap items-center mt-[8px]">
                            {/* On filtre les maps pour ne garder que celles sélectionnées, puis on crée un badge pour chacune — comme ne montrer que les perles choisies */}
                            {allMaps.filter((m) => selectedMaps.includes(m.id)).map((map) => (
                                // Badge d'une map sélectionnée — comme une étiquette sur un vêtement
                                <div key={map.id} className="h-[22px] px-[10px] rounded-[4px] font-rajdhani text-[12px] font-medium bg-[#2a343e] text-[#f8f8f8] flex items-center gap-1">
                                    {/* Nom de la map — comme le texte sur l'étiquette */}
                                    {map.name}
                                    {/* Si on est le propriétaire, on affiche un bouton X pour retirer cette map — comme un bouton pour enlever une perle */}
                                    {isOwner && (
                                        // Bouton de suppression (croix) — comme un petit bouton gomme
                                        <button onClick={() => setSelectedMaps((prev) => prev.filter((mid) => mid !== map.id))} className="ml-1 text-[#f8f8f8]/60 hover:text-white">
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                            {/* Si on est le propriétaire, on affiche le bouton pour ajouter des maps — comme un bouton "+" pour ajouter des perles */}
                            {isOwner && (
                                // Bouton "+ Ajouter" qui ouvre la popup des maps — comme une porte vers le magasin de maps
                                <button
                                    // Au clic, on ouvre la popup des maps
                                    onClick={() => setMapModalOpen(true)}
                                    // Style : bordure rouge, texte rouge — comme un bouton d'ajout visible
                                    className="h-[22px] px-[10px] rounded-[4px] font-rajdhani text-[12px] font-semibold text-val-red border border-val-red hover:bg-val-red/10 transition-colors"
                                >
                                    + Ajouter
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Ligne de séparation — comme une ligne dans un cahier */}
                    <div className="h-[1px] bg-[#1e1e1e] mx-[26px] my-[10px]" />

                    {/* Section notes et stratégies — comme un carnet de tactiques */}
                    <div className="px-[16px] mb-[10px]">
                        {/* Titre de la section notes — comme le titre d'un cahier */}
                        <h3 className="font-rajdhani text-[14px] font-bold text-[#0f1923] ml-[5px]" style={{ lineHeight: "1.14" }}>
                            Notes & Strategies
                        </h3>
                        {/* Conteneur de la zone de texte — comme un cadre autour du bloc-notes */}
                        <div className="mt-[8px]">
                            {/* Zone de texte pour écrire les notes — comme un mini carnet où on peut écrire */}
                            <textarea
                                // La valeur affichée est celle stockée dans le tiroir "notes"
                                value={notes}
                                // Quand on tape, on met à jour le tiroir — comme écrire en temps réel sur le carnet
                                onChange={(e) => setNotes(e.target.value)}
                                // Si on n'est pas le propriétaire, on ne peut que lire — comme un livre sous vitrine
                                readOnly={!isOwner}
                                // Texte d'exemple grisé quand c'est vide — comme un modèle pré-imprimé
                                placeholder="Dash sur site A, Updraft sur caisse, Line-ups smokes B, Op pour defendre mid..."
                                // Style de la zone de texte : bordure, coins arrondis, petite taille — comme un joli post-it
                                className="w-full h-[38px] bg-[#f8f8f8] border border-[#2a343e] rounded-[6px] px-[6px] py-[5px] font-rajdhani text-[11px] font-medium text-[#3c3a3a] resize-none focus:outline-none focus:border-val-red"
                                // Espacement entre les lignes du texte
                                style={{ lineHeight: "1.36" }}
                            />
                        </div>
                    </div>

                    {/* Ligne de séparation — comme un trait dans un formulaire */}
                    <div className="h-[1px] bg-[#1e1e1e] mx-[26px] my-[10px]" />

                    {/* Section équipement recommandé (armes) — comme une vitrine d'armes */}
                    <div className="px-[16px] mb-[16px]">
                        {/* Titre de la section armes — comme l'enseigne d'un magasin d'armes */}
                        <h3 className="font-rajdhani text-[14px] font-bold text-[#0f1923] ml-[5px]" style={{ lineHeight: "1.14" }}>
                            Equipement Recommande
                        </h3>
                        {/* Conteneur des vignettes d'armes — comme un présentoir avec des images */}
                        <div className="flex gap-[6px] flex-wrap items-center mt-[8px]">
                            {/* On filtre pour ne garder que les armes sélectionnées et on crée une vignette pour chacune — comme exposer les armes choisies */}
                            {allWeapons.filter((w) => selectedWeapons.includes(w.id)).map((w) => (
                                // Vignette d'une arme sélectionnée — comme une petite carte avec l'image de l'arme
                                <div key={w.id} className="relative w-[70px] h-[36px] rounded-[6px] border border-[#2a343e] p-[3px]">
                                    {/* Image de l'arme — comme la photo sur la carte */}
                                    <img src={w.image} alt={w.name} className="w-full h-full object-contain" />
                                    {/* Si on est le propriétaire, bouton rouge pour retirer l'arme — comme un bouton "enlever" sur un autocollant */}
                                    {isOwner && (
                                        // Bouton rond rouge avec une croix — comme un gros bouton supprimer
                                        <button
                                            // Au clic, on retire cette arme de la sélection
                                            onClick={() => setSelectedWeapons((prev) => prev.filter((wid) => wid !== w.id))}
                                            // Style : petit cercle rouge en haut à droite — comme un badge de notification
                                            className="absolute -top-2 -right-2 w-5 h-5 bg-val-red rounded-full flex items-center justify-center text-white text-[12px] font-bold"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                            {/* Si on est le propriétaire, bouton pour ajouter des armes — comme un emplacement vide avec un "+" */}
                            {isOwner && (
                                // Bouton "+" en pointillés pour ajouter une arme — comme une place libre dans le présentoir
                                <button
                                    // Au clic, on ouvre la popup des armes
                                    onClick={() => setWeaponModalOpen(true)}
                                    // Style : bordure en pointillés rouges — comme un cadre en attente d'être rempli
                                    className="w-[70px] h-[36px] rounded-[6px] border border-val-red border-dashed flex items-center justify-center font-rajdhani text-[12px] font-semibold text-val-red hover:bg-val-red/10 transition-colors"
                                >
                                    +
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Boutons Modifier et Supprimer — visibles seulement si on est le propriétaire */}
                    {isOwner && (
                        // Conteneur des deux boutons d'action — comme deux gros boutons en bas d'un formulaire
                        <div className="px-[26px] pb-[20px] flex flex-col gap-[10px]">
                            {/* Bouton "Modifier le Build" — rouge, comme un bouton de sauvegarde important */}
                            <button
                                // Au clic, on lance la mise à jour — comme appuyer sur "Enregistrer"
                                onClick={handleUpdate}
                                // Style : fond rouge, texte blanc — comme un bouton d'action principal
                                className="w-full h-[28px] bg-val-red rounded-[5px] border-2 border-val-red flex items-center justify-center"
                            >
                                {/* Texte du bouton — comme l'inscription sur un bouton physique */}
                                <span className="font-oswald text-[12px] font-semibold text-[#f8f8f8]" style={{ lineHeight: "1.25" }}>
                                    Modifier le Build
                                </span>
                            </button>
                            {/* Bouton "Supprimer le Build" — clair, comme un bouton secondaire moins visible */}
                            <button
                                // Au clic, on lance la suppression — comme appuyer sur "Supprimer"
                                onClick={handleDelete}
                                // Style : fond clair, bordure grise — comme un bouton d'action secondaire
                                className="w-full h-[28px] bg-[#f8f8f8] rounded-[5px] border border-[#2a343e] flex items-center justify-center"
                            >
                                {/* Texte du bouton — comme l'étiquette d'avertissement */}
                                <span className="font-oswald text-[12px] font-semibold text-[#2a343e]" style={{ lineHeight: "1.25" }}>
                                    Supprimer le Build
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ===== POPUP (MODAL) POUR CHOISIR LES MAPS ===== */}
            {/* Si la popup des maps est ouverte, on l'affiche — comme ouvrir une fenêtre par-dessus tout */}
            {mapModalOpen && (
                // Fond sombre semi-transparent qui couvre tout l'écran — comme un voile devant la scène
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center animate-fade-in" onClick={() => setMapModalOpen(false)}>
                    {/* Boîte blanche de la popup — comme une petite fenêtre qui flotte au milieu */}
                    <div className="bg-[#f8f8f8] rounded-xl w-[90%] max-w-[360px] max-h-[70vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        {/* En-tête de la popup avec titre et bouton fermer — comme la barre de titre d'une fenêtre */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a343e]">
                            {/* Titre "Ajouter des maps" — comme le nom de la fenêtre */}
                            <h3 className="font-rajdhani text-[18px] font-bold text-[#0f1923]">Ajouter des maps</h3>
                            {/* Bouton fermer (croix) — comme le X en haut à droite d'une fenêtre */}
                            <button onClick={() => setMapModalOpen(false)} className="text-[#0f1923]/50 hover:text-[#0f1923] text-[20px]">×</button>
                        </div>
                        {/* Corps de la popup avec la liste des maps scrollable — comme le contenu de la fenêtre */}
                        <div className="p-4 overflow-y-auto max-h-[55vh] flex flex-col gap-2">
                            {/* On parcourt toutes les maps et on crée un bouton pour chacune — comme afficher toutes les options */}
                            {allMaps.map((map) => (
                                // Bouton pour chaque map — on peut la sélectionner ou la désélectionner — comme cocher/décocher une case
                                <button
                                    // Clé unique pour chaque map
                                    key={map.id}
                                    // Au clic, on ajoute ou retire la map de la sélection — comme basculer une case à cocher
                                    onClick={() => setSelectedMaps((prev) => prev.includes(map.id) ? prev.filter((mid) => mid !== map.id) : [...prev, map.id])}
                                    // Style : fond sombre si sélectionné, blanc sinon — comme un bouton qui change de couleur quand il est activé
                                    className={`w-full h-[40px] rounded-lg border px-4 flex items-center justify-between font-rajdhani text-[14px] font-bold transition-colors ${
                                        selectedMaps.includes(map.id)
                                            ? "bg-[#2a343e] text-[#f8f8f8] border-[#2a343e]"
                                            : "bg-white text-[#2a343e] border-[#2a343e]"
                                    }`}
                                >
                                    {/* Nom de la map — comme le texte sur le bouton */}
                                    {map.name}
                                    {/* Si la map est sélectionnée, on affiche une coche — comme un symbole de validation */}
                                    {selectedMaps.includes(map.id) && <span>✓</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ===== POPUP (MODAL) POUR CHOISIR LES ARMES ===== */}
            {/* Si la popup des armes est ouverte, on l'affiche — comme ouvrir la vitrine des armes */}
            {weaponModalOpen && (
                // Fond sombre semi-transparent qui couvre tout l'écran — comme un rideau sombre
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center animate-fade-in" onClick={() => setWeaponModalOpen(false)}>
                    {/* Boîte blanche de la popup — comme une vitrine flottante */}
                    <div className="bg-[#f8f8f8] rounded-xl w-[90%] max-w-[360px] max-h-[70vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        {/* En-tête de la popup avec titre et bouton fermer — comme le haut de la vitrine */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a343e]">
                            {/* Titre "Ajouter des armes" — comme l'enseigne de la vitrine */}
                            <h3 className="font-rajdhani text-[18px] font-bold text-[#0f1923]">Ajouter des armes</h3>
                            {/* Bouton fermer (croix) — comme le X pour fermer la vitrine */}
                            <button onClick={() => setWeaponModalOpen(false)} className="text-[#0f1923]/50 hover:text-[#0f1923] text-[20px]">×</button>
                        </div>
                        {/* Corps de la popup avec les vignettes d'armes — comme le contenu de la vitrine */}
                        <div className="p-4 overflow-y-auto max-h-[55vh] flex flex-wrap gap-3 justify-center">
                            {/* On parcourt toutes les armes et on crée une vignette cliquable pour chacune — comme des cartes à collectionner */}
                            {allWeapons.map((w) => (
                                // Bouton vignette pour chaque arme — comme une carte qu'on retourne
                                <button
                                    // Clé unique pour chaque arme
                                    key={w.id}
                                    // Au clic, on ajoute ou retire l'arme — comme prendre ou reposer une carte
                                    onClick={() => setSelectedWeapons((prev) => prev.includes(w.id) ? prev.filter((wid) => wid !== w.id) : [...prev, w.id])}
                                    // Style : bordure rouge si sélectionné, grise sinon — comme un cadre lumineux autour de la carte choisie
                                    className={`w-[90px] h-[50px] rounded-lg border p-1 transition-colors ${
                                        selectedWeapons.includes(w.id)
                                            ? "border-val-red bg-val-red/10"
                                            : "border-[#2a343e] bg-white"
                                    }`}
                                >
                                    {/* Image de l'arme — comme la photo sur la carte */}
                                    <img src={w.image} alt={w.name} className="w-full h-full object-contain" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// On exporte la page pour que le reste de l'application puisse l'utiliser — comme mettre un livre à disposition dans la bibliothèque
export default BuildDetailPage;
