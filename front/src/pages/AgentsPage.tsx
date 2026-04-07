// On importe les outils React dont on a besoin : useEffect (pour faire des actions au chargement), useState (pour stocker des données qui changent), useRef (pour accéder directement à un élément HTML, comme pointer du doigt un objet)
import { useEffect, useState, useRef } from "react";
// On importe useNavigate (pour changer de page comme si on cliquait un lien) et Link (un lien cliquable qui emmène vers une autre page) depuis react-router-dom, la bibliothèque qui gère la navigation entre les pages
import { useNavigate, Link } from "react-router-dom";
// On importe la fonction getAgents depuis notre fichier API — c'est elle qui va chercher la liste des agents sur le serveur, comme aller chercher un livre à la bibliothèque
import { getAgents } from "../lib/api";

// On définit le type Agent — c'est comme une fiche d'identité qui dit quelles informations chaque agent possède
type Agent = {
    // L'identifiant unique de l'agent, comme un numéro de carte d'identité
    id: string;
    // Le nom de l'agent, par exemple "Jett" ou "Omen"
    name: string;
    // Le rôle de l'agent dans le jeu (Duelliste, Contrôleur, etc.), comme un poste dans une équipe de foot
    role: string;
    // L'URL de la petite image portrait de l'agent, comme une photo d'identité
    portrait: string;
    // L'URL de la grande image en pied de l'agent (optionnelle car certains agents n'en ont pas), comme une photo en entier
    fullPortrait?: string;
    // Le pays ou la région d'où vient l'agent, comme dire "né à Paris"
    origin: string;
    // La liste des capacités spéciales de l'agent, chacune avec un identifiant et une icône — comme les pouvoirs d'un super-héros
    abilities: { id: string; icon: string }[];
};

/**
 * @description Page listant tous les agents — carrousel mobile, grid desktop
 * @returns JSX de la page Agents
 */
