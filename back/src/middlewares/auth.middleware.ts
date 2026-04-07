// On importe les types Request, Response et NextFunction depuis Express
// Request = la demande du client (ce qu'il veut), Response = la réponse du serveur (ce qu'on lui renvoie)
// NextFunction = la fonction qui dit "ok, passe au prochain middleware ou à la route"
// C'est comme les rôles dans un guichet : le client fait une demande, l'employé répond, et il peut passer au suivant
import { Request, Response, NextFunction } from "express"
// On importe fromNodeHeaders, une fonction qui convertit les headers Express en headers compatibles Better Auth
// C'est comme un traducteur qui transforme le format des en-têtes pour que Better Auth puisse les lire
import { fromNodeHeaders } from "better-auth/node"
// On importe notre instance d'authentification qu'on a configurée dans auth.ts
// C'est le gardien qui vérifie les identités des utilisateurs
import { auth } from "@/lib/auth"

// On déclare une extension globale du type Request d'Express
// C'est comme ajouter une poche supplémentaire au sac à dos de chaque requête
// Cette poche s'appelle "userId" et pourra contenir l'identifiant de l'utilisateur connecté
declare global {
    // On étend le namespace Express pour ajouter des propriétés personnalisées
    namespace Express{
        // On modifie l'interface Request pour y ajouter notre propriété userId
        interface Request {
            // userId est optionnel (?) car au début de la requête, on ne sait pas encore qui est l'utilisateur
            // C'est un string qui contiendra l'identifiant unique de l'utilisateur une fois vérifié
            userId?: string;
        }
    }
};

/**
 * @description Middleware d'authentification — verifie que l'utilisateur a une session valide
 */
// On crée et exporte le middleware d'authentification
// Un middleware, c'est comme un vigile à l'entrée d'un club : il vérifie ton identité avant de te laisser passer
// C'est une fonction asynchrone car elle doit attendre la vérification de la session (ça prend du temps)
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    // On entoure tout dans un try/catch pour attraper les erreurs inattendues
    // C'est comme un filet de sécurité : si quelque chose tourne mal, on ne plante pas le serveur
    try {
        // On demande à Better Auth de vérifier la session de l'utilisateur
        // On lui passe les headers de la requête (qui contiennent le cookie de session)
        // C'est comme demander au gardien : "est-ce que cette personne a un ticket valide ?"
        const session = await auth.api.getSession({
            // On convertit les headers Express en format que Better Auth comprend
            headers: fromNodeHeaders(req.headers)
        });

        // On vérifie si la session existe ET si elle contient un utilisateur avec un id
        // Le "!" devant signifie "pas" : si pas de session, pas d'utilisateur, ou pas d'id...
        // C'est comme vérifier que le ticket est bien valide et qu'il a un nom dessus
        if(!session?.user?.id){
            // Si pas de session valide, on renvoie une erreur 401 (Non autorisé) avec un message
            // 401 signifie "tu n'as pas prouvé qui tu es" — c'est comme refuser l'entrée au club
            res.status(401).json({message : "Non authentifié"});
            // On arrête l'exécution du middleware ici avec return, pas la peine d'aller plus loin
            return
        }

        // Si on arrive ici, la session est valide ! On stocke l'id de l'utilisateur dans la requête
        // C'est comme coller un badge avec le nom de la personne sur sa requête pour que les prochains middlewares sachent qui c'est
        req.userId = session.user.id;
        // On appelle next() pour dire "ok, cette personne est authentifiée, laisse-la passer au prochain middleware ou à la route"
        // C'est comme ouvrir la porte du club après vérification
        next()
    } catch (error) {
        // Si une erreur inattendue se produit (problème de connexion, token corrompu, etc.)
        // On renvoie aussi une erreur 401 car on ne peut pas vérifier l'identité
        // C'est comme dire "le système de vérification est en panne, personne ne rentre"
        res.status(401).json({message : "Non authentifié"})
    }
}
