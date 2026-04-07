// On importe les types Request et Response depuis Express, comme des formulaires types pour les demandes et les réponses
import { Request, Response } from "express";
// On importe les schémas de validation pour créer et modifier une arme, comme des modèles pour vérifier que le dessin est correct
import { createWeaponSchema, updateWeaponSchema } from "@/dtos/weapon.dto";
// On importe toutes les fonctions du service weapon, comme une boîte à outils spécialisée pour les armes
import * as weaponService from "@/services/weapon.service";

// On exporte la fonction getAll qui récupère toutes les armes, comme ouvrir le catalogue complet du magasin d'armes
export const getAll = async (req: Request, res: Response) => {
    // On ouvre un bloc "essayer", comme mettre un filet de sécurité avant de faire une acrobatie
    try {
        // On regarde si le client a demandé un filtre par catégorie, comme demander "montre-moi seulement les pistolets"
        const category = typeof req.query.category === "string" ? req.query.category : undefined;
        // On demande au service de nous donner toutes les armes (avec le filtre si il y en a un), comme demander au bibliothécaire de chercher les livres
        const weapons = await weaponService.getAllWeapons(category);
        // On renvoie la liste des armes au client, comme donner le catalogue au visiteur
        res.json(weapons);
    // Si quelque chose se passe mal, on attrape l'erreur, comme attraper un ballon qu'on a raté
    } catch (error) {
        // On renvoie un message d'erreur avec le code 500 (erreur serveur), comme dire "désolé, la machine est en panne"
        res.status(500).json({ message: "Erreur server", error });
    }
};

// On exporte la fonction getById qui récupère une arme par son identifiant, comme chercher un jouet précis par son numéro
export const getById = async (req: Request, res: Response) => {
    // On ouvre un bloc "essayer", comme mettre un filet de sécurité
    try {
        // On demande au service de trouver l'arme avec l'identifiant donné dans l'URL, comme chercher un livre par son code-barres
        const weapon = await weaponService.getWeaponById(String(req.params.id));
        // Si l'arme n'existe pas, on prévient le client, comme dire "ce jouet n'est pas dans le magasin"
        if (!weapon) {
            // On renvoie un code 404 (non trouvé) avec un message, comme une pancarte "article introuvable"
            return res.status(404).json({ message: "Weapon not found" });
        }
        // Si on a trouvé l'arme, on la renvoie au client, comme tendre le jouet au visiteur
        res.json(weapon);
    // Si quelque chose se passe mal, on attrape l'erreur
    } catch (error) {
        // On renvoie un message d'erreur serveur, comme dire "la machine a eu un problème"
        res.status(500).json({ message: "Erreur server", error });
    }
};

// On exporte la fonction create qui crée une nouvelle arme, comme fabriquer un nouveau jouet pour le magasin
export const create = async (req: Request, res: Response) => {
    // On ouvre un bloc "essayer", comme mettre un filet de sécurité
    try {
        // On vérifie que les données envoyées sont valides avec le schéma, comme vérifier que le dessin du jouet respecte le modèle
        const parsed = createWeaponSchema.safeParse(req.body);
        // Si les données ne sont pas valides, on prévient le client
        if (!parsed.success) {
            // On renvoie un code 400 (mauvaise demande) avec les erreurs, comme dire "ton dessin ne respecte pas les règles"
            return res.status(400).json({ message: "Données invalides", errors: parsed.error.issues });
        }
        // On demande au service de créer l'arme avec les données validées, comme envoyer le dessin à l'usine
        const weapon = await weaponService.createWeapon(parsed.data);
        // On renvoie l'arme créée avec le code 201 (créé), comme montrer le nouveau jouet tout neuf
        res.status(201).json(weapon);
    // Si quelque chose se passe mal, on attrape l'erreur
    } catch (error) {
        // On renvoie un message d'erreur serveur
        res.status(500).json({ message: "Erreur server", error });
    }
};

// On exporte la fonction update qui modifie une arme existante, comme repeindre un jouet du magasin
export const update = async (req: Request, res: Response) => {
    // On ouvre un bloc "essayer", comme mettre un filet de sécurité
    try {
        // On vérifie que les données de modification sont valides, comme vérifier que la nouvelle peinture est autorisée
        const parsed = updateWeaponSchema.safeParse(req.body);
        // Si les données ne sont pas valides, on prévient le client
        if (!parsed.success) {
            // On renvoie un code 400 avec les erreurs de validation, comme dire "cette couleur n'est pas permise"
            return res.status(400).json({ message: "Données invalides", errors: parsed.error.issues });
        }
        // On demande au service de modifier l'arme avec les nouvelles données, comme envoyer le jouet à l'atelier de réparation
        const weapon = await weaponService.updateWeapon(String(req.params.id), parsed.data);
        // Si l'arme n'existe pas, on prévient le client
        if (!weapon) {
            // On renvoie un code 404, comme dire "on ne peut pas repeindre un jouet qui n'existe pas"
            return res.status(404).json({ message: "Weapon not found" });
        }
        // On renvoie l'arme modifiée au client, comme montrer le jouet après sa réparation
        res.json(weapon);
    // Si quelque chose se passe mal, on attrape l'erreur
    } catch (error) {
        // On renvoie un message d'erreur serveur
        res.status(500).json({ message: "Erreur server", error });
    }
};

// On exporte la fonction remove qui supprime une arme, comme retirer un jouet du magasin pour toujours
export const remove = async (req: Request, res: Response) => {
    // On ouvre un bloc "essayer", comme mettre un filet de sécurité
    try {
        // On demande au service de supprimer l'arme par son identifiant, comme demander de jeter le jouet à la poubelle
        const result = await weaponService.deleteWeapon(String(req.params.id));
        // Si l'arme n'a pas été trouvée pour la suppression
        if (!result) {
            // On renvoie un code 404, comme dire "on ne peut pas jeter un jouet qui n'existe pas"
            return res.status(404).json({ message: "Weapon not found" });
        }
        // On renvoie un code 204 (pas de contenu) pour confirmer la suppression, comme dire "c'est fait, le jouet a disparu"
        res.status(204).json({ message: "Weapon deleted successfully" });
    // Si quelque chose se passe mal, on attrape l'erreur
    } catch (error) {
        // On renvoie un message d'erreur serveur
        res.status(500).json({ message: "Erreur server", error });
    }
};
