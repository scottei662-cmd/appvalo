// On importe useEffect (pour lancer des actions au chargement, comme allumer la lumière en entrant dans une pièce) et useState (pour se souvenir de choses, comme un carnet de notes)
import { useEffect, useState } from "react";
// On importe useNavigate pour pouvoir changer de page — comme avoir une télécommande pour zapper entre les chaînes
import { useNavigate } from "react-router-dom";
// On importe les fonctions qui parlent au serveur : récupérer les agents, maps, armes, et créer un build — comme des messagers qui vont chercher et envoyer des infos
import { getAgents, getMaps, getWeapons, createBuild } from "../lib/api";
// On importe useSession pour savoir qui est connecté — comme vérifier la carte d'identité du visiteur
import { useSession } from "../lib/auth-client";

// Le type d'un agent : id, nom et portrait — comme une petite carte de collection avec photo
type Agent = { id: string; name: string; portrait: string };
// Le type d'une map : juste un id et un nom — comme une étiquette simple
type MapItem = { id: string; name: string };
// Le type d'une arme : id, nom et image — comme une vignette dans un album de stickers
type Weapon = { id: string; name: string; image: string };

// Les 3 options de style de jeu — comme les 3 modes d'un jeu : attaque, défense, ou les deux
const gameplayOptions = ["Aggressive", "Defensive", "Polyvalent"];
// La traduction en français de chaque style — comme un dictionnaire anglais-français
const gameplayLabels: Record<string, string> = {
    // "Aggressive" devient "Agressif" en français
    Aggressive: "Agressif",
    // "Defensive" devient "Défensif" en français
    Defensive: "Défensif",
    // "Polyvalent" reste pareil
    Polyvalent: "Polyvalent",
};

/**
 * @description Page de creation d'un nouveau build
 * @returns JSX de la page creation build
 */
