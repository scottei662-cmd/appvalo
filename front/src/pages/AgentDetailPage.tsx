// On importe useEffect (pour exécuter du code au chargement, comme un réveil matin qui sonne une fois) et useState (pour stocker des infos qui peuvent changer, comme un tableau blanc qu'on peut effacer et réécrire)
import { useEffect, useState } from "react";
// On importe useParams (pour lire l'adresse de la page, comme lire le numéro sur une porte) et useNavigate (pour changer de page, comme marcher dans un couloir vers une autre pièce)
import { useParams, useNavigate } from "react-router-dom";
// On importe la fonction getAgent qui va chercher les infos d'un agent sur le serveur, comme envoyer un pigeon voyageur chercher une fiche
import { getAgent } from "../lib/api";

// On définit la forme d'une capacité (Ability), comme un formulaire vide à remplir pour chaque pouvoir
type Ability = {
    // L'identifiant unique de la capacité, comme un numéro de badge
    id: string;
    // Le nom de la capacité, comme le titre d'un super pouvoir
    name: string;
    // L'adresse de l'image de l'icône, comme une photo d'identité du pouvoir
    icon: string;
    // La description qui explique ce que fait le pouvoir, comme une notice de jouet
    description: string;
    // La touche du clavier associée, comme le bouton sur lequel appuyer pour activer le pouvoir
    keyboardKey: string;
    // Le nombre de fois qu'on peut utiliser ce pouvoir, comme le nombre de bonbons dans un sachet
    charges: number;
};

// On définit la forme d'un Agent, comme un formulaire vide à remplir pour chaque personnage
type Agent = {
    // L'identifiant unique de l'agent, comme un numéro de badge
    id: string;
    // Le nom de l'agent, comme le prénom d'un super héros
    name: string;
    // Le rôle de l'agent (contrôleur, duelliste...), comme le poste dans une équipe de foot
    role: string;
    // L'adresse de l'image portrait de l'agent, comme une photo d'identité
    portrait: string;
    // L'adresse de l'image en pied (optionnelle), comme une photo en entier de la tête aux pieds
    fullPortrait?: string;
    // La description courte de l'agent, comme un surnom ou un résumé en une phrase
    description: string;
    // L'histoire complète de l'agent, comme un livre qui raconte sa vie
    biography: string;
    // Le pays ou lieu d'origine de l'agent, comme sa ville natale
    origin: string;
    // La liste de ses capacités/pouvoirs, comme un sac rempli de super pouvoirs
    abilities: Ability[];
};

// Un dictionnaire qui traduit les noms de rôles anglais en français, comme un petit carnet de traduction
const roleLabels: Record<string, string> = {
    // "Controller" en anglais devient "Contrôleur" en français
    Controller: "Contrôleur",
    // "Duelist" en anglais devient "Duelliste" en français
    Duelist: "Duelliste",
    // "Initiator" en anglais devient "Initiateur" en français
    Initiator: "Initiateur",
    // "Sentinel" en anglais devient "Sentinelle" en français
    Sentinel: "Sentinelle",
};

/**
 * @description Page de detail d'un agent avec hero fondu, abilities et biographie au scroll
 * @returns JSX de la page agent detail
 */
