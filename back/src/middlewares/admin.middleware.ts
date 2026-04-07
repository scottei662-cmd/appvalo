// On importe les types Request, Response et NextFunction depuis Express
// Ce sont les mêmes types que dans auth.middleware.ts : la demande, la réponse, et la fonction "passe au suivant"
import { Request, Response, NextFunction } from "express"
// On importe notre client de base de données pour pouvoir vérifier le rôle de l'utilisateur
// C'est comme aller consulter le registre des employés pour voir si quelqu'un est bien un administrateur
import db from "@/lib/db"

/**
 * @description Middleware admin — verifie que le user connecte a le role ADMIN (doit etre chaine apres authMiddleware)
 */
// On crée et exporte le middleware admin
// Ce middleware doit TOUJOURS être utilisé APRÈS authMiddleware, car il a besoin de req.userId
// C'est comme un deuxième vigile qui vérifie non seulement que tu es entré, mais que tu es VIP
export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    // On entoure tout dans un try/catch pour attraper les erreurs inattendues
    // C'est un filet de sécurité pour ne pas planter le serveur si quelque chose va mal
    try {
        // On cherche l'utilisateur dans la base de données grâce à son id (stocké par authMiddleware)
        // Le "!" après req.userId dit à TypeScript "je suis sûr que cette valeur existe" (car authMiddleware l'a vérifiée avant)
        // select: { role: true } signifie "je veux seulement récupérer le rôle, pas tout le profil"
        // C'est comme demander au registre : "quel est le grade de cette personne ?"
        const user = await db.user.findUnique({
            // On cherche l'utilisateur dont l'id correspond à celui stocké dans la requête
            where: { id: req.userId! },
            // On sélectionne uniquement le champ "role" pour ne pas récupérer des données inutiles
            // C'est plus rapide et plus sécurisé que de récupérer tout le profil
            select: { role: true }
        });

        // On vérifie si l'utilisateur existe ET si son rôle est bien "ADMIN"
        // Si l'utilisateur n'existe pas (!user) ou si son rôle n'est pas ADMIN, on refuse l'accès
        // C'est comme vérifier que le badge VIP est bien authentique
        if(!user || user.role !== "ADMIN"){
            // On renvoie une erreur 403 (Forbidden = Interdit) avec un message explicatif
            // 403 est différent de 401 : ici on SAIT qui tu es, mais tu n'as pas les DROITS
            // C'est comme dire "on te connaît, mais tu n'es pas autorisé à entrer dans cette zone"
            res.status(403).json({message : "Accès réservé aux administrateurs"});
            // On arrête l'exécution ici, pas besoin d'aller plus loin
            return
        }

        // Si on arrive ici, l'utilisateur est bien un administrateur
        // On appelle next() pour le laisser passer vers la route protégée
        // C'est comme ouvrir la porte de la salle VIP
        next()
    } catch (error) {
        // Si une erreur inattendue se produit (problème de base de données, etc.)
        // On renvoie une erreur 500 (erreur interne du serveur)
        // C'est comme dire "le système de vérification des badges est en panne"
        res.status(500).json({message : "Erreur serveur"})
    }
}
