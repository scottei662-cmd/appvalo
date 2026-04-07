// On importe la connexion à la base de données (notre outil pour communiquer avec la base)
import db from "@/lib/db";
// On importe les types pour créer et modifier une arme (les "modèles" qui définissent quelles données on attend)
import type { CreateWeaponDto, UpdateWeaponDto } from "@/dtos/weapon.dto";

// Cette fonction récupère toutes les armes, avec un filtre optionnel par catégorie
// C'est comme demander "montre-moi toutes les armes, ou seulement les fusils d'assaut"
export const getAllWeapons = async (category?: string) => {
    // On demande à Prisma de chercher plusieurs armes dans la table "weapon"
    return db.weapon.findMany({
        // On construit le filtre de recherche
        where: {
            // Si une catégorie est fournie, on filtre les armes de cette catégorie
            // Le "as any" force TypeScript à accepter la valeur (car la catégorie est un enum en base)
            // Si pas de catégorie, on met un objet vide (on prend toutes les armes)
            ...(category ? { category: category as any } : {})
        }
    });
};

// Cette fonction récupère une seule arme par son identifiant unique
// C'est comme chercher une arme précise dans l'armurerie par son numéro
export const getWeaponById = async (id: string) => {
    // On cherche une arme unique avec cet id dans la base
    const weapon = await db.weapon.findUnique({
        // On filtre par l'id fourni
        where: { id }
    });

    // On retourne l'arme trouvée (ou null si elle n'existe pas)
    return weapon;
};

// Cette fonction crée une nouvelle arme dans la base de données
// C'est comme ajouter une nouvelle arme à l'armurerie
export const createWeapon = async (data: CreateWeaponDto) => {
    // On crée l'arme avec les données fournies (nom, catégorie, dégâts, etc.)
    return db.weapon.create({ data });
};

// Cette fonction met à jour une arme existante
// C'est comme modifier les caractéristiques d'une arme déjà dans l'armurerie
export const updateWeapon = async (id: string, data: UpdateWeaponDto) => {
    // On vérifie d'abord que l'arme existe dans la base
    const existing = await db.weapon.findUnique({ where: { id } });
    // Si l'arme n'existe pas, on retourne null (on ne peut pas modifier ce qui n'existe pas)
    if (!existing) return null;

    // On met à jour l'arme avec les nouvelles données
    return db.weapon.update({
        // On cible l'arme avec cet id
        where: { id },
        // On passe les nouvelles données à enregistrer
        data
    });
};

// Cette fonction supprime une arme de la base de données
// C'est comme retirer une arme de l'armurerie définitivement
export const deleteWeapon = async (id: string) => {
    // On vérifie que l'arme existe avant de la supprimer
    const existing = await db.weapon.findUnique({ where: { id } });
    // Si l'arme n'existe pas, on retourne null
    if (!existing) return null;

    // On supprime l'arme de la base de données
    await db.weapon.delete({ where: { id } });
    // On retourne true pour confirmer que la suppression a réussi
    return true;
};
