// On importe la connexion à la base de données (notre carnet d'adresses pour parler à la base)
import db from "@/lib/db";
// On importe les types pour créer et modifier un build (les "formulaires" qui décrivent les données attendues)
import type { CreateBuildDto, UpdateBuildDto } from "@/dtos/build.dto";

// Cette fonction récupère tous les builds, avec des filtres optionnels par agent et/ou utilisateur
// Un build c'est comme une recette de jeu : quel agent, quelles armes, quelles maps
export const getAllBuilds = async (agentId?: string, userId?: string) => {
    // On demande à Prisma de chercher plusieurs builds dans la table "build"
    return db.build.findMany({
        // On construit les filtres de recherche
        where: {
            // Si un agentId est fourni, on ne garde que les builds de cet agent
            ...(agentId ? { agentId } : {}),
            // Si un userId est fourni, on ne garde que les builds de cet utilisateur
            ...(userId ? { userId } : {})
        },
        // On inclut les données liées pour avoir un résultat complet
        include: {
            // On inclut les infos de l'agent associé au build
            agent: true,
            // On inclut les infos de l'utilisateur qui a créé le build, mais seulement id, nom et image (pas le mot de passe ni l'email)
            user: { select: { id: true, name: true, image: true } },
            // On inclut les maps liées au build, avec les détails de chaque map
            maps: { include: { map: true } },
            // On inclut les armes liées au build, avec les détails de chaque arme
            weapons: { include: { weapon: true } }
        },
        // On trie les résultats par date de dernière modification, les plus récents en premier
        // C'est comme trier ses devoirs du plus récent au plus ancien
        orderBy: { updatedAt: "desc" }
    });
};

// Cette fonction récupère un seul build par son identifiant unique
// C'est comme ouvrir une recette précise dans un livre de recettes
export const getBuildById = async (id: string) => {
    // On cherche un build unique avec cet id dans la base
    const build = await db.build.findUnique({
        // On filtre par l'id fourni
        where: { id },
        // On inclut toutes les données liées, comme pour getAllBuilds
        include: {
            // L'agent associé au build
            agent: true,
            // L'utilisateur créateur (seulement les infos publiques)
            user: { select: { id: true, name: true, image: true } },
            // Les maps liées avec leurs détails
            maps: { include: { map: true } },
            // Les armes liées avec leurs détails
            weapons: { include: { weapon: true } }
        }
    });

    // On retourne le build trouvé (ou null s'il n'existe pas)
    return build;
};

// Cette fonction crée un nouveau build dans la base de données
// C'est comme écrire une nouvelle recette : on dit quel agent, quelles maps, quelles armes
export const createBuild = async (userId: string, data: CreateBuildDto) => {
    // On crée le build dans la base de données
    return db.build.create({
        // On passe toutes les données du build
        data: {
            // Le nom du build (ex: "Jett agressive")
            name: data.name,
            // Le style de jeu (ex: "offensif", "défensif")
            gameplay: data.gameplay,
            // Les notes optionnelles, si pas fournies on met null
            notes: data.notes ?? null,
            // L'id de l'agent choisi pour ce build
            agentId: data.agentId,
            // L'id de l'utilisateur qui crée le build (celui qui est connecté)
            userId,
            // On crée les relations avec les maps choisies
            // C'est comme cocher les maps sur lesquelles cette recette marche bien
            maps: {
                // Pour chaque mapId dans la liste, on crée une entrée dans la table de liaison
                create: data.mapIds.map(mapId => ({ mapId }))
            },
            // On crée les relations avec les armes choisies
            // C'est comme lister les armes recommandées pour cette recette
            weapons: {
                // Pour chaque weaponId dans la liste, on crée une entrée dans la table de liaison
                create: data.weaponIds.map(weaponId => ({ weaponId }))
            }
        },
        // On inclut les données liées dans le résultat retourné
        include: {
            // L'agent associé
            agent: true,
            // Les maps avec leurs détails
            maps: { include: { map: true } },
            // Les armes avec leurs détails
            weapons: { include: { weapon: true } }
        }
    });
};

// Cette fonction met à jour un build existant
// C'est comme modifier une recette déjà écrite dans le livre
export const updateBuild = async (id: string, userId: string, data: UpdateBuildDto) => {
    // On vérifie que le build existe dans la base
    const existing = await db.build.findUnique({ where: { id } });
    // Si le build n'existe pas, on retourne null
    if (!existing) return null;
    // Si l'utilisateur qui essaie de modifier n'est pas le créateur du build, on refuse
    // C'est comme dire "tu ne peux pas modifier la recette de quelqu'un d'autre"
    if (existing.userId !== userId) return "forbidden";

    // Si on met à jour les maps ou weapons, on supprime les anciens et on recrée
    // On construit l'objet de mise à jour avec seulement les champs fournis
    // Le type "any" permet d'être flexible sur la forme de cet objet
    const updateData: any = {
        // Si un nouveau nom est fourni, on le met à jour
        ...(data.name ? { name: data.name } : {}),
        // Si un nouveau gameplay est fourni, on le met à jour
        ...(data.gameplay ? { gameplay: data.gameplay } : {}),
        // Si les notes sont explicitement fournies (même vides), on les met à jour, sinon on ne touche pas
        ...(data.notes !== undefined ? { notes: data.notes ?? null } : {}),
        // Si un nouvel agentId est fourni, on change l'agent du build
        ...(data.agentId ? { agentId: data.agentId } : {}),
    };

    // Si de nouvelles maps sont fournies, on remplace toutes les anciennes
    if (data.mapIds) {
        // On configure la mise à jour des maps
        updateData.maps = {
            // D'abord on supprime toutes les anciennes liaisons maps (on fait table rase)
            deleteMany: {},
            // Puis on crée les nouvelles liaisons avec les maps choisies
            create: data.mapIds.map(mapId => ({ mapId }))
        };
    }

    // Si de nouvelles armes sont fournies, on remplace toutes les anciennes
    if (data.weaponIds) {
        // On configure la mise à jour des armes
        updateData.weapons = {
            // D'abord on supprime toutes les anciennes liaisons armes
            deleteMany: {},
            // Puis on crée les nouvelles liaisons avec les armes choisies
            create: data.weaponIds.map(weaponId => ({ weaponId }))
        };
    }

    // On exécute la mise à jour dans la base de données
    return db.build.update({
        // On cible le build avec cet id
        where: { id },
        // On passe les données à mettre à jour
        data: updateData,
        // On inclut les données liées dans le résultat
        include: {
            // L'agent associé
            agent: true,
            // Les maps avec leurs détails
            maps: { include: { map: true } },
            // Les armes avec leurs détails
            weapons: { include: { weapon: true } }
        }
    });
};

// Cette fonction supprime un build de la base de données
// C'est comme arracher une page du livre de recettes
export const deleteBuild = async (id: string, userId: string) => {
    // On vérifie que le build existe
    const existing = await db.build.findUnique({ where: { id } });
    // Si le build n'existe pas, on retourne null
    if (!existing) return null;
    // Si l'utilisateur n'est pas le créateur, on refuse la suppression
    if (existing.userId !== userId) return "forbidden";

    // On supprime le build de la base
    await db.build.delete({ where: { id } });
    // On retourne true pour confirmer la suppression
    return true;
};