// On crée la fonction principale de la page qui affiche les détails d'un agent, comme construire une affiche de cinéma pour un personnage
function AgentDetailPage() {
    // On récupère l'identifiant "id" dans l'adresse de la page, comme lire le numéro de chambre sur la porte
    const { id } = useParams();
    // On prépare la fonction pour naviguer entre les pages, comme avoir une télécommande pour changer de chaîne
    const navigate = useNavigate();
    // On crée un espace mémoire pour stocker l'agent (null au début = on n'a pas encore les infos), comme un cadre photo vide qu'on va remplir
    const [agent, setAgent] = useState<Agent | null>(null);
    // On crée un espace mémoire pour savoir quelle capacité est survolée par la souris (null = aucune), comme pointer du doigt une carte sur la table
    const [hoveredAbility, setHoveredAbility] = useState<number | null>(null);

    // useEffect se lance au chargement de la page ou quand l'id change, comme un robot qui va chercher les infos dès qu'on arrive
    useEffect(() => {
        // Si on a bien un id, on va chercher les infos de l'agent sur le serveur, puis on les range dans la mémoire ; si ça rate, on affiche l'erreur dans la console
        if (id) getAgent(id).then(setAgent).catch(console.error);
    // Le [id] dit : "relance cette action seulement si l'id change", comme un chien qui part chercher la balle seulement quand on la lance
    }, [id]);

    // Si l'agent n'est pas encore chargé (toujours null), on affiche un écran de chargement, comme un sablier qui tourne
    if (!agent) {
        // On retourne un écran de chargement
        return (
            // Un grand conteneur qui prend tout l'écran avec un fond beige, centré comme un cadre au milieu du mur
            <div className="min-h-screen bg-beige flex items-center justify-center">
                {/* Un petit cercle qui tourne comme une roue, pour dire "patiente, ça charge" */}
                <div className="w-8 h-8 border-2 border-val-red border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Si l'agent est chargé, on affiche la vraie page avec toutes ses infos
    return (
        // Le conteneur principal de la page : prend tout l'écran, fond beige, empêche le débordement horizontal comme un cadre qui cache ce qui dépasse
        <div className="min-h-screen bg-beige overflow-hidden">
            {/* Dégradé rouge plein écran — visible seulement sur mobile et tablette, comme un filtre rouge posé sur une photo */}
            <div className="fixed top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-val-red via-val-red/50 to-transparent pointer-events-none z-0 lg:hidden" />

            {/* ===== HERO — La grande image du personnage avec un effet de fondu vers le bas ===== */}
            {/* Un conteneur qui prend 75% de la hauteur de l'écran sur mobile, 60% sur grand écran, comme une grande affiche de cinéma */}
            <div className="relative h-[75vh] lg:h-[60vh] overflow-hidden">
                {/* Fond transparent sur mobile, beige sur desktop, comme un mur derrière la photo */}
                <div className="absolute inset-0 bg-transparent lg:bg-beige" />

                {/* L'image portrait de l'agent en grand, qui remplit tout l'espace comme un poster collé sur le mur */}
                <img
                    // On utilise le portrait en pied s'il existe, sinon le portrait normal, comme choisir la meilleure photo
                    src={agent.fullPortrait || agent.portrait}
                    // Texte alternatif pour les personnes qui ne peuvent pas voir l'image
                    alt={agent.name}
                    // L'image couvre tout l'espace, cadrée sur le haut, et se place au-dessus du fond (z-10)
                    className="absolute inset-0 w-full h-full object-cover object-top z-10"
                />

                {/* Fondu vers beige en bas sur mobile — comme de la brume qui cache le bas de l'image, fixé en bas de l'écran */}
                <div className="fixed bottom-0 left-0 right-0 h-[40vh] bg-gradient-to-t from-beige to-transparent pointer-events-none z-20 lg:hidden" />
                {/* Fondu vers beige en bas sur desktop — même effet de brume mais seulement visible sur grand écran */}
                <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-beige to-transparent z-20 hidden lg:block" />

                {/* Bouton retour (flèche) + nom de l'agent — en haut à gauche, comme un panneau indicateur */}
                <button onClick={() => navigate(-1)} className="absolute top-[68px] left-[22px] z-30 flex items-center gap-2">
                    {/* Le petit triangle qui forme la flèche de retour, dessiné avec des bordures CSS comme un origami */}
                    <div className="w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-r-[13px] border-r-[#0f1923]" />
                    {/* Le nom de l'agent en grosses lettres majuscules, comme le titre d'un film d'action */}
                    <h1 className="font-oswald text-[36px] font-bold uppercase tracking-[4px] text-[#0f1923]">
                        {/* On affiche le nom de l'agent, comme l'écriture sur une carte de visite */}
                        {agent.name}
                    </h1>
                </button>
            {/* Fin du bloc HERO */}
            </div>

            {/* ===== ROLE — Le rôle de l'agent affiché au centre ===== */}
            {/* Un conteneur centré qui remonte un peu sur l'image grâce au margin négatif, comme une étiquette collée à cheval entre deux zones */}
            <div className="flex items-center justify-center gap-2 mt-[-40px] relative z-30">
                {/* Le texte du rôle traduit en français, comme un badge de fonction */}
                <span className="font-rajdhani text-[26px] font-semibold text-[#0f1923]">
                    {/* On cherche la traduction française du rôle, sinon on affiche le rôle tel quel */}
                    {roleLabels[agent.role] || agent.role}
                </span>
            </div>

            {/* ===== NOM DE CODE + ORIGINE — Les infos textuelles sous le rôle ===== */}
            {/* Un bloc de texte centré avec un peu d'espace sur les côtés, comme un sous-titre de film */}
            <div className="text-center mt-2 px-6">
                {/* Le nom de code / description courte de l'agent */}
                <p className="font-rajdhani text-[16px] font-medium text-[#1f2326]">
                    {/* On affiche "Noms de code :" suivi de la description, comme une plaque signalétique */}
                    Noms de code : {agent.description}
                </p>
                {/* L'origine géographique de l'agent */}
                <p className="font-rajdhani text-[20px] font-medium text-[#1f2326] mt-1">
                    {/* On affiche "Origine :" suivi du lieu, comme un passeport */}
                    Origine : {agent.origin}
                </p>
            </div>

            {/* ===== CARTES DE CAPACITÉS — on survole pour voir la description ===== */}
            {/* Un conteneur horizontal centré qui affiche les 4 cartes de capacités côte à côte, comme 4 cartes de jeu posées sur la table */}
            <div className="flex justify-center gap-3 mt-6 px-4">
                {/* On prend les 4 premières capacités et on crée une carte pour chacune, comme distribuer 4 cartes */}
                {agent.abilities.slice(0, 4).map((ab, i) => (
                    // Chaque carte de capacité : une petite boîte avec bordure, qui réagit au survol de la souris
                    <div
                        // La clé unique pour React, comme un numéro sur chaque carte
                        key={ab.id}
                        // Style de la carte : taille fixe, bordure, fond clair, contenu centré en colonne
                        className="relative w-[76px] h-[155px] rounded-lg border-2 border-[#1f2326] bg-[#f8f8f8] flex flex-col items-center overflow-visible group"
                        // Quand la souris entre sur la carte, on note quel numéro est survolé, comme pointer du doigt
                        onMouseEnter={() => setHoveredAbility(i)}
                        // Quand la souris quitte la carte, on oublie le survol, comme retirer son doigt
                        onMouseLeave={() => setHoveredAbility(null)}
                    >
                        {/* La boîte qui affiche la touche du clavier, comme un bouton de manette */}
                        <div className="w-[48px] h-[48px] bg-[#1f2326] rounded-[1px] flex items-center justify-center mt-2">
                            {/* La lettre de la touche clavier, comme l'inscription sur un bouton */}
                            <span className="font-rajdhani text-[20px] font-bold text-white">
                                {/* On affiche la touche associée à cette capacité */}
                                {ab.keyboardKey}
                            </span>
                        </div>
                        {/* L'icône de la capacité, centrée dans l'espace restant comme un logo sur un badge */}
                        <div className="flex-1 flex items-center justify-center">
                            {/* L'image de l'icône du pouvoir, comme un petit dessin représentant le super pouvoir */}
                            <img src={ab.icon} alt={ab.name} className="w-[38px] h-[38px]" />
                        </div>
                        {/* Les barres de charges — petites barres horizontales qui montrent combien de fois on peut utiliser le pouvoir, comme des vies dans un jeu */}
                        <div className="flex justify-center gap-1 mb-2">
                            {/* On crée autant de petites barres qu'il y a de charges, comme dessiner des traits pour compter */}
                            {Array.from({ length: ab.charges }).map((_, ci) => (
                                // Chaque petite barre représente une charge, comme un trait sur un bâton de comptage
                                <div key={ci} className="w-[16px] h-[5px] rounded-[1px] bg-[#1f2326]" />
                            ))}
                        </div>

                        {/* La bulle d'info qui apparaît quand on survole la carte, comme une info-bulle qui sort d'un livre */}
                        {hoveredAbility === i && (
                            // La bulle blanche positionnée sous la carte, centrée, avec ombre, comme un post-it qui apparaît
                            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-[250px] bg-white rounded-xl p-3 border border-beige-dark shadow-lg z-40 animate-fade-in">
                                {/* Le nom de la capacité en gras, comme le titre du post-it */}
                                <h4 className="font-rajdhani text-[#0f1923] font-bold text-[16px]">{ab.name}</h4>
                                {/* La description détaillée de la capacité, comme le texte explicatif du post-it */}
                                <p className="font-rajdhani text-[#0f1923]/70 text-[13px] leading-relaxed mt-1">{ab.description}</p>
                            </div>
                        )}
                    {/* Fin d'une carte de capacité */}
                    </div>
                ))}
            {/* Fin du conteneur des cartes de capacités */}
            </div>

            {/* ===== BIOGRAPHIE — L'histoire complète de l'agent ===== */}
            {/* Un bloc de texte avec marge en bas pour respirer, comme un chapitre de livre */}
            <div className="px-[22px] mt-6 pb-8">
                {/* Le titre de la section biographie, comme le titre d'un chapitre */}
                <h2 className="font-rajdhani text-[24px] font-semibold text-[#0f1923] mb-2">
                    Histoire et Scenario
                </h2>
                {/* Le texte de la biographie avec un interligne serré, comme un paragraphe de roman */}
                <p className="font-rajdhani text-[15px] font-medium text-[#0f1923]" style={{ lineHeight: "1.33" }}>
                    {/* On affiche la biographie complète de l'agent, son histoire comme dans un livre */}
                    {agent.biography}
                </p>
            </div>
        {/* Fin du conteneur principal de la page */}
        </div>
    );
}

// On exporte la page pour que le reste de l'application puisse l'utiliser, comme mettre un livre dans la bibliothèque pour que tout le monde puisse le lire
export default AgentDetailPage;
