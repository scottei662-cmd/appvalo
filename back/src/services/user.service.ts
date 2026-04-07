// On importe la connexion à la base de données (notre outil pour parler à la base)
import db from "@/lib/db";

// Cette fonction récupère le profil d'un utilisateur par son identifiant
// C'est comme aller chercher la fiche d'un joueur dans le classeur des membres
export const getUserProfile = async (userId: string) => {
    // On cherche un utilisateur unique dans la base avec cet id
    const user = await db.user.findUnique({
        // On filtre par l'id de l'utilisateur
        where: { id: userId },
        // On sélectionne seulement les champs qu'on veut retourner (pas tout, pour des raisons de sécurité)
        // C'est comme choisir quelles infos montrer sur la fiche du joueur
        select: {
            // L'identifiant unique de l'utilisateur
            id: true,
            // Le nom affiché de l'utilisateur
            name: true,
            // Le nom de jeu Valorant (le pseudo en jeu)
            gameName: true,
            // Le tag Valorant (le numéro après le #, comme #1234)
            tagLine: true,
            // L'adresse email de l'utilisateur
            email: true,
            // L'URL de la photo de profil
            image: true,
            // Le rôle de l'utilisateur (admin, utilisateur normal, etc.)
            role: true,
            // La date de création du compte
            createdAt: true,
        }
    });

    // On retourne l'utilisateur trouvé (ou null s'il n'existe pas)
    return user;
};

// Cette fonction met à jour le profil d'un utilisateur
// C'est comme modifier la fiche d'un joueur avec de nouvelles informations
// On peut changer le nom de jeu, le tag, l'image de profil ou le nom affiché
export const updateUserProfile = async (userId: string, data: { gameName?: string; tagLine?: string; image?: string; name?: string }) => {
    // On met à jour l'utilisateur dans la base de données
    return db.user.update({
        // On cible l'utilisateur avec cet id
        where: { id: userId },
        // On passe les nouvelles données (seulement les champs fournis seront modifiés)
        data,
        // On sélectionne les mêmes champs que dans getUserProfile pour le résultat
        // C'est pour retourner la fiche mise à jour au joueur
        select: {
            // L'identifiant unique
            id: true,
            // Le nom affiché
            name: true,
            // Le nom de jeu Valorant
            gameName: true,
            // Le tag Valorant
            tagLine: true,
            // L'email
            email: true,
            // L'image de profil
            image: true,
            // Le rôle
            role: true,
            // La date de création du compte
            createdAt: true,
        }
    });
};
