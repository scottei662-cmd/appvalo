// On importe les types Request et Response depuis Express, comme des formulaires types pour les demandes et les réponses
import { Request, Response } from "express";
// On importe toutes les fonctions du service utilisateur, comme une boîte à outils spécialisée pour gérer les joueurs
import * as userService from "@/services/user.service";

// On exporte la fonction getMe qui récupère le profil de l'utilisateur connecté, comme regarder sa propre carte d'identité
export const getMe = async (req: Request, res: Response) => {
    // On ouvre un bloc "essayer", comme mettre un filet de sécurité avant de faire une acrobatie
    try {
        // On demande au service de trouver le profil avec l'identifiant de l'utilisateur connecté, comme chercher sa fiche dans le classeur
        const user = await userService.getUserProfile(req.userId!);
        // Si l'utilisateur n'existe pas dans la base, on prévient
        if (!user) {
            // On renvoie un code 404 (non trouvé), comme dire "ta fiche n'est pas dans le classeur"
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        // On renvoie les informations de l'utilisateur, comme donner sa carte d'identité au joueur
        res.json(user);
    // Si quelque chose se passe mal, on attrape l'erreur, comme attraper un ballon qu'on a raté
    } catch (error) {
        // On renvoie un message d'erreur serveur avec le code 500, comme dire "désolé, la machine est en panne"
        res.status(500).json({ message: "Erreur server", error });
    }
};

// On exporte la fonction updateMe qui modifie le profil de l'utilisateur connecté, comme modifier sa carte d'identité
export const updateMe = async (req: Request, res: Response) => {
    // On ouvre un bloc "essayer", comme mettre un filet de sécurité
    try {
        // On extrait les champs du corps de la requête, comme sortir les nouvelles infos de l'enveloppe envoyée par le joueur
        const { gameName, tagLine, image, name } = req.body;
        // On demande au service de mettre à jour le profil avec les nouvelles infos, comme réécrire la carte d'identité
        const user = await userService.updateUserProfile(req.userId!, { gameName, tagLine, image, name });
        // On renvoie le profil mis à jour, comme rendre la nouvelle carte d'identité au joueur
        res.json(user);
    // Si quelque chose se passe mal, on attrape l'erreur
    } catch (error) {
        // On renvoie un message d'erreur serveur
        res.status(500).json({ message: "Erreur server", error });
    }
};
