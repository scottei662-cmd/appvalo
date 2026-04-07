// On importe la connexion à la base de données (comme ouvrir le carnet d'adresses de l'application)
import db from "@/lib/db";
// On importe les types qui décrivent la forme des données pour créer ou modifier un agent (comme un formulaire à remplir)
import type { CreateAgentDto, UpdateAgentDto } from "@/dtos/agent.dto";

// Cette fonction récupère tous les agents depuis la base de données, avec un filtre optionnel par nom
// C'est comme demander "donne-moi la liste de tous les personnages, ou seulement ceux dont le nom contient tel mot"
export const getAllAgents = async (search?: string) => {
    // On demande à Prisma de chercher plusieurs agents dans la table "agent"
    return db.agent.findMany({
        // On construit la clause "where" (le filtre de recherche)
        where: {
            // Si un texte de recherche est fourni, on filtre les agents dont le nom contient ce texte
            // Le "mode: insensitive" signifie qu'on ignore les majuscules/minuscules (comme si "Jett" et "jett" étaient pareils)
            // Si pas de recherche, on met un objet vide {} donc aucun filtre (on prend tout)
            ...(search ? { name: { contains: search, mode: "insensitive" } } : {})
        },
        // On inclut les abilities (pouvoirs) de chaque agent dans le résultat
        // C'est comme dire "et n'oublie pas de me montrer aussi leurs pouvoirs spéciaux"
        include: { abilities: true }
    });
};

// Cette fonction récupère un seul agent par son identifiant unique (son "numéro de carte d'identité")
export const getAgentById = async (id : string) => {
    // On cherche un agent unique dans la base avec cet id précis
    const agent = await db.agent.findUnique({
        // On filtre par l'id fourni (comme chercher quelqu'un par son numéro)
        where : {id},
        // On inclut aussi ses abilities (pouvoirs) dans la réponse
        include: {abilities : true}
    });

    // On retourne l'agent trouvé (ou null si personne n'a cet id)
    return agent
};

/**
 * @description Cree un agent avec ses abilities en une seule transaction
 */
// Cette fonction crée un nouvel agent dans la base de données
// C'est comme ajouter un nouveau personnage au jeu avec tous ses pouvoirs d'un coup
export const createAgent = async (data : CreateAgentDto) => {
    // On sépare les abilities (pouvoirs) du reste des données de l'agent
    // C'est comme trier le courrier : d'un côté les infos du personnage, de l'autre ses pouvoirs
    const { abilities, ...agentData } = data;

    // On crée l'agent dans la base de données
    return db.agent.create({
        // On passe les données pour créer l'agent
        data: {
            // On étale toutes les données de l'agent (nom, description, etc.)
            ...agentData,
            // Si fullPortrait n'est pas fourni, on met null (pas d'image portrait complet)
            fullPortrait: agentData.fullPortrait ?? null,
            // Si background n'est pas fourni, on met null (pas d'image de fond)
            background: agentData.background ?? null,
            // Si des abilities sont fournies, on les crée en même temps que l'agent
            // C'est comme inscrire un élève et l'inscrire à ses cours en même temps
            // Si pas d'abilities, on met undefined (on n'y touche pas)
            abilities: abilities ? {
                create: abilities
            } : undefined,
        },
        // On demande que le résultat inclue les abilities créées
        include: { abilities: true }
    });
};

/**
 * @description Met a jour un agent et remplace ses abilities si fournies
 */
// Cette fonction met à jour un agent existant dans la base de données
// C'est comme modifier la fiche d'un personnage déjà existant
export const updateAgent = async (id: string, data : UpdateAgentDto) => {
    // D'abord, on vérifie que l'agent existe bien dans la base de données
    const existing = await db.agent.findUnique({where : {id}});
    // Si l'agent n'existe pas, on retourne null (on ne peut pas modifier quelqu'un qui n'existe pas)
    if(!existing) return null;

    // On sépare les abilities du reste des données, comme à la création
    const { abilities, ...agentData } = data;

    // Si de nouvelles abilities sont fournies, on supprime d'abord toutes les anciennes
    // C'est comme effacer l'ancienne liste de pouvoirs avant d'écrire la nouvelle
    if (abilities) {
        await db.ability.deleteMany({ where: { agentId: id } });
    }

    // On met à jour l'agent avec les nouvelles données
    return db.agent.update({
        // On cible l'agent avec cet id
        where: { id },
        // On passe les nouvelles données
        data: {
            // On étale les données mises à jour de l'agent
            ...agentData,
            // Si des abilities sont fournies, on les recrée (les anciennes ont été supprimées juste avant)
            // Sinon on ne touche pas aux abilities existantes
            abilities: abilities ? {
                create: abilities
            } : undefined,
        },
        // On inclut les abilities dans le résultat retourné
        include: { abilities: true }
    });
};

// Cette fonction supprime un agent de la base de données
// C'est comme retirer définitivement un personnage du jeu
export const deleteAgent = async (id: string) => {
    // On vérifie d'abord que l'agent existe
    const existing = await db.agent.findUnique({where : {id}});
    // Si l'agent n'existe pas, on retourne null (on ne peut pas supprimer ce qui n'existe pas)
    if(!existing) return null;

    // On supprime l'agent de la base de données
    await db.agent.delete({where : {id}});
    // On retourne true pour confirmer que la suppression a réussi
    return true;
};