// On déclare la fonction principale de la page — comme ouvrir un formulaire vierge pour créer quelque chose de nouveau
function BuildCreatePage() {
    // On prépare la fonction pour changer de page — comme avoir un GPS pour aller ailleurs
    const navigate = useNavigate();
    // On récupère la session de l'utilisateur connecté — comme regarder qui tient le stylo
    const { data: session } = useSession();

    // Tiroir pour stocker la liste de tous les agents — comme une boîte vide prête à recevoir des figurines
    const [agents, setAgents] = useState<Agent[]>([]);
    // Tiroir pour stocker la liste de toutes les maps — comme une étagère vide pour les cartes de terrain
    const [allMaps, setAllMaps] = useState<MapItem[]>([]);
    // Tiroir pour stocker la liste de toutes les armes — comme un coffre vide pour les armes
    const [allWeapons, setAllWeapons] = useState<Weapon[]>([]);

    // Tiroir pour le nom du build qu'on va créer — comme un champ "titre" vide sur un formulaire
    const [name, setName] = useState("");
    // Tiroir pour l'agent choisi (son id) — comme une case vide "agent sélectionné" sur le formulaire
    const [agentId, setAgentId] = useState("");
    // Tiroir pour le style de jeu, par défaut "Aggressive" — comme un bouton déjà appuyé sur "attaque"
    const [gameplay, setGameplay] = useState("Aggressive");
    // Tiroir pour les maps sélectionnées — comme un panier de courses vide
    const [selectedMaps, setSelectedMaps] = useState<string[]>([]);
    // Tiroir pour les armes sélectionnées — comme un étui à armes vide
    const [selectedWeapons, setSelectedWeapons] = useState<string[]>([]);
    // Tiroir pour les notes libres — comme un bloc-notes vierge
    const [notes, setNotes] = useState("");
    // Indicateur de chargement (en train d'envoyer ou pas) — comme un voyant "occupé" sur une porte
    const [loading, setLoading] = useState(false);
    // Tiroir pour le message d'erreur — comme un panneau d'avertissement, vide quand tout va bien
    const [error, setError] = useState("");

    // Au chargement de la page, on vérifie la connexion et on récupère les données — comme préparer le matériel avant de commencer
    useEffect(() => {
        // Si l'utilisateur n'est pas connecté, on le renvoie à la page de connexion — comme refuser l'entrée à quelqu'un sans badge
        if (!session?.user) { navigate("/login"); return; }
        // On va chercher tous les agents disponibles — comme aller chercher le catalogue des personnages
        getAgents().then(setAgents).catch(console.error);
        // On va chercher toutes les maps disponibles — comme aller chercher le catalogue des terrains
        getMaps().then(setAllMaps).catch(console.error);
        // On va chercher toutes les armes disponibles — comme aller chercher le catalogue des armes
        getWeapons().then(setAllWeapons).catch(console.error);
    // Ce code se relance si la session ou la navigation change — comme revérifier l'entrée si le visiteur change
    }, [session, navigate]);

    // On cherche l'agent complet qui correspond à l'id sélectionné — comme retrouver la figurine correspondant au numéro choisi
    const selectedAgent = agents.find((a) => a.id === agentId);

    // Fonction appelée quand on clique sur "Créer le Build" — comme appuyer sur le bouton "Envoyer" d'un formulaire
    const handleSubmit = async () => {
        // Si le nom ou l'agent manque, on affiche un message d'erreur — comme dire "tu as oublié de remplir des cases obligatoires"
        if (!name || !agentId) {
            // On met le message d'erreur dans le tiroir — comme écrire un avertissement sur le formulaire
            setError("Nom et agent sont requis");
            // On arrête là, on n'envoie rien — comme refuser un formulaire incomplet
            return;
        }
        // On allume le voyant "chargement" — comme afficher "envoi en cours..."
        setLoading(true);
        // On efface l'ancien message d'erreur — comme nettoyer le tableau d'erreurs
        setError("");
        // On essaie d'envoyer le build au serveur — comme poster une lettre
        try {
            // On appelle la fonction de création avec toutes les données du formulaire — comme remplir et envoyer le formulaire
            await createBuild({
                // Le nom du build
                name,
                // Le style de jeu choisi
                gameplay,
                // L'identifiant de l'agent sélectionné
                agentId,
                // La liste des identifiants des maps sélectionnées
                mapIds: selectedMaps,
                // La liste des identifiants des armes sélectionnées
                weaponIds: selectedWeapons,
                // Les notes, ou rien si c'est vide — comme laisser un champ optionnel vide
                notes: notes || undefined,
            });
            // Si ça marche, on retourne à la page des builds — comme retourner dans la bibliothèque après avoir ajouté un livre
            navigate("/builds");
        // Si ça rate, on récupère l'erreur — comme attraper un ballon qui nous est renvoyé
        } catch (err: unknown) {
            // On affiche le message d'erreur, ou un message par défaut si on ne sait pas ce qui s'est passé
            setError(err instanceof Error ? err.message : "Erreur lors de la création");
        // Dans tous les cas (succès ou échec), on éteint le voyant "chargement" — comme éteindre la lumière "occupé"
        } finally {
            // On remet le chargement à faux — le processus est terminé
            setLoading(false);
        }
    };

    // Fonction pour ajouter ou retirer une map de la sélection — comme un interrupteur on/off pour chaque map
    const toggleMap = (id: string) => {
        // Si la map est déjà dans la liste, on la retire ; sinon on l'ajoute — comme mettre ou enlever un objet du panier
        setSelectedMaps((prev) => prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]);
    };

    // Fonction pour ajouter ou retirer une arme de la sélection — comme un interrupteur on/off pour chaque arme
    const toggleWeapon = (id: string) => {
        // Si l'arme est déjà dans la liste, on la retire ; sinon on l'ajoute — comme prendre ou reposer un outil
        setSelectedWeapons((prev) => prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]);
    };

    // On retourne le contenu visuel de la page — comme dessiner la page sur l'écran
    return (
        // Conteneur principal qui prend toute la hauteur avec un fond beige — comme une grande feuille de papier
        <div className="min-h-screen bg-beige">
            {/* En-tête avec le titre et le bouton retour */}
            <div className="px-[41px] pt-[64px] pb-0">
                {/* Bouton retour qui ramène à la page précédente — comme un bouton "reculer" dans un navigateur */}
                <button onClick={() => navigate(-1)} className="flex items-center gap-2">
                    {/* Petite flèche triangulaire vers la gauche faite en CSS — comme un symbole de retour */}
                    <div className="w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-r-[13px] border-r-[#0f1923]" />
                    {/* Titre "NOUVEAU BUILD" en gros, gras et italique — comme l'enseigne d'un atelier de création */}
                    <h1 className="font-oswald text-[36px] font-bold italic uppercase tracking-[4px] text-[#0f1923]" style={{ lineHeight: "0.56" }}>
                        NOUVEAU BUILD
                    </h1>
                </button>
            </div>

            {/* Carte du formulaire — comme un formulaire papier dans un joli cadre */}
            <div className="mx-[23px] mt-[30px]">
                {/* Conteneur de la carte avec fond clair, bordure et coins arrondis — comme une fiche à remplir */}
                <div className="bg-[#f8f8f8] rounded-[5px] border border-[#1e1e1e] w-full overflow-hidden">
                    {/* Image d'en-tête qui montre l'agent sélectionné — comme un aperçu en haut de la fiche */}
                    <div className="relative w-full h-[122px] overflow-hidden rounded-t-[4px] border-b border-[#1e1e1e] bg-[#2a343e]">
                        {/* Si un agent est sélectionné, on affiche son portrait — comme mettre une photo dans un cadre vide */}
                        {selectedAgent && (
                            // Image portrait de l'agent sélectionné — comme la photo en couverture d'un magazine
                            <img src={selectedAgent.portrait} alt={selectedAgent.name} className="w-full h-full object-cover" />
                        )}
                    </div>

                    {/* Section nom du build — comme le champ "titre" d'un formulaire */}
                    <div className="px-[16px] mt-[16px]">
                        {/* Étiquette "Nom du build" — comme le texte au-dessus d'une case à remplir */}
                        <h3 className="font-rajdhani text-[14px] font-bold text-black ml-[5px]" style={{ lineHeight: "1.14" }}>
                            Nom du build
                        </h3>
                        {/* Champ de saisie pour le nom — comme une case vide où on écrit au clavier */}
                        <input
                            // C'est un champ texte classique
                            type="text"
                            // La valeur affichée est celle du tiroir "name"
                            value={name}
                            // Quand on tape, on met à jour le tiroir — comme écrire en temps réel
                            onChange={(e) => setName(e.target.value)}
                            // Texte d'exemple grisé — comme un modèle pré-imprimé dans la case
                            placeholder="Ex: Jett Haven Def"
                            // Style du champ : bordure, coins arrondis — comme une jolie case de formulaire
                            className="w-full h-[30px] bg-[#f8f8f8] border border-[#2a343e] rounded-[5px] px-[8px] mt-[6px] font-rajdhani text-[14px] text-[#2a343e] focus:outline-none focus:border-val-red"
                        />
                    </div>

                    {/* Ligne de séparation — comme un trait de crayon entre deux sections */}
                    <div className="h-[1px] bg-[#1e1e1e] mx-[26px] my-[12px]" />

                    {/* Section sélection de l'agent — comme un catalogue de personnages à choisir */}
                    <div className="px-[16px] mb-[10px]">
                        {/* Titre "Agent" — comme l'en-tête de la section */}
                        <h3 className="font-rajdhani text-[14px] font-bold text-black ml-[5px]" style={{ lineHeight: "1.14" }}>
                            Agent
                        </h3>
                        {/* Grille de petites images d'agents cliquables — comme un mur de photos d'identité */}
                        <div className="flex gap-[6px] flex-wrap mt-[8px]">
                            {/* On parcourt tous les agents et on crée un bouton image pour chacun — comme afficher toutes les cartes du jeu */}
                            {agents.map((agent) => (
                                // Bouton carré avec le portrait de l'agent — comme une carte cliquable
                                <button
                                    // Clé unique pour React — comme un numéro sur chaque carte
                                    key={agent.id}
                                    // Au clic, on sélectionne cet agent — comme poser le doigt sur la carte choisie
                                    onClick={() => setAgentId(agent.id)}
                                    // Style : bordure rouge si sélectionné, grise sinon — comme un cadre qui s'illumine quand on le touche
                                    className={`w-[40px] h-[40px] rounded-[6px] overflow-hidden border-2 transition-colors ${
                                        agentId === agent.id ? "border-val-red" : "border-[#2a343e]"
                                    }`}
                                >
                                    {/* Image portrait de l'agent — comme la photo sur la carte */}
                                    <img src={agent.portrait} alt={agent.name} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Ligne de séparation — comme un trait horizontal */}
                    <div className="h-[1px] bg-[#1e1e1e] mx-[26px] my-[10px]" />

                    {/* Section style de jeu — comme choisir son mode de combat */}
                    <div className="px-[16px] mb-[10px]">
                        {/* Titre "Style de jeu" — comme le nom de la section */}
                        <h3 className="font-rajdhani text-[14px] font-bold text-black ml-[5px]" style={{ lineHeight: "1.14" }}>
                            Style de jeu
                        </h3>
                        {/* Conteneur des 3 boutons de style — comme 3 boutons radio visuels côte à côte */}
                        <div className="flex gap-[8px] mt-[8px]">
                            {/* On parcourt les 3 options et on crée un bouton pour chacune — comme 3 interrupteurs */}
                            {gameplayOptions.map((g) => (
                                // Bouton pour chaque style de jeu
                                <button
                                    // Clé unique pour chaque option
                                    key={g}
                                    // Au clic, on sélectionne ce style — comme appuyer sur un bouton de mode
                                    onClick={() => setGameplay(g)}
                                    // Style : rouge si sélectionné, clair sinon — comme un voyant qui s'allume
                                    className={`h-[22px] px-[10px] rounded-[4px] font-rajdhani text-[12px] font-medium border transition-colors ${
                                        gameplay === g
                                            ? "bg-val-red text-[#f8f8f8] border-val-red"
                                            : "bg-[#f8f8f8] text-[#2a343e] border-[#2a343e]"
                                    }`}
                                >
                                    {/* On affiche le texte en français — comme la traduction sur le bouton */}
                                    {gameplayLabels[g]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Ligne de séparation */}
                    <div className="h-[1px] bg-[#1e1e1e] mx-[26px] my-[10px]" />

                    {/* Section maps préférées — comme une liste de terrains favoris à cocher */}
                    <div className="px-[16px] mb-[10px]">
                        {/* Titre de la section — comme l'en-tête du rayon "terrains" */}
                        <h3 className="font-rajdhani text-[14px] font-bold text-black ml-[5px]" style={{ lineHeight: "1.14" }}>
                            Maps Preferees
                        </h3>
                        {/* Grille de badges de maps cliquables — comme des étiquettes qu'on peut activer ou désactiver */}
                        <div className="flex gap-[5px] flex-wrap mt-[8px]">
                            {/* On parcourt toutes les maps et on crée un badge cliquable pour chacune */}
                            {allMaps.map((map) => (
                                // Bouton badge pour chaque map — comme un bouton toggle
                                <button
                                    // Clé unique pour chaque map
                                    key={map.id}
                                    // Au clic, on bascule la sélection de cette map — comme activer/désactiver un interrupteur
                                    onClick={() => toggleMap(map.id)}
                                    // Style : fond sombre si sélectionné, clair sinon — comme un bouton qui change de couleur
                                    className={`h-[22px] px-[10px] rounded-[4px] font-rajdhani text-[12px] font-medium border transition-colors ${
                                        selectedMaps.includes(map.id)
                                            ? "bg-[#2a343e] text-[#f8f8f8] border-[#2a343e]"
                                            : "bg-[#f8f8f8] text-[#2a343e] border-[#2a343e]"
                                    }`}
                                >
                                    {/* Nom de la map affiché sur le badge */}
                                    {map.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Ligne de séparation */}
                    <div className="h-[1px] bg-[#1e1e1e] mx-[26px] my-[10px]" />

                    {/* Section équipement recommandé (armes) — comme un présentoir d'armes à sélectionner */}
                    <div className="px-[16px] mb-[10px]">
                        {/* Titre de la section armes */}
                        <h3 className="font-rajdhani text-[14px] font-bold text-black ml-[5px]" style={{ lineHeight: "1.14" }}>
                            Equipement Recommande
                        </h3>
                        {/* Grille de vignettes d'armes cliquables — comme des cartes dans un album */}
                        <div className="flex gap-[6px] flex-wrap mt-[8px]">
                            {/* On parcourt toutes les armes et on crée une vignette cliquable pour chacune */}
                            {allWeapons.map((w) => (
                                // Bouton vignette pour chaque arme — comme une carte qu'on peut retourner
                                <button
                                    // Clé unique pour chaque arme
                                    key={w.id}
                                    // Au clic, on bascule la sélection de cette arme — comme prendre ou reposer un outil
                                    onClick={() => toggleWeapon(w.id)}
                                    // Style : bordure rouge si sélectionné, grise sinon — comme un cadre lumineux
                                    className={`w-[70px] h-[36px] rounded-[6px] border p-[3px] transition-colors ${
                                        selectedWeapons.includes(w.id)
                                            ? "border-val-red bg-val-red/10"
                                            : "border-[#2a343e] bg-transparent"
                                    }`}
                                >
                                    {/* Image de l'arme dans la vignette — comme la photo sur une carte */}
                                    <img src={w.image} alt={w.name} className="w-full h-full object-contain" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Ligne de séparation */}
                    <div className="h-[1px] bg-[#1e1e1e] mx-[26px] my-[10px]" />

                    {/* Section notes et stratégies — comme un carnet de tactiques à remplir */}
                    <div className="px-[16px] mb-[10px]">
                        {/* Titre "Notes & Strategies" — comme le titre du carnet */}
                        <h3 className="font-rajdhani text-[14px] font-bold text-[#0f1923] ml-[5px]" style={{ lineHeight: "1.14" }}>
                            Notes & Strategies
                        </h3>
                        {/* Zone de texte pour écrire les notes — comme un mini carnet de bord */}
                        <textarea
                            // La valeur affichée est celle du tiroir "notes"
                            value={notes}
                            // Quand on tape, on met à jour le tiroir — comme écrire en direct
                            onChange={(e) => setNotes(e.target.value)}
                            // Texte d'exemple grisé — comme un modèle pour inspirer
                            placeholder="Dash sur site A, Updraft sur caisse..."
                            // Style de la zone de texte : bordure, coins arrondis, petite police — comme un joli bloc-notes
                            className="w-full h-[60px] bg-[#f8f8f8] border border-[#2a343e] rounded-[6px] px-[6px] py-[5px] mt-[8px] font-rajdhani text-[11px] font-medium text-[#3c3a3a] resize-none focus:outline-none focus:border-val-red"
                        />
                    </div>

                    {/* Affichage du message d'erreur s'il y en a un — comme un panneau d'avertissement rouge */}
                    {error && (
                        // Texte d'erreur en rouge — comme un message d'alerte
                        <p className="px-[26px] font-rajdhani text-[13px] text-val-red mb-2">{error}</p>
                    )}

                    {/* Bouton de soumission "Créer le Build" — comme le gros bouton "Valider" en bas du formulaire */}
                    <div className="px-[26px] pb-[20px] pt-[6px]">
                        {/* Bouton principal de création — comme un bouton d'envoi */}
                        <button
                            // Au clic, on lance la création du build
                            onClick={handleSubmit}
                            // Désactivé pendant le chargement — comme griser un bouton pour empêcher de cliquer deux fois
                            disabled={loading}
                            // Style : fond rouge, texte blanc, semi-transparent si désactivé — comme un bouton d'action principal
                            className="w-full h-[36px] bg-val-red rounded-[5px] border-2 border-val-red flex items-center justify-center disabled:opacity-50"
                        >
                            {/* Texte du bouton qui change selon l'état de chargement — comme un message qui s'anime */}
                            <span className="font-oswald text-[14px] font-semibold text-[#f8f8f8]">
                                {/* Si en cours de chargement on affiche "Création...", sinon "Créer le Build" */}
                                {loading ? "Création..." : "Créer le Build"}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// On exporte la page pour que le reste de l'application puisse l'utiliser — comme mettre un formulaire à disposition dans le bureau
export default BuildCreatePage;
