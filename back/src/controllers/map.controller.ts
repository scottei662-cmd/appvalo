// On importe les types Request et Response depuis Express — ce sont les outils pour lire la demande du client et lui répondre
import { Request, Response } from "express";
// On importe les schémas de validation pour créer et modifier une map — comme un plan de construction pour vérifier que tout est conforme
import { createMapSchema, updateMapSchema } from "@/dtos/map.dto";
// On importe toutes les fonctions du service map — c'est l'expert qui sait comment manipuler les maps dans la base de données
import * as mapService from "@/services/map.service";

// Fonction pour récupérer toutes les maps — comme demander la liste de toutes les cartes du jeu
export const getAll = async (req: Request, res: Response) => {
    // Filet de sécurité pour attraper les erreurs
    try {
        // On demande au service de nous donner toutes les maps — comme demander au cartographe toutes ses cartes
        const maps = await mapService.getAllMaps();
        // On renvoie la liste des maps au client en JSON — comme étaler les cartes sur la table pour les montrer
        res.json(maps);
    // Si quelque chose a mal tourné
    } catch (error) {
        // On renvoie une erreur 500 — le serveur a eu un problème, comme un cartographe qui a perdu ses cartes
        res.status(500).json({ message: "Erreur server", error });
    }
};

// Fonction pour récupérer une map par son identifiant — comme chercher une carte précise dans l'atlas
export const getById = async (req: Request, res: Response) => {
    // Filet de sécurité
    try {
        // On demande au service de trouver la map avec l'ID donné dans l'URL — comme chercher une page précise dans un livre
        const map = await mapService.getMapById(String(req.params.id));
        // Si la map n'existe pas, on le signale
        if (!map) {
            // On renvoie une erreur 404 — cette carte n'existe pas dans notre collection
            return res.status(404).json({ message: "Map not found" });
        }
        // On renvoie la map trouvée — comme montrer la carte demandée
        res.json(map);
    // Si une erreur inattendue survient
    } catch (error) {
        // On renvoie une erreur 500 — problème interne du serveur
        res.status(500).json({ message: "Erreur server", error });
    }
};

// Fonction pour créer une nouvelle map — comme dessiner une nouvelle carte pour le jeu
export const create = async (req: Request, res: Response) => {
    // Filet de sécurité
    try {
        // On vérifie que les données envoyées sont valides avec le schéma Zod — comme vérifier que le dessin de la carte respecte les règles
        const parsed = createMapSchema.safeParse(req.body);
        // Si les données ne sont pas valides, on refuse
        if (!parsed.success) {
            // On renvoie une erreur 400 avec les détails — comme renvoyer le dessin avec les erreurs entourées en rouge
            return res.status(400).json({ message: "Données invalides", errors: parsed.error.issues });
        }
        // On demande au service de créer la map avec les données validées — comme enregistrer la nouvelle carte dans l'atlas
        const map = await mapService.createMap(parsed.data);
        // On renvoie la map créée avec le code 201 — la nouvelle carte a été ajoutée avec succès
        res.status(201).json(map);
    // Si une erreur inattendue survient
    } catch (error) {
        // On renvoie une erreur 500 — problème interne
        res.status(500).json({ message: "Erreur server", error });
    }
};

// Fonction pour modifier une map existante — comme corriger une carte qui contenait des erreurs
export const update = async (req: Request, res: Response) => {
    // Filet de sécurité
    try {
        // On vérifie que les données de mise à jour sont valides — comme vérifier que les corrections sont correctes
        const parsed = updateMapSchema.safeParse(req.body);
        // Si les données ne sont pas valides, on refuse la modification
        if (!parsed.success) {
            // On renvoie une erreur 400 avec les détails — quelles données posent problème
            return res.status(400).json({ message: "Données invalides", errors: parsed.error.issues });
        }
        // On demande au service de modifier la map identifiée par son ID — comme mettre à jour une carte dans l'atlas
        const map = await mapService.updateMap(String(req.params.id), parsed.data);
        // Si la map n'existe pas, on ne peut pas la modifier
        if (!map) {
            // On renvoie une erreur 404 — cette carte n'existe pas, on ne peut pas la corriger
            return res.status(404).json({ message: "Map not found" });
        }
        // On renvoie la map mise à jour — la carte corrigée est prête
        res.json(map);
    // Si une erreur inattendue survient
    } catch (error) {
        // On renvoie une erreur 500 — problème interne du serveur
        res.status(500).json({ message: "Erreur server", error });
    }
};

// Fonction pour supprimer une map — comme retirer une carte de l'atlas définitivement
export const remove = async (req: Request, res: Response) => {
    // Filet de sécurité
    try {
        // On demande au service de supprimer la map par son ID — comme arracher une page de l'atlas
        const result = await mapService.deleteMap(String(req.params.id));
        // Si la map n'existait pas, on ne peut pas la supprimer
        if (!result) {
            // On renvoie une erreur 404 — la carte n'a pas été trouvée pour la suppression
            return res.status(404).json({ message: "Map not found" });
        }
        // Suppression réussie, on renvoie un code 204 (pas de contenu) — la carte a été effacée
        res.status(204).json({ message: "Map deleted successfully" });
    // Si une erreur inattendue survient
    } catch (error) {
        // On renvoie une erreur 500 — problème interne du serveur
        res.status(500).json({ message: "Erreur server", error });
    }
};
