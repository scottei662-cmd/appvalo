// On importe BrowserRouter (le GPS de l'appli), Routes (la liste des chemins) et Route (un chemin individuel) depuis react-router-dom
// C'est comme un plan de la ville : chaque Route est une rue qui mène à une page différente
import { BrowserRouter, Routes, Route } from "react-router-dom";
// On importe le Layout — c'est le cadre commun à toutes les pages (la barre de navigation, le fond, etc.)
// Comme le cadre d'un tableau : il reste le même, seule l'image à l'intérieur change
import Layout from "./components/Layout";
// On importe la page qui liste tous les agents de Valorant — comme un catalogue de personnages
import AgentsPage from "./pages/AgentsPage";
// On importe la page de détail d'un agent — quand tu cliques sur un agent, tu vois toutes ses infos
import AgentDetailPage from "./pages/AgentDetailPage";
// On importe la page qui liste tous les builds (configurations de jeu) — comme un livre de recettes
import BuildsPage from "./pages/BuildsPage";
// On importe la page de détail d'un build — pour voir une recette en particulier
import BuildDetailPage from "./pages/BuildDetailPage";
// On importe la page de profil de l'utilisateur — c'est ta carte d'identité dans l'appli
import ProfilePage from "./pages/ProfilePage";
// On importe la page de connexion — comme la porte d'entrée où tu montres ton badge
import LoginPage from "./pages/LoginPage";
// On importe la page d'inscription — c'est là qu'on te fabrique ton badge pour la première fois
import RegisterPage from "./pages/RegisterPage";
// On importe la page d'administration — réservée aux chefs, pour gérer tout le contenu
import AdminPage from "./pages/AdminPage";
// On importe la page de création de build — c'est l'atelier où tu crées ta propre recette
import BuildCreatePage from "./pages/BuildCreatePage";

// On déclare la fonction App — c'est le composant principal, le chef d'orchestre de toute l'application
function App() {
    // La fonction retourne du JSX — c'est du HTML amélioré que React comprend
    return (
        // BrowserRouter active le système de navigation — c'est le GPS qui écoute l'URL du navigateur
        <BrowserRouter>
            {/* Routes contient toutes les routes possibles — c'est la carte avec toutes les destinations */}
            <Routes>
                {/* Cette Route parent utilise le Layout — toutes les routes enfants auront la barre de nav */}
                {/* C'est comme dire "toutes ces pages partagent le même cadre" */}
                <Route element={<Layout />}>
                    {/* La route "/" est la page d'accueil — elle affiche la liste des agents */}
                    <Route path="/" element={<AgentsPage />} />
                    {/* La route "/agents/:id" affiche le détail d'un agent — le ":id" est remplacé par le vrai identifiant */}
                    {/* C'est comme dire "va voir l'agent numéro X" */}
                    <Route path="/agents/:id" element={<AgentDetailPage />} />
                    {/* La route "/builds" affiche la liste de tous les builds disponibles */}
                    <Route path="/builds" element={<BuildsPage />} />
                    {/* La route "/builds/create" affiche le formulaire pour créer un nouveau build */}
                    <Route path="/builds/create" element={<BuildCreatePage />} />
                    {/* La route "/builds/:id" affiche le détail d'un build spécifique — le ":id" sera remplacé dynamiquement */}
                    <Route path="/builds/:id" element={<BuildDetailPage />} />
                    {/* La route "/profile" affiche la page de profil de l'utilisateur connecté */}
                    <Route path="/profile" element={<ProfilePage />} />
                    {/* La route "/admin" affiche le panneau d'administration — seulement pour les admins */}
                    <Route path="/admin" element={<AdminPage />} />
                {/* Fin de la Route parent avec Layout — les routes en dessous n'auront PAS la barre de nav */}
                </Route>
                {/* La page de connexion est EN DEHORS du Layout — pas de barre de nav, écran dédié */}
                <Route path="/login" element={<LoginPage />} />
                {/* La page d'inscription aussi est en dehors du Layout — écran plein pour s'inscrire */}
                <Route path="/register" element={<RegisterPage />} />
            {/* Fin de la liste des Routes */}
            </Routes>
        {/* Fin du BrowserRouter — le GPS est éteint */}
        </BrowserRouter>
    );
// Fin de la fonction App
}

// On exporte App pour que main.tsx puisse l'utiliser — c'est comme mettre le composant dans une boîte prête à être livrée
export default App;
