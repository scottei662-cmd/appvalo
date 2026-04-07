// On importe useEffect (pour executer du code au chargement) et useState (pour stocker des valeurs qui changent)
import { useEffect, useState } from "react";
// On importe useNavigate pour rediriger l'utilisateur et Link pour creer des liens cliquables
import { useNavigate, Link } from "react-router-dom";
// On importe useSession pour verifier si l'utilisateur est connecte — comme verifier si quelqu'un a son badge
import { useSession } from "../lib/auth-client";
// On importe getMe pour recuperer les infos de l'utilisateur connecte — pour savoir s'il est admin ou pas
import { getMe } from "../lib/api";
// On importe le composant AdminAgents — c'est l'onglet pour gerer les agents (personnages du jeu)
import AdminAgents from "../components/admin/AdminAgents";
// On importe le composant AdminMaps — c'est l'onglet pour gerer les cartes du jeu
import AdminMaps from "../components/admin/AdminMaps";
// On importe le composant AdminWeapons — c'est l'onglet pour gerer les armes du jeu
import AdminWeapons from "../components/admin/AdminWeapons";

// On definit les 3 onglets possibles — comme les 3 tiroirs d'une commode
const tabs = ["Agents", "Maps", "Weapons"] as const;
// On cree un type Tab qui ne peut etre que "Agents", "Maps" ou "Weapons" — comme une etiquette pour chaque tiroir
type Tab = (typeof tabs)[number];

/**
 * @description Panel d'administration protege par role ADMIN — seuls les admins peuvent voir cette page
 * @returns JSX de la page admin
 */
// On declare la fonction AdminPage — c'est le tableau de bord de l'administrateur
function AdminPage() {
    // Boite pour savoir quel onglet est actif — par defaut c'est "Agents"
    const [activeTab, setActiveTab] = useState<Tab>("Agents");
    // Boite pour savoir si l'utilisateur est autorise a voir cette page — null = on ne sait pas encore
    const [authorized, setAuthorized] = useState<boolean | null>(null);
    // Fonction pour rediriger l'utilisateur vers une autre page
    const navigate = useNavigate();
    // On recupere la session de l'utilisateur — c'est comme verifier sa carte d'identite
    const { data: session } = useSession();

    // useEffect s'execute quand la page se charge ou quand session/navigate changent — comme un gardien qui verifie a l'entree
    useEffect(() => {
        // Si l'utilisateur n'est pas connecte (pas de session), on le renvoie a la page de connexion
        if (!session?.user) {
            navigate("/login");
            // On arrete ici — pas besoin de continuer si il n'est pas connecte
            return;
        }
        // On demande au serveur les infos completes de l'utilisateur — pour verifier son role
        getMe()
            // Quand on recoit la reponse, on verifie le role
            .then((user) => {
                // Si l'utilisateur n'est pas ADMIN, on le renvoie a l'accueil — zone interdite !
                if (user.role !== "ADMIN") {
                    navigate("/");
                // Si c'est un ADMIN, on l'autorise a rester — bienvenue dans la zone VIP
                } else {
                    setAuthorized(true);
                }
            })
            // Si la requete echoue (erreur reseau, etc.), on renvoie a la page de connexion par securite
            .catch(() => navigate("/login"));
    // Ce code se relance si session ou navigate changent — pour re-verifier les droits
    }, [session, navigate]);

    // Si on n'est pas encore autorise (en cours de verification), on affiche un spinner de chargement
    if (authorized !== true) {
        return (
            // Conteneur plein ecran avec fond bleu marine, contenu centre
            <div className="min-h-screen bg-navy flex items-center justify-center">
                {/* Spinner — un cercle qui tourne pour montrer qu'on attend, comme un sablier moderne */}
                <div className="w-8 h-8 border-2 border-val-red border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Si on est autorise, on affiche le panel d'administration
    return (
        // Conteneur principal — fond beige, prend toute la hauteur de l'ecran
        <div className="min-h-screen bg-beige">
            {/* En-tete de la page — contient le bouton retour et le titre */}
            <div className="px-6 pt-10 pb-4 flex items-center justify-between">
                {/* Partie gauche de l'en-tete — fleche retour + titre */}
                <div className="flex items-center gap-3">
                    {/* Lien retour vers la page d'accueil — une fleche qui pointe a gauche */}
                    <Link to="/" className="text-[#0f1923]/50 hover:text-[#0f1923] transition-colors">
                        {/* Icone SVG de la fleche retour — dessine une fleche pointant a gauche */}
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            {/* Le chemin de la fleche — une ligne horizontale avec deux lignes diagonales pour la pointe */}
                            <path d="M15 10H5M5 10L10 5M5 10L10 15" />
                        </svg>
                    </Link>
                    {/* Titre "Admin Panel" — en rouge, gros, gras, italique, majuscules, espacement entre les lettres */}
                    <h1 className="font-oswald text-[28px] font-bold italic uppercase tracking-[3px] text-val-red">
                        Admin Panel
                    </h1>
                </div>
            </div>

            {/* Barre d'onglets — comme des etiquettes de classeur pour naviguer entre les sections */}
            <div className="px-6 flex gap-1 border-b border-[#0f1923]/20">
                {/* On parcourt chaque onglet et on cree un bouton pour chacun */}
                {tabs.map((tab) => (
                    // Bouton d'onglet — chaque onglet a un style different selon s'il est actif ou non
                    <button
                        // Cle unique pour React — permet a React de savoir quel bouton est lequel
                        key={tab}
                        // Quand on clique, on change l'onglet actif — comme ouvrir un autre tiroir
                        onClick={() => setActiveTab(tab)}
                        // Style conditionnel — si l'onglet est actif, il est rouge avec une bordure en bas ; sinon il est gris
                        className={`px-5 py-3 font-rajdhani text-[16px] font-bold tracking-[1px] uppercase border-b-2 transition-colors ${
                            activeTab === tab
                                ? "border-val-red text-val-red"
                                : "border-transparent text-[#0f1923]/50 hover:text-[#0f1923]"
                        }`}
                    >
                        {/* On affiche le nom de l'onglet — "Agents", "Maps" ou "Weapons" */}
                        {tab}
                    </button>
                ))}
            </div>

            {/* Zone de contenu — c'est ici que s'affiche le contenu de l'onglet selectionne */}
            <div className="mx-4 my-4 p-4 bg-navy rounded-xl text-white">
                {/* Si l'onglet actif est "Agents", on affiche le composant AdminAgents */}
                {activeTab === "Agents" && <AdminAgents />}
                {/* Si l'onglet actif est "Maps", on affiche le composant AdminMaps */}
                {activeTab === "Maps" && <AdminMaps />}
                {/* Si l'onglet actif est "Weapons", on affiche le composant AdminWeapons */}
                {activeTab === "Weapons" && <AdminWeapons />}
            </div>
        {/* Fin du conteneur principal */}
        </div>
    );
}

// On exporte AdminPage pour que le routeur puisse l'afficher — comme mettre la page dans le menu de l'application
export default AdminPage;