// On déclare la fonction principale de cette page — c'est le composant React qui affiche la liste de tous les agents
function AgentsPage() {
    // On crée une variable "agents" qui stocke la liste des agents (vide au début), et "setAgents" pour la mettre à jour — comme un tableau blanc qu'on peut effacer et réécrire
    const [agents, setAgents] = useState<Agent[]>([]);
    // On crée une variable "search" qui stocke le texte tapé dans la barre de recherche (vide au début), et "setSearch" pour la mettre à jour
    const [search, setSearch] = useState("");
    // On récupère la fonction navigate qui permet de changer de page programmatiquement — comme un GPS qui te guide vers une nouvelle destination
    const navigate = useNavigate();
    // On crée une référence vers l'élément HTML du carrousel, pour pouvoir le manipuler directement — comme mettre une étiquette sur un tiroir pour le retrouver facilement
    const carouselRef = useRef<HTMLDivElement>(null);

    // useEffect se lance une seule fois quand la page s'affiche pour la première fois (grâce au tableau vide []) — comme une alarme qui sonne une seule fois au réveil
    useEffect(() => {
        // On appelle getAgents() pour récupérer les agents depuis le serveur, puis on les stocke avec setAgents, et si ça échoue on affiche l'erreur dans la console
        getAgents().then(setAgents).catch(console.error);
    }, []); // Le tableau vide [] signifie "exécute ça une seule fois au montage du composant"

    // On filtre la liste des agents pour ne garder que ceux dont le nom contient le texte de recherche — comme chercher un mot dans un dictionnaire
    const filtered = agents.filter((a) =>
        // On met tout en minuscule pour que la recherche ne soit pas sensible aux majuscules — "Jett" et "jett" donneront le même résultat
        a.name.toLowerCase().includes(search.toLowerCase())
    );

    // On retourne le JSX (le HTML de React) qui sera affiché à l'écran
    return (
        // Le conteneur principal de la page : il prend toute la hauteur de l'écran minimum et a un fond beige
        <div className="min-h-screen bg-beige">
            {/* ===== HERO — mobile + tablette ===== */}
            {/* Cette section n'est visible que sur mobile et tablette (cachée sur desktop grâce à lg:hidden) */}
            <div className="relative lg:hidden">
                {/* Un dégradé rouge fixe en haut de l'écran qui va du rouge vif au transparent — comme un rideau rouge qui se fond dans le décor */}
                <div className="fixed top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-[#ff4656] via-[#ff4656]/50 to-transparent pointer-events-none z-0 lg:hidden" />

                {/* Le contenu positionné au-dessus du dégradé (z-10 = au-dessus de z-0) avec un padding en haut et en bas */}
                <div className="relative z-10 pt-8 pb-2">
                    {/* Le titre "AGENTS" en gros, en majuscules, avec la police Oswald, en noir foncé — c'est le titre principal de la page */}
                    <h1 className="font-oswald text-[42px] font-bold uppercase tracking-[4px] text-[#0f1923] pl-[22px] mb-4">
                        AGENTS
                    </h1>

                    {/* Carousel mobile + tablette */}
                    {/* Le conteneur du carrousel horizontal : les cartes défilent de gauche à droite comme un train de wagons */}
                    <div
                        // On attache la référence carouselRef à ce div pour pouvoir le contrôler
                        ref={carouselRef}
                        // Flex pour aligner les éléments en ligne, gap-3 pour l'espacement, overflow-x-auto pour permettre le défilement horizontal
                        className="flex gap-3 pl-[22px] pr-3 overflow-x-auto pb-4"
                        // On cache la barre de défilement (scrollbar) et on active le défilement fluide sur mobile (comme glisser un doigt sur un écran tactile)
                        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
                    >
                        {/* Pour chaque agent dans la liste, on crée une carte dans le carrousel — comme distribuer des cartes de jeu */}
                        {agents.map((agent) => (
                            // Chaque carte d'agent : une boîte rectangulaire arrondie avec un fond sombre et une bordure
                            <div
                                // La clé unique pour que React puisse identifier chaque carte (obligatoire dans une boucle)
                                key={agent.id}
                                // Carte de 220px de large et 400px de haut, coins arrondis, fond sombre, bordure, curseur pointer au survol, ne rétrécit pas (flex-shrink-0)
                                className="relative w-[220px] h-[400px] rounded-xl bg-[#1f2326] border-2 border-[#2a343e] overflow-hidden cursor-pointer flex-shrink-0"
                                // Quand on clique sur la carte, on navigue vers la page de détail de cet agent — comme ouvrir la fiche d'un joueur
                                onClick={() => navigate(`/agents/${agent.id}`)}
                            >
                                {/* L'image de l'agent en fond de carte — elle remplit toute la carte et est cadrée sur le haut */}
                                <img
                                    // On utilise le portrait en pied s'il existe, sinon le petit portrait — comme choisir la meilleure photo
                                    src={agent.fullPortrait || agent.portrait}
                                    // Le texte alternatif pour l'accessibilité (lecteurs d'écran) et si l'image ne charge pas
                                    alt={agent.name}
                                    // L'image est positionnée en absolu, remplit tout l'espace, et est cadrée sur le haut
                                    className="absolute inset-0 w-full h-full object-cover object-top"
                                />
                                {/* Un dégradé sombre en bas de la carte qui va du fond sombre au transparent — pour que le texte soit lisible sur l'image */}
                                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#1f2326] to-transparent" />
                                {/* Le nom de l'agent écrit verticalement en gros et en blanc, positionné en haut à gauche */}
                                <span
                                    // Police Oswald en 48px, gras, blanc semi-transparent avec ombre pour la lisibilité
                                    className="absolute left-5 top-5 font-oswald text-[48px] font-bold tracking-[2px] text-white/90 drop-shadow-lg"
                                    // writingMode: "vertical-lr" fait que le texte s'écrit de haut en bas au lieu de gauche à droite — comme un panneau japonais
                                    style={{ writingMode: "vertical-lr", lineHeight: "0.4" }}
                                >
                                    {/* On affiche le nom en majuscules */}
                                    {agent.name.toUpperCase()}
                                </span>
                                {/* L'origine de l'agent (son pays) écrite verticalement en rouge, à côté du nom */}
                                <span
                                    // Police Rajdhani en 14px, gras, en rouge Valorant avec une ombre
                                    className="absolute left-[60px] top-5 font-rajdhani text-[14px] font-bold text-val-red drop-shadow-md"
                                    // Texte vertical aussi, comme le nom mais plus petit
                                    style={{ writingMode: "vertical-lr", lineHeight: "1" }}
                                >
                                    {/* On affiche l'origine de l'agent */}
                                    {agent.origin}
                                </span>
                                {/* La barre en bas de la carte qui contient les icônes des 4 capacités de l'agent — comme une barre d'outils */}
                                <div className="absolute bottom-0 left-0 right-0 h-[48px] bg-[#1f2326] rounded-t-lg border-t border-beige/30 flex items-center justify-around">
                                    {/* On prend les 4 premières capacités et on affiche leur icône */}
                                    {agent.abilities.slice(0, 4).map((ab) => (
                                        // Chaque icône de capacité : 28x28px, inversée en blanc (invert) et semi-transparente
                                        <img key={ab.id} src={ab.icon} alt="" className="w-7 h-7 invert opacity-80" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Search bar mobile */}
                {/* La barre de recherche pour mobile, positionnée sous le carrousel */}
                <div className="relative z-10 px-[22px] pb-4">
                    {/* Le conteneur de la barre de recherche : fond sombre, coins arrondis, hauteur fixe */}
                    <div className="flex items-center bg-[#1e1e1e] rounded-[10px] h-[43px] px-3">
                        {/* L'icône de loupe dessinée en SVG — le petit symbole de recherche qu'on voit partout */}
                        <svg className="w-[18px] h-[18px] mr-3 flex-shrink-0" fill="none" viewBox="0 0 18 18" stroke="#ece8e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {/* Le cercle de la loupe */}
                            <circle cx="8" cy="8" r="6" />
                            {/* Le manche de la loupe — une petite ligne diagonale */}
                            <path d="M13 13l3 3" />
                        </svg>
                        {/* Le champ de saisie de texte pour la recherche */}
                        <input
                            // Le type "text" indique que c'est un champ de texte simple
                            type="text"
                            // Le texte grisé qui apparaît quand le champ est vide — un indice pour l'utilisateur
                            placeholder="Recherche"
                            // La valeur actuelle du champ est liée à la variable "search"
                            value={search}
                            // À chaque frappe de clavier, on met à jour la variable "search" avec le nouveau texte
                            onChange={(e) => setSearch(e.target.value)}
                            // Fond transparent, texte beige, police Rajdhani, pas de contour bleu au focus
                            className="bg-transparent flex-1 text-beige placeholder-beige/60 font-rajdhani text-[15px] font-semibold focus:outline-none leading-[43px]"
                        />
                    </div>
                </div>
            </div>

            {/* ===== MOBILE — square cards ===== */}
            {/* Grille de petites cartes carrées pour mobile — visible uniquement sur mobile/tablette (cachée sur desktop) */}
            <div className="flex flex-wrap gap-4 px-[22px] pb-8 lg:hidden">
                {/* Pour chaque agent filtré par la recherche, on crée une petite carte carrée */}
                {filtered.map((agent) => (
                    // Un bouton cliquable pour chaque agent — on utilise un bouton plutôt qu'un div pour l'accessibilité
                    <button
                        // Clé unique pour React
                        key={agent.id}
                        // Au clic, on navigue vers la page de détail de l'agent
                        onClick={() => navigate(`/agents/${agent.id}`)}
                        // Disposition en colonne (image au-dessus, nom en dessous), centré, avec effet de groupe au survol
                        className="flex flex-col items-center gap-1 group"
                    >
                        {/* Le conteneur de la petite image carrée : 90x90px, coins arrondis, fond noir, bordure qui devient rouge au survol */}
                        <div className="w-[90px] h-[90px] rounded-lg border border-[#0f1923] bg-[#0f1923] overflow-hidden group-hover:border-val-red transition-colors">
                            {/* La petite image portrait de l'agent qui remplit le carré */}
                            <img src={agent.portrait} alt={agent.name} className="w-full h-full object-cover object-top" />
                        </div>
                        {/* Le nom de l'agent sous l'image, en minuscule avec la première lettre en majuscule (capitalize) */}
                        <span className="font-rajdhani text-[15px] font-medium text-[#0f1923] capitalize">
                            {/* On affiche le nom en minuscules */}
                            {agent.name.toLowerCase()}
                        </span>
                    </button>
                ))}
            </div>

            {/* ===== DESKTOP — titre + search + grid 3 colonnes de cards ===== */}
            {/* Cette section est cachée sur mobile (hidden) et visible uniquement sur desktop (lg:block) */}
            <div className="hidden lg:block px-[22px] pt-8 pb-8">
                {/* Le titre "AGENTS" en gros pour le desktop — même style que la version mobile */}
                <h1 className="font-oswald text-[42px] font-bold uppercase tracking-[4px] text-[#0f1923] mb-6">
                    AGENTS
                </h1>

                {/* Search bar desktop */}
                {/* La barre de recherche version desktop — identique à la version mobile mais avec un espacement en bas */}
                <div className="flex items-center bg-[#1e1e1e] rounded-[10px] h-[43px] px-3 mb-6">
                    {/* L'icône de loupe SVG — même dessin que la version mobile */}
                    <svg className="w-[18px] h-[18px] mr-3 flex-shrink-0" fill="none" viewBox="0 0 18 18" stroke="#ece8e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {/* Le cercle de la loupe */}
                        <circle cx="8" cy="8" r="6" />
                        {/* Le manche de la loupe */}
                        <path d="M13 13l3 3" />
                    </svg>
                    {/* Le champ de saisie pour la recherche desktop */}
                    <input
                        // Type texte pour la saisie
                        type="text"
                        // Texte indicatif quand le champ est vide
                        placeholder="Recherche"
                        // Valeur liée à la variable search
                        value={search}
                        // Met à jour la recherche à chaque frappe
                        onChange={(e) => setSearch(e.target.value)}
                        // Style identique à la version mobile
                        className="bg-transparent flex-1 text-beige placeholder-beige/60 font-rajdhani text-[15px] font-semibold focus:outline-none leading-[43px]"
                    />
                </div>

                {/* Grid 3 colonnes — cards agents */}
                {/* Une grille de 3 colonnes pour afficher les agents en cartes sur desktop */}
                <div className="grid grid-cols-3 gap-4">
                    {/* Pour chaque agent filtré, on crée une carte-lien */}
                    {filtered.map((agent) => (
                        // Un lien cliquable qui emmène vers la page de détail de l'agent — comme une carte de visite cliquable
                        <Link
                            // Clé unique pour React
                            key={agent.id}
                            // L'URL de destination : la page de détail de cet agent
                            to={`/agents/${agent.id}`}
                            // Carte arrondie, fond sombre, bordure, effet de groupe au survol, hauteur fixe de 280px
                            className="relative rounded-xl bg-[#1f2326] border-2 border-[#2a343e] overflow-hidden group h-[280px]"
                        >
                            {/* L'image de l'agent en fond de carte — portrait en pied si disponible, sinon petit portrait */}
                            <img
                                // On choisit la meilleure image disponible
                                src={agent.fullPortrait || agent.portrait}
                                // Texte alternatif pour l'accessibilité
                                alt={agent.name}
                                // Image en position absolue qui remplit toute la carte, cadrée sur le haut
                                className="absolute inset-0 w-full h-full object-cover object-top"
                            />
                            {/* Un dégradé sombre sur la moitié basse de la carte pour rendre le texte lisible */}
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#1f2326] to-transparent" />
                            {/* Le conteneur du nom et de l'origine, positionné en bas de la carte */}
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                                {/* Le nom de l'agent en gros et en blanc, police Oswald */}
                                <span className="font-oswald text-[22px] font-bold text-white block">
                                    {/* On affiche le nom en majuscules */}
                                    {agent.name.toUpperCase()}
                                </span>
                                {/* L'origine de l'agent en rouge Valorant, plus petit */}
                                <span className="font-rajdhani text-[13px] font-bold text-val-red">
                                    {/* On affiche l'origine */}
                                    {agent.origin}
                                </span>
                            </div>
                            {/* Une fine barre en bas qui apparaît en rouge au survol — un petit effet visuel élégant */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-transparent group-hover:bg-val-red transition-colors" />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

// On exporte le composant AgentsPage pour qu'il puisse être utilisé dans d'autres fichiers — comme mettre un livre sur l'étagère de la bibliothèque pour que d'autres puissent le prendre
export default AgentsPage;
