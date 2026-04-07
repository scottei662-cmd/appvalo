// On importe les types Request et Response depuis Express — ce sont les enveloppes pour la lettre reçue (Request) et la réponse qu'on envoie (Response)
import { Request, Response } from "express";
// On importe les schémas de validation pour créer et modifier un build — comme des règles du jeu pour vérifier que les données sont correctes
import { createBuildSchema, updateBuildSchema } from "@/dtos/build.dto";
// On importe toutes les fonctions du service build — c'est l'atelier qui fabrique, modifie et range les builds
import * as buildService from "@/services/build.service";

// Fonction pour récupérer tous les builds — comme demander tous les dessins accrochés au mur de la classe
export const getAll = async (req: Request, res: Response) => {
    // Filet de sécurité pour attraper les erreurs — si quelque chose casse, on le gère proprement
    try {
        // On regarde si l'utilisateur a filtré par agentId dans l'URL — comme dire "montre-moi seulement les dessins de tel personnage"
        const agentId = typeof req.query.agentId === "string" ? req.query.agentId : undefined;
        // On regarde si l'utilisateur a filtré par userId dans l'URL — comme dire "montre-moi seulement les dessins de tel élève"
        const userId = typeof req.query.userId === "string" ? req.query.userId : undefined;
        // On demande au service de nous donner tous les builds, avec éventuellement des filtres — comme demander au bibliothécaire les livres selon des critères
        const builds = await buildService.getAllBuilds(agentId, userId);
        // On renvoie la liste des builds au client en JSON — comme montrer les résultats
        res.json(builds);
    // Si quelque chose a mal tourné
    } catch (error) {
        // On renvoie une erreur 500 — "désolé, la machine est en panne"
        res.status(500).json({ message: "Erreur server", error });
    }
};

// Fonction pour récupérer un build par son identifiant — comme chercher un dessin précis dans la pile
export const getById = async (req: Request, res: Response) => {
    // Filet de sécurité
    try {
        // On demande au service de trouver le build avec l'ID donné — comme chercher un livre par son numéro
        const build = await buildService.getBuildById(String(req.params.id));
        // Si le build n'existe pas, on le signale au client
        if (!build) {
            // On renvoie une erreur 404 (non trouvé) — ce build n'est pas dans notre collection
            return res.status(404).json({ message: "Build not found" });
        }
        // On renvoie le build trouvé — comme tendre le livre demandé
        res.json(build);
    // Si une erreur inattendue survient
    } catch (error) {
        // On renvoie une erreur 500 — le serveur a eu un problème interne
        res.status(500).json({ message: "Erreur server", error });
    }
};

// Fonction pour créer un nouveau build — comme dessiner un nouveau plan de jeu
export const create = async (req: Request, res: Response) => {
    // Filet de sécurité
    try {
        // On vérifie que les données envoyées sont valides avec le schéma Zod — comme vérifier que le dessin respecte les consignes
        const parsed = createBuildSchema.safeParse(req.body);
        // Si les données ne sont pas valides, on refuse la création
        if (!parsed.success) {
            // On renvoie une erreur 400 avec les détails des erreurs — comme souligner les erreurs sur une copie
            return res.status(400).json({ message: "Données invalides", errors: parsed.error.issues });
        }
        // On crée le build en passant l'ID de l'utilisateur connecté (req.userId!) et les données validées — le "!" dit à TypeScript "je suis sûr que cette valeur existe"
        const build = await buildService.createBuild(req.userId!, parsed.data);
        // On renvoie le build créé avec le code 201 (créé) — comme accrocher le nouveau dessin au mur
        res.status(201).json(build);
    // Si une erreur inattendue survient
    } catch (error) {
        // On renvoie une erreur 500 — problème interne du serveur
        res.status(500).json({ message: "Erreur server", error });
    }
};

// Fonction pour modifier un build existant — comme corriger un dessin qu'on a déjà fait
export const update = async (req: Request, res: Response) => {
    // Filet de sécurité
    try {
        // On vérifie que les données de mise à jour sont valides — comme vérifier les corrections avant de les appliquer
        const parsed = updateBuildSchema.safeParse(req.body);
        // Si les données ne sont pas valides, on refuse
        if (!parsed.success) {
            // On renvoie une erreur 400 avec les détails — quelles données sont incorrectes
            return res.status(400).json({ message: "Données invalides", errors: parsed.error.issues });
        }
        // On demande au service de modifier le build — on passe l'ID du build, l'ID de l'utilisateur et les nouvelles données
        const result = await buildService.updateBuild(String(req.params.id), req.userId!, parsed.data);
        // Si le build n'existe pas, on le signale
        if (!result) {
            // On renvoie une erreur 404 — le build demandé n'existe pas
            return res.status(404).json({ message: "Build not found" });
        }
        // Si le service renvoie "forbidden", ça veut dire que l'utilisateur essaie de modifier le build de quelqu'un d'autre — comme essayer de corriger le dessin d'un camarade
        if (result === "forbidden") {
            // On renvoie une erreur 403 (interdit) — tu ne peux pas toucher aux affaires des autres
            return res.status(403).json({ message: "Vous ne pouvez modifier que vos propres builds" });
        }
        // Si tout est OK, on renvoie le build modifié — les corrections ont été appliquées
        res.json(result);
    // Si une erreur inattendue survient
    } catch (error) {
        // On renvoie une erreur 500 — problème interne
        res.status(500).json({ message: "Erreur server", error });
    }
};

// Fonction pour supprimer un build — comme enlever un dessin du mur
export const remove = async (req: Request, res: Response) => {
    // Filet de sécurité
    try {
        // On demande au service de supprimer le build — on passe l'ID du build et l'ID de l'utilisateur pour vérifier que c'est le sien
        const result = await buildService.deleteBuild(String(req.params.id), req.userId!);
        // Si le build n'existe pas, on ne peut pas le supprimer
        if (!result) {
            // On renvoie une erreur 404 — le build n'a pas été trouvé
            return res.status(404).json({ message: "Build not found" });
        }
        // Si le service renvoie "forbidden", l'utilisateur essaie de supprimer le build de quelqu'un d'autre
        if (result === "forbidden") {
            // On renvoie une erreur 403 — tu ne peux supprimer que tes propres builds
            return res.status(403).json({ message: "Vous ne pouvez supprimer que vos propres builds" });
        }
        // Suppression réussie, on renvoie un code 204 (pas de contenu) — le build a été effacé, il n'y a plus rien à montrer
        res.status(204).json({ message: "Build deleted successfully" });
    // Si une erreur inattendue survient
    } catch (error) {
        // On renvoie une erreur 500 — problème interne du serveur
        res.status(500).json({ message: "Erreur server", error });
    }
};
