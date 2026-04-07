// L'URL de base de notre serveur API — c'est l'adresse du "restaurant" où on va chercher nos données
// En développement, le serveur tourne sur notre machine (localhost) sur le port 3000
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Fonction générique pour faire des requêtes HTTP au serveur — c'est le livreur qui va chercher les commandes
// Elle prend un chemin (path) et des options facultatives (méthode, corps, headers, etc.)
// On la réutilise partout pour ne pas réécrire le même code à chaque fois — c'est le facteur commun
async function request(path: string, options?: RequestInit) {
    // On fait la requête avec fetch — c'est comme envoyer une lettre au serveur et attendre la réponse
    const res = await fetch(`${API_URL}${path}`, {
        // On copie toutes les options passées en paramètre (méthode, body, etc.)
        ...options,
        // "credentials: include" envoie les cookies avec la requête — c'est notre badge d'identité
        // Sans ça, le serveur ne saurait pas qui on est
        credentials: "include",
        // On définit les headers (en-têtes) de la requête
        headers: {
            // On dit au serveur qu'on envoie du JSON — c'est le format des données, comme une langue commune
            "Content-Type": "application/json",
            // On ajoute les headers supplémentaires s'il y en a — pour personnaliser la requête
            ...options?.headers,
        },
    });

    // Si la réponse n'est pas OK (code 400, 500, etc.) — le serveur nous dit qu'il y a un problème
    if (!res.ok) {
        // On essaie de lire le message d'erreur du serveur en JSON — pour savoir ce qui s'est passé
        // Si ça échoue (le serveur n'a pas renvoyé de JSON), on met un message par défaut
        const error = await res.json().catch(() => ({ message: "Erreur serveur" }));
        // On lance une erreur avec le message du serveur — comme lever la main pour dire "il y a un problème !"
        throw new Error(error.message || "Erreur serveur");
    }

    // Si le statut est 204 (No Content) — le serveur dit "c'est fait, mais je n'ai rien à te montrer"
    // On retourne null car il n'y a pas de données à lire
    if (res.status === 204) return null;
    // Sinon, on lit et retourne la réponse en JSON — on "ouvre le colis" pour voir ce qu'il y a dedans
    return res.json();
}

// ===== AGENTS =====
// Fonction pour récupérer la liste de tous les agents — comme demander le catalogue des personnages
// Si on passe un terme de recherche (search), on filtre les agents par leur titre
export const getAgents = (search?: string) =>
    request(`/agents${search ? `?title=${search}` : ""}`);
// Fonction pour récupérer un seul agent par son identifiant — comme ouvrir la fiche d'un personnage précis
export const getAgent = (id: string) => request(`/agents/${id}`);
// Fonction pour créer un nouvel agent — comme ajouter un nouveau personnage au catalogue
// On envoie les données en POST (méthode pour créer) avec le corps en JSON
export const createAgent = (data: Record<string, unknown>) =>
    request("/agents", { method: "POST", body: JSON.stringify(data) });
// Fonction pour modifier un agent existant — comme corriger la fiche d'un personnage
// On utilise PUT (méthode pour remplacer) avec l'id de l'agent à modifier
export const updateAgent = (id: string, data: Record<string, unknown>) =>
    request(`/agents/${id}`, { method: "PUT", body: JSON.stringify(data) });
// Fonction pour supprimer un agent — comme retirer un personnage du catalogue
// On utilise DELETE (méthode pour supprimer) avec l'id de l'agent
export const deleteAgent = (id: string) =>
    request(`/agents/${id}`, { method: "DELETE" });

// ===== MAPS (CARTES) =====
// Fonction pour récupérer la liste de toutes les cartes du jeu — les terrains de jeu
export const getMaps = () => request("/maps");
// Fonction pour récupérer une carte par son identifiant — voir les détails d'un terrain
export const getMap = (id: string) => request(`/maps/${id}`);
// Fonction pour créer une nouvelle carte — ajouter un nouveau terrain au jeu
export const createMap = (data: Record<string, unknown>) =>
    request("/maps", { method: "POST", body: JSON.stringify(data) });
// Fonction pour modifier une carte existante — changer les infos d'un terrain
export const updateMap = (id: string, data: Record<string, unknown>) =>
    request(`/maps/${id}`, { method: "PUT", body: JSON.stringify(data) });
// Fonction pour supprimer une carte — retirer un terrain du jeu
export const deleteMap = (id: string) =>
    request(`/maps/${id}`, { method: "DELETE" });

// ===== WEAPONS (ARMES) =====
// Fonction pour récupérer la liste des armes — l'arsenal disponible
// On peut filtrer par catégorie (pistolet, fusil, etc.) si on le souhaite
export const getWeapons = (category?: string) =>
    request(`/weapons${category ? `?category=${category}` : ""}`);
// Fonction pour récupérer une arme par son identifiant — voir les stats d'une arme précise
export const getWeapon = (id: string) => request(`/weapons/${id}`);
// Fonction pour créer une nouvelle arme — ajouter une arme à l'arsenal
export const createWeapon = (data: Record<string, unknown>) =>
    request("/weapons", { method: "POST", body: JSON.stringify(data) });
// Fonction pour modifier une arme existante — changer les caractéristiques d'une arme
export const updateWeapon = (id: string, data: Record<string, unknown>) =>
    request(`/weapons/${id}`, { method: "PUT", body: JSON.stringify(data) });
