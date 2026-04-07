// On importe useEffect (pour exécuter du code au chargement, comme un réveil qui sonne) et useState (pour stocker des infos qui changent, comme un tableau blanc)
import { useEffect, useState } from "react";
// On importe Outlet (l'endroit où s'affiche la page enfant, comme un cadre photo interchangeable), useLocation (pour savoir sur quelle page on est, comme regarder le panneau de la rue), et Link (pour créer des liens cliquables, comme des portes)
import { Outlet, useLocation, Link } from "react-router-dom";
// On importe useSession pour savoir si l'utilisateur est connecté, comme vérifier si quelqu'un a son badge d'entrée
import { useSession } from "../lib/auth-client";
// On importe getMe pour récupérer les infos de l'utilisateur connecté sur le serveur, comme demander sa fiche au secrétariat
import { getMe } from "../lib/api";

/**
 * @description Layout responsive — bottom nav mobile, sidebar desktop, contenu centre max-w
 * @returns JSX du layout avec navigation
 */
// La fonction Layout est le squelette de l'application : elle entoure toutes les pages comme un cadre entoure un tableau
function Layout() {
    // On récupère l'adresse actuelle de la page pour savoir où on est, comme lire le panneau de la rue
    const location = useLocation();
    // On récupère les infos de session (si l'utilisateur est connecté), comme regarder si le badge est validé
    const { data: session } = useSession();
    // On crée un espace mémoire pour savoir si le menu mobile est ouvert ou fermé (fermé par défaut), comme un tiroir qu'on peut ouvrir ou fermer
    const [menuOpen, setMenuOpen] = useState(false);
    // On crée un espace mémoire pour savoir si l'utilisateur est administrateur (non par défaut), comme vérifier s'il a la clé du bureau du directeur
    const [isAdmin, setIsAdmin] = useState(false);

    // useEffect se lance au chargement ou quand la session change, comme un détective qui vérifie l'identité à chaque changement
    useEffect(() => {
        // Si l'utilisateur est connecté (il a une session avec un user)
        if (session?.user) {
            // On va chercher ses infos sur le serveur pour vérifier son rôle
            getMe()
                // Si ça marche, on regarde si son rôle est "ADMIN" et on stocke vrai ou faux, comme vérifier si c'est le directeur
                .then((user) => setIsAdmin(user.role === "ADMIN"))
                // Si ça échoue, on considère qu'il n'est pas admin, comme dire "dans le doute, pas de passe-droit"
                .catch(() => setIsAdmin(false));
        // Si l'utilisateur n'est pas connecté
        } else {
            // On met isAdmin à faux, car pas de connexion = pas d'accès admin
            setIsAdmin(false);
        }
    // Le tableau [session] dit : "relance ce code à chaque fois que la session change"
    }, [session]);

    // La liste des éléments du menu de navigation, comme les boutons d'un ascenseur
    const menuItems = [
        // Le bouton "Agents" qui mène à la page d'accueil, comme le rez-de-chaussée
        { label: "Agents", path: "/" },
        // Le bouton "Builds" qui mène à la page des builds, comme le premier étage
        { label: "Builds", path: "/builds" },
        // Le bouton "Profils" qui mène à la page de profil, comme le deuxième étage
        { label: "Profils", path: "/profile" },
        // Si l'utilisateur est admin, on ajoute le bouton "Admin", sinon on n'ajoute rien, comme une porte secrète réservée au directeur
        ...(isAdmin ? [{ label: "Admin", path: "/admin" }] : []),
    ];

    // On retourne le contenu visuel du layout, le cadre qui entoure toutes les pages
    return (
        // Le conteneur principal : prend tout l'écran, fond beige, contenu centré horizontalement, comme un mur sur lequel on accroche tout
        <div className="min-h-screen bg-beige flex justify-center">
            {/* Un conteneur intérieur limité à 600px de large, avec un espace en bas pour la barre mobile, comme un couloir central */}
            <div className="w-full max-w-[600px] min-h-screen flex flex-col pb-[90px] lg:pb-0 relative">

                {/* ===== BARRE LATÉRALE DESKTOP — visible seulement sur les grands écrans ===== */}
                {/* Une navigation fixée à gauche du contenu, visible uniquement en desktop, comme un panneau de contrôle sur le mur */}
                <nav className="hidden lg:flex fixed left-[calc(50%-300px-220px)] top-0 w-[200px] h-screen flex-col pt-10 px-4 gap-1">
                    {/* Le logo en haut de la barre latérale, comme l'enseigne du magasin */}
                    <Link to="/" className="mb-8">
                        {/* L'image du logo, rendue noire avec le filtre brightness-0, comme un tampon encreur */}
                        <img src="/logo.svg" alt="Logo" className="w-[38px] h-[32px] brightness-0" />
                    </Link>
                    {/* On parcourt chaque élément du menu et on crée un lien pour chacun */}
                    {menuItems.map((item) => (
                        // Chaque lien du menu : texte en gras, avec un style différent si c'est la page active (rouge) ou non (noir)
                        <Link
                            // La clé unique pour React, comme un numéro sur chaque bouton
                            key={item.path}
                            // L'adresse vers laquelle le lien pointe
                            to={item.path}
                            // Si la page actuelle correspond à ce lien, on le colore en rouge sur fond rouge clair ; sinon en noir avec un effet au survol
                            className={`font-rajdhani text-[18px] font-bold tracking-[1px] px-4 py-3 rounded-xl transition-colors ${
                                location.pathname === item.path
                                    ? "text-val-red bg-val-red/10"
                                    : "text-[#0f1923] hover:text-val-red hover:bg-val-red/5"
                            }`}
                        >
                            {/* On affiche le texte du bouton de menu */}
                            {item.label}
                        </Link>
                    ))}
                {/* Fin de la barre latérale desktop */}
                </nav>

                {/* L'Outlet est l'endroit où s'affiche la page enfant (Agents, Builds, Profil...), comme un écran de télé qui change de chaîne */}
                <Outlet />

                {/* ===== MENU PLEIN ÉCRAN MOBILE — s'affiche quand on appuie sur le bouton hamburger ===== */}
                {/* Ce menu n'apparaît que si menuOpen est vrai, comme un rideau qu'on tire */}
                {menuOpen && (
                    // Un écran sombre qui couvre tout, avec une animation d'apparition, comme un rideau de théâtre qui s'ouvre
                    <div className="fixed inset-0 z-60 bg-navy flex flex-col animate-fade-in lg:hidden">
                        {/* Le bouton pour fermer le menu (une croix), en haut à droite, comme le bouton X d'une fenêtre */}
                        <button
                            // Quand on clique, on ferme le menu en mettant menuOpen à faux
                            onClick={() => setMenuOpen(false)}
                            // Style : positionné en haut à droite, carré de 40px
                            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center"
                            // Texte pour l'accessibilité, comme un panneau en braille
                            aria-label="Fermer le menu"
                        >
                            {/* La croix "X" dessinée en SVG : deux lignes blanches qui se croisent */}
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                                {/* La première ligne diagonale de la croix, du coin haut-gauche au coin bas-droite */}
                                <line x1="4" y1="4" x2="20" y2="20" />
                                {/* La deuxième ligne diagonale de la croix, du coin haut-droite au coin bas-gauche */}
                                <line x1="20" y1="4" x2="4" y2="20" />
                            </svg>
                        </button>

                        {/* La navigation du menu mobile : les liens empilés verticalement au centre de l'écran, comme des étages d'ascenseur */}
                        <nav className="flex flex-col justify-center flex-1 px-8">
                            {/* On parcourt chaque élément du menu et on crée un gros lien pour chacun */}
                            {menuItems.map((item) => (
                                // Chaque lien du menu mobile : texte en majuscules, séparé par une ligne, comme des boutons d'un grand panneau
                                <Link
                                    // La clé unique pour React
                                    key={item.path}
                                    // L'adresse vers laquelle le lien pointe
                                    to={item.path}
                                    // Quand on clique, on ferme le menu avant de naviguer, comme fermer la porte derrière soi
                                    onClick={() => setMenuOpen(false)}
                                    // Style : occupe toute la largeur, bordure en bas, espace vertical, texte à gauche
                                    className="w-full text-left border-b border-[#2a343e] py-6 group block"
                                >
                                    {/* Le texte du lien en grosses lettres majuscules */}
                                    <span
                                        // Si c'est la page active, le texte est rouge ; sinon il est blanc et devient rouge au survol
                                        className={`font-oswald text-[32px] font-bold uppercase tracking-[2px] transition-colors ${
                                            location.pathname === item.path
                                                ? "text-val-red"
                                                : "text-white group-hover:text-val-red"
                                        }`}
                                    >
                                        {/* On affiche le texte du bouton de menu */}
                                        {item.label}
                                    </span>
                                </Link>
                            ))}
                        {/* Fin de la navigation du menu mobile */}
                        </nav>
                    {/* Fin de l'écran de menu mobile */}
                    </div>
                )}

                {/* ===== BARRE DE NAVIGATION EN BAS MOBILE — masquée sur desktop ===== */}
                {/* Une barre fixée en bas de l'écran sur mobile, comme une barre d'outils dans une appli de téléphone */}
                <nav className="fixed bottom-0 left-0 right-0 h-[90px] bg-dark-bar border-t-2 border-[#2a343e] flex items-center justify-between px-8 z-50 lg:hidden">
                    {/* Le logo à gauche de la barre, cliquable pour revenir à l'accueil, comme un bouton "maison" */}
                    <Link to="/" aria-label="Accueil">
                        {/* L'image du logo en blanc */}
                        <img src="/logo.svg" alt="Logo" className="w-[38px] h-[32px]" />
                    </Link>

                    {/* Le bouton hamburger (trois barres) pour ouvrir le menu, comme un bouton pour tirer le rideau */}
                    <button
                        // Quand on clique, on inverse l'état du menu : s'il est fermé on l'ouvre, s'il est ouvert on le ferme
                        onClick={() => setMenuOpen(!menuOpen)}
                        // Style : rond, fond sombre, centré
                        className="w-10 h-10 bg-[#2a343e] rounded-full flex items-center justify-center"
                        // Texte pour l'accessibilité
                        aria-label="Menu"
                    >
                        {/* L'icône hamburger dessinée en SVG : trois lignes horizontales blanches, comme les trois étages d'un sandwich */}
                        <svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                            {/* La ligne du haut du hamburger */}
                            <line x1="1" y1="1" x2="17" y2="1" />
                            {/* La ligne du milieu du hamburger */}
                            <line x1="1" y1="7" x2="17" y2="7" />
                            {/* La ligne du bas du hamburger */}
                            <line x1="1" y1="13" x2="17" y2="13" />
                        </svg>
                    </button>
                {/* Fin de la barre de navigation mobile */}
                </nav>
            {/* Fin du conteneur intérieur */}
            </div>
        {/* Fin du conteneur principal */}
        </div>
    );
}

// On exporte le Layout pour que le reste de l'application puisse l'utiliser, comme le plan du bâtiment que tout le monde suit
export default Layout;
