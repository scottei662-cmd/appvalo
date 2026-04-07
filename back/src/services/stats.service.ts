// L'adresse de base de l'API Henrik, c'est comme l'adresse de la maison où on va chercher les infos Valorant
const BASE_URL = "https://api.henrikdev.xyz";
// La clé secrète pour parler à l'API Henrik, c'est comme un mot de passe pour entrer dans la maison
const API_KEY = process.env.HENRIK_API_KEY;
// La région par défaut est "eu" (Europe), c'est comme dire "on joue en Europe si personne ne précise"
const DEFAULT_REGION = "eu";
// La plateforme par défaut est "pc", c'est comme dire "on joue sur ordinateur si personne ne précise"
const DEFAULT_PLATFORM = "pc";

// Cette fonction va chercher des données sur l'API Henrik, c'est comme un facteur qui va chercher un colis à une adresse précise
const fetchHenrik = async (path: string) => {
    // On envoie une requête à l'API en combinant l'adresse de base et le chemin, comme coller l'adresse de la rue au numéro de la maison
    const res = await fetch(`${BASE_URL}${path}`, {
        // On ajoute notre clé secrète dans l'en-tête, comme montrer son badge pour entrer dans un bâtiment
        headers: {
            // On met la clé API, ou une chaîne vide si elle n'existe pas (comme montrer un badge vide)
            "Authorization": API_KEY || ""
        }
    });

    // Si la réponse n'est pas bonne (erreur), on gère le problème
    if (!res.ok) {
        // On essaie de lire le message d'erreur renvoyé par l'API, et si ça échoue on met un objet vide
        const errBody: any = await res.json().catch(() => ({}));
        // On lance une erreur avec le code de statut et le message, comme crier "il y a un problème !" en disant lequel
        throw { status: res.status, message: errBody.message || "Erreur API HenrikDev" };
    }

    // Si tout va bien, on renvoie les données en format JSON, comme ouvrir le colis et en sortir le contenu
    return res.json();
};

// Cette fonction récupère les infos d'un compte Valorant à partir du nom et du tag (ex: Joueur#1234)
export const getAccount = async (name: string, tag: string) => {
    // On appelle fetchHenrik avec le chemin vers les infos du compte, en encodant le nom et le tag pour éviter les caractères spéciaux (comme mettre une lettre dans une enveloppe propre)
    return fetchHenrik(`/valorant/v2/account/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`);
};

// Cette fonction récupère le MMR (le rang/classement) d'un joueur, c'est comme aller voir son bulletin de notes
export const getMMR = async (name: string, tag: string, region = DEFAULT_REGION) => {
    // On appelle fetchHenrik avec le chemin vers le MMR, en incluant la région, la plateforme, le nom et le tag
    return fetchHenrik(`/valorant/v3/mmr/${region}/${DEFAULT_PLATFORM}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`);
};

// Cette fonction récupère l'historique du MMR d'un joueur, c'est comme regarder l'évolution de ses notes au fil du temps
export const getMMRHistory = async (name: string, tag: string, region = DEFAULT_REGION) => {
    // On appelle fetchHenrik avec le chemin vers l'historique du MMR
    return fetchHenrik(`/valorant/v2/mmr-history/${region}/${DEFAULT_PLATFORM}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`);
};

// Cette fonction récupère les derniers matchs d'un joueur, c'est comme feuilleter son album de parties jouées
export const getMatches = async (name: string, tag: string, region = DEFAULT_REGION, size = 5, mode = "competitive") => {
    // On appelle fetchHenrik avec le chemin vers les matchs, en précisant combien on en veut (size) et quel mode de jeu (competitive par défaut)
    return fetchHenrik(`/valorant/v4/matches/${region}/${DEFAULT_PLATFORM}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?size=${size}&mode=${mode}`);
};

// Cette fonction récupère les matchs stockés/enregistrés d'un joueur, c'est comme aller chercher des parties sauvegardées dans un coffre
export const getStoredMatches = async (name: string, tag: string, region = DEFAULT_REGION, mode = "competitive") => {
    // On appelle fetchHenrik avec le chemin vers les matchs stockés, en précisant le mode de jeu
    return fetchHenrik(`/valorant/v1/stored-matches/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?mode=${mode}`);
};

// Cette fonction récupère les détails d'un match précis grâce à son identifiant, c'est comme retrouver une partie spécifique dans un tiroir avec son numéro
export const getMatchById = async (matchId: string, region = DEFAULT_REGION) => {
    // On appelle fetchHenrik avec le chemin vers le match spécifique, en encodant l'identifiant du match
    return fetchHenrik(`/valorant/v4/match/${region}/${encodeURIComponent(matchId)}`);
};
