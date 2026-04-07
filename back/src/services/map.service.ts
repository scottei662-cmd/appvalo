// On importe la connexion à la base de données (le "pont" qui relie notre code à la base)
import db from "@/lib/db";
// On importe les types pour créer et modifier une map (les "moules" qui décrivent la forme des données)
import type { CreateMapDto, UpdateMapDto } from "@/dtos/map.dto";

// Cette fonction récupère toutes les maps disponibles dans la base de données
// C'est comme demander "montre-moi tous les terrains de jeu qui existent"
export const getAllMaps = async () => {
    // On demande à Prisma de récupérer toutes les maps sans aucun filtre
    return db.map.findMany();
};

// Cette fonction récupère une seule map par son identifiant unique
// C'est comme chercher un terrain de jeu précis par son numéro
export const getMapById = async (id: string) => {
    // On cherche une map unique avec cet id dans la base
    const map = await db.map.findUnique({
        // On filtre par l'id fourni
        where: { id }
    });

    // On retourne la map trouvée (ou null si elle n'existe pas)
    return map;
};

// Cette fonction crée une nouvelle map dans la base de données
// C'est comme ajouter un nouveau terrain de jeu à la liste
export const createMap = async (data: CreateMapDto) => {
    // On crée la map avec les données fournies (nom, image, etc.)
    return db.map.create({ data });
};

// Cette fonction met à jour une map existante
// C'est comme modifier les informations d'un terrain de jeu déjà enregistré
export const updateMap = async (id: string, data: UpdateMapDto) => {
    // On vérifie d'abord que la map existe dans la base
    const existing = await db.map.findUnique({ where: { id } });
    // Si la map n'existe pas, on retourne null (on ne peut pas modifier ce qui n'existe pas)
    if (!existing) return null;

    // On met à jour la map avec les nouvelles données
    return db.map.update({
        // On cible la map avec cet id
        where: { id },
        // On passe les nouvelles données à enregistrer
        data
    });
};

// Cette fonction supprime une map de la base de données
// C'est comme retirer un terrain de jeu de la liste définitivement
export const deleteMap = async (id: string) => {
    // On vérifie que la map existe avant de la supprimer
    const existing = await db.map.findUnique({ where: { id } });
    // Si la map n'existe pas, on retourne null
    if (!existing) return null;

    // On supprime la map de la base de données
    await db.map.delete({ where: { id } });
    // On retourne true pour confirmer que la suppression a réussi
    return true;
};