// Fonction pour supprimer une arme — retirer une arme de l'arsenal
export const deleteWeapon = (id: string) =>
    request(`/weapons/${id}`, { method: "DELETE" });

// ===== BUILDS (CONFIGURATIONS DE JEU) =====
// Fonction pour récupérer la liste des builds — les recettes/configurations créées par les joueurs
// On peut filtrer par agent (agentId) ou par utilisateur (userId) pour voir les builds spécifiques
export const getBuilds = (agentId?: string, userId?: string) => {
    // On crée un objet URLSearchParams — c'est un outil pour construire proprement les paramètres d'URL
    const params = new URLSearchParams();
    // Si un agentId est fourni, on l'ajoute aux paramètres de recherche
    if (agentId) params.set("agentId", agentId);
    // Si un userId est fourni, on l'ajoute aussi — on peut combiner les filtres
    if (userId) params.set("userId", userId);
    // On transforme les paramètres en texte — par exemple "agentId=123&userId=456"
    const query = params.toString();
    // On fait la requête avec les paramètres s'il y en a, sinon sans — comme ajouter des filtres à une recherche
    return request(`/builds${query ? `?${query}` : ""}`);
};
// Fonction pour récupérer un seul build par son identifiant — voir les détails d'une configuration
export const getBuild = (id: string) => request(`/builds/${id}`);
// Fonction pour créer un nouveau build — comme écrire une nouvelle recette de jeu
// "any" est utilisé car les données du build ont une structure complexe et variable
export const createBuild = (data: any) =>
    request("/builds", { method: "POST", body: JSON.stringify(data) });
// Fonction pour modifier un build existant — corriger ou améliorer une recette
export const updateBuild = (id: string, data: any) =>
    request(`/builds/${id}`, { method: "PUT", body: JSON.stringify(data) });
// Fonction pour supprimer un build — effacer une configuration
export const deleteBuild = (id: string) =>
    request(`/builds/${id}`, { method: "DELETE" });

// ===== STATS (STATISTIQUES DE JEU) =====
// Fonction pour récupérer le compte d'un joueur Valorant — ses infos de base avec son nom et tag
// Le nom et le tag forment l'identifiant unique du joueur (ex: Joueur#1234)
export const getAccount = (name: string, tag: string) =>
    request(`/stats/account/${name}/${tag}`);
// Fonction pour récupérer le MMR (Match Making Rating) — le niveau/rang du joueur
// C'est comme la note qui dit si tu es débutant, intermédiaire ou expert
export const getMMR = (name: string, tag: string) =>
    request(`/stats/mmr/${name}/${tag}`);
// Fonction pour récupérer les derniers matchs d'un joueur — son historique de parties récentes
// "size" est le nombre de matchs à récupérer, par défaut 5 — comme demander les 5 dernières notes
export const getMatches = (name: string, tag: string, size = 5) =>
    request(`/stats/matches/${name}/${tag}?size=${size}`);
// Fonction pour récupérer les matchs stockés dans notre base de données — pas ceux de l'API Valorant directement
// C'est notre propre copie des données, pour ne pas toujours demander à l'API externe
export const getStoredMatches = (name: string, tag: string) =>
    request(`/stats/stored-matches/${name}/${tag}`);

// ===== USER (UTILISATEUR) =====
// Fonction pour récupérer les infos de l'utilisateur connecté — "moi, qui suis-je ?"
// Le serveur sait qui on est grâce aux cookies envoyés automatiquement
export const getMe = () => request("/users/me");
// Fonction pour modifier les infos de l'utilisateur connecté — mettre à jour son profil
export const updateMe = (data: any) =>
    request("/users/me", { method: "PUT", body: JSON.stringify(data) });

// ===== IMAGES (UPLOAD VIA CLOUDINARY) =====
// Fonction spéciale pour uploader une image — elle ne peut pas utiliser la fonction request()
// car elle envoie un fichier (FormData) et pas du JSON — c'est comme envoyer un colis au lieu d'une lettre
export async function uploadImage(file: File): Promise<{ id: number; url: string; publicId: string }> {
    // On crée un FormData — c'est un formulaire virtuel qui peut contenir des fichiers
    // Comme un formulaire papier avec une enveloppe pour joindre des pièces
    const formData = new FormData();
    // On ajoute le fichier image au formulaire avec le nom "image" — le serveur cherchera ce nom
    formData.append("image", file);

    // On envoie le formulaire au serveur avec fetch — en POST car on crée quelque chose
    const res = await fetch(`${API_URL}/images`, {
        // Méthode POST — on envoie un nouveau fichier au serveur
        method: "POST",
        // On inclut les cookies — pour que le serveur sache qui envoie l'image
        credentials: "include",
        // Le corps de la requête est le FormData avec notre image dedans
        // Pas de Content-Type ici ! Le navigateur le met automatiquement avec le bon "boundary" pour les fichiers
        body: formData,
    });

    // Si le serveur répond avec une erreur — l'upload a échoué
    if (!res.ok) {
        // On essaie de lire le message d'erreur — pour comprendre pourquoi ça n'a pas marché
        const error = await res.json().catch(() => ({ message: "Erreur upload" }));
        // On lance une erreur avec le message — comme dire "ton colis n'a pas pu être livré parce que..."
        throw new Error(error.message || "Erreur upload");
    }

    // Si tout va bien, on retourne les infos de l'image uploadée — son id, son URL et son identifiant Cloudinary
    // C'est comme recevoir un récépissé avec l'adresse où l'image est stockée
    return res.json();
}
