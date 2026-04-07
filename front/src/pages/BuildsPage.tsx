// On importe useEffect (pour exécuter du code au chargement, comme un réveil qui sonne une fois) et useState (pour stocker des infos qui changent, comme un tableau blanc)
import { useEffect, useState } from "react";
// On importe useNavigate (pour changer de page, comme marcher vers une autre pièce) et Link (pour créer des liens cliquables, comme des portes entre les pièces)
import { useNavigate, Link } from "react-router-dom";
// On importe la fonction getBuilds qui va chercher la liste des builds sur le serveur, comme envoyer un coursier chercher un colis
import { getBuilds } from "../lib/api";
// On importe useSession pour savoir si l'utilisateur est connecté, comme vérifier si quelqu'un a son badge d'entrée
import { useSession } from "../lib/auth-client";

// On définit la forme d'un Build (configuration de jeu), comme un formulaire vide à remplir
type Build = {
    // L'identifiant unique du build, comme un numéro de série
    id: string;
    // Le nom donné au build par le joueur, comme le titre d'une recette de cuisine
    name: string;
    // Le style de jeu (agressif, défensif...), comme la stratégie choisie avant un match
    gameplay: string;
    // L'agent associé au build avec son id, nom et portrait, comme le personnage choisi pour la recette
    agent: { id: string; name: string; portrait: string };
    // La liste des cartes (maps) associées au build, comme les terrains de jeu où cette stratégie marche bien
    maps: { map: { id: string; name: string } }[];
};

// Un dictionnaire qui traduit les styles de jeu anglais en français, comme un petit carnet de traduction
const gameplayLabels: Record<string, string> = {
    // "Aggressive" en anglais devient "Agressif" en français
    Aggressive: "Agressif",
    // "Defensive" en anglais devient "Défensif" en français
    Defensive: "Défensif",
    // "Polyvalent" reste pareil dans les deux langues
    Polyvalent: "Polyvalent",
};

// La fonction principale qui construit la page des builds, comme l'architecte qui dessine le plan d'une pièce
function BuildsPage() {
    // On crée un espace mémoire pour stocker la liste des builds (vide au début), comme un panier vide qu'on va remplir
    const [builds, setBuilds] = useState<Build[]>([]);
    // On prépare la fonction pour naviguer entre les pages, comme avoir une télécommande pour changer de chaîne
    const navigate = useNavigate();
    // On récupère les infos de session (si l'utilisateur est connecté), comme regarder si le badge est valide
    const { data: session } = useSession();

    // useEffect se lance au chargement ou quand session/navigate changent, comme un gardien qui vérifie le badge à l'entrée
    useEffect(() => {
        // Si l'utilisateur n'est pas connecté, on le redirige vers la page de connexion et on arrête là, comme un videur qui refuse l'entrée
        if (!session?.user) { navigate("/login"); return; }
        // Si l'utilisateur est connecté, on va chercher ses builds sur le serveur puis on les stocke ; si erreur, on l'affiche
        getBuilds().then(setBuilds).catch(console.error);
    // Le tableau [session, navigate] dit : "relance ce code si la session ou la navigation change"
    }, [session, navigate]);

    // On retourne le contenu visuel de la page, comme dessiner l'affiche finale
    return (
        // Le conteneur principal : prend tout l'écran avec un fond beige, comme une grande feuille de papier
        <div className="min-h-screen bg-beige">
            {/* Le titre "BUILDS" avec la flèche retour — en haut de page, style Oswald gras italique majuscule */}
            <div className="px-[41px] pt-[64px] pb-0">
                {/* Un lien cliquable vers la page d'accueil avec une flèche et le titre, comme un panneau de direction */}
                <Link to="/" className="flex items-center gap-2">
                    {/* Le petit triangle qui forme la flèche de retour, dessiné avec des bordures CSS comme un origami */}
                    <div className="w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-r-[13px] border-r-[#0f1923]" />
                    {/* Le titre "BUILDS" en grosses lettres, comme l'enseigne d'un magasin */}
                    <h1 className="font-oswald text-[36px] font-bold italic uppercase tracking-[4px] text-[#0f1923]" style={{ lineHeight: "0.56" }}>
                        BUILDS
                    </h1>
                </Link>
            </div>

            {/* Le sous-titre "Tes créations" à gauche et le bouton "+" pour créer un build à droite */}
            <div className="px-[41px] pt-[50px] pb-[30px] flex items-center justify-between">
                {/* Le sous-titre "Tes créations", comme une étiquette sur une étagère */}
                <h2 className="font-rajdhani text-[30px] font-bold text-[#2a343e]" style={{ lineHeight: "0.67" }}>
                    Tes créations
                </h2>
                {/* Le bouton rond rouge "+" pour créer un nouveau build, comme un bouton magique pour ajouter une nouvelle recette */}
                <Link
                    // On navigue vers la page de création de build quand on clique
                    to="/builds/create"
                    // Style : rond, rouge, centré, avec un effet au survol qui assombrit le rouge
                    className="w-[36px] h-[36px] bg-val-red rounded-full flex items-center justify-center hover:bg-val-red-dark transition-colors"
                >
                    {/* L'icône "+" dessinée en SVG : une croix blanche, comme le signe plus sur un bouton */}
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                        {/* La ligne verticale du "+" */}
                        <line x1="9" y1="3" x2="9" y2="15" />
                        {/* La ligne horizontale du "+" */}
                        <line x1="3" y1="9" x2="15" y2="9" />
                    </svg>
                </Link>
            </div>

            {/* La liste des cartes de builds, empilées verticalement, comme des fiches dans un classeur */}
            <div className="px-[41px] pb-8 flex flex-col gap-[10px]">
                {/* Si la liste est vide, on affiche un message, comme une étagère vide avec un petit panneau */}
                {builds.length === 0 && (
                    // Message grisé centré qui dit qu'il n'y a aucun build encore
                    <p className="font-rajdhani text-[#2a343e]/50 text-center py-8">Aucun build pour le moment</p>
                )}
                {/* On parcourt chaque build et on crée une carte cliquable pour chacun, comme aligner des cartes de collection */}
                {builds.map((build) => (
                    // Chaque carte est un lien cliquable vers le détail du build, comme une porte vers la fiche complète
                    <Link
                        // La clé unique pour React, comme un numéro sur chaque carte
                        key={build.id}
                        // L'adresse de la page de détail de ce build
                        to={`/builds/${build.id}`}
                        // Style de la carte : fond clair, bordure, hauteur fixe, contenu en ligne, coins arrondis
                        className="bg-[#f8f8f8] rounded-[5px] border border-[#2a343e] w-full h-[114px] flex overflow-hidden text-left"
                    >
                        {/* L'image de l'agent associé au build — une petite photo carrée à gauche, comme un avatar */}
                        <div className="w-[99px] h-[99px] rounded-[4px] overflow-hidden ml-[10px] mt-[8px] flex-shrink-0 bg-[#0f1923]">
                            {/* L'image du portrait de l'agent, cadrée sur le haut, qui remplit la boîte */}
                            <img src={build.agent.portrait} alt={build.agent.name} className="w-full h-full object-cover object-top" />
                        </div>

                        {/* La section d'informations à droite de l'image, comme la légende d'une photo */}
                        <div className="ml-[8px] pt-[15px] flex flex-col">
                            {/* Le nom du build en gras, comme le titre d'une recette */}
                            <span className="font-rajdhani text-[16px] font-bold text-[#2a343e]" style={{ lineHeight: "1" }}>
                                {/* On affiche le nom du build */}
                                {build.name}
                            </span>

                            {/* L'étiquette du style de jeu — petit rectangle rouge, comme un badge de catégorie */}
                            <div className="mt-[6px] w-[80px] h-[20px] bg-val-red rounded-[4px] flex items-center justify-center">
                                {/* Le texte du style de jeu traduit en français, en blanc sur fond rouge */}
                                <span className="font-rajdhani text-[13px] font-medium text-[#f8f8f8] tracking-[0.2px]" style={{ lineHeight: "1.23" }}>
                                    {/* On cherche la traduction française, sinon on affiche le texte brut */}
                                    {gameplayLabels[build.gameplay] || build.gameplay}
                                </span>
                            </div>

                            {/* Les étiquettes des cartes (maps) — petits rectangles sombres côte à côte, comme des timbres */}
                            <div className="flex gap-[5px] mt-[11px]">
                                {/* On parcourt chaque map associée au build et on crée une petite étiquette */}
                                {build.maps.map((m) => (
                                    // Chaque étiquette de map : petit rectangle sombre avec le nom en blanc
                                    <div key={m.map.id} className="w-[60px] h-[15px] bg-[#2a343e] rounded-[4px] flex items-center justify-center">
                                        {/* Le nom de la map en petit texte blanc */}
                                        <span className="font-rajdhani text-[12px] font-medium text-[#f8f8f8]" style={{ lineHeight: "1.25" }}>
                                            {/* On affiche le nom de la carte */}
                                            {m.map.name}
                                        </span>
                                    </div>
                                ))}
                            {/* Fin de la liste des étiquettes de maps */}
                            </div>
                        {/* Fin de la section d'informations */}
                        </div>
                    {/* Fin d'une carte de build */}
                    </Link>
                ))}
            {/* Fin de la liste des cartes de builds */}
            </div>
        {/* Fin du conteneur principal */}
        </div>
    );
}

// On exporte la page pour que le reste de l'application puisse l'utiliser, comme ranger un livre dans la bibliothèque
export default BuildsPage;
