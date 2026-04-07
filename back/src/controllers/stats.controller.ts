// On importe les types Request et Response depuis Express, comme des formulaires types pour les demandes et les réponses
import { Request, Response } from "express";
// On importe toutes les fonctions du service de statistiques, comme une boîte à outils spécialisée pour les scores et résultats
import * as statsService from "@/services/stats.service";

// On exporte la fonction getAccount qui récupère les infos d'un compte joueur, comme chercher la fiche d'un élève à l'école
export const getAccount = async (req: Request, res: Response) => {
    // On ouvre un bloc "essayer", comme mettre un filet de sécurité avant de faire une acrobatie
    try {
        // On récupère le nom et le tag depuis l'URL, comme lire le prénom et le numéro sur le badge du joueur
        const { name, tag } = req.params;
        // On demande au service de trouver le compte avec ce nom et ce tag, comme chercher dans l'annuaire
        const data = await statsService.getAccount(name, tag);
        // On renvoie les données du compte au client, comme donner la fiche au visiteur
        res.json(data);
    // Si quelque chose se passe mal, on attrape l'erreur (avec le type "any" pour accéder aux propriétés)
    } catch (error: any) {
        // On récupère le code d'erreur, ou 500 par défaut si il n'y en a pas, comme choisir le bon panneau d'avertissement
        const status = error.status || 500;
        // On renvoie le message d'erreur avec le bon code, comme afficher la bonne pancarte d'erreur
        res.status(status).json({ message: error.message || "Erreur server" });
    }
};

// On exporte la fonction getMMR qui récupère le rang compétitif d'un joueur, comme regarder la note d'un élève
export const getMMR = async (req: Request, res: Response) => {
    // On ouvre un bloc "essayer", comme mettre un filet de sécurité
    try {
        // On récupère le nom et le tag depuis l'URL, comme lire le badge du joueur
        const { name, tag } = req.params;
        // On vérifie si une région est spécifiée dans les paramètres, comme demander "dans quelle école ?"
        const region = typeof req.query.region === "string" ? req.query.region : undefined;
        // On demande au service le MMR du joueur dans cette région, comme demander la note au professeur
        const data = await statsService.getMMR(name, tag, region);
        // On renvoie les données de rang au client, comme donner le bulletin de notes
        res.json(data);
    // Si quelque chose se passe mal, on attrape l'erreur
    } catch (error: any) {
        // On récupère le code d'erreur ou 500 par défaut
        const status = error.status || 500;
        // On renvoie le message d'erreur avec le bon code
        res.status(status).json({ message: error.message || "Erreur server" });
    }
};

// On exporte la fonction getMMRHistory qui récupère l'historique de rang d'un joueur, comme voir l'évolution des notes au fil du temps
export const getMMRHistory = async (req: Request, res: Response) => {
    // On ouvre un bloc "essayer", comme mettre un filet de sécurité
    try {
        // On récupère le nom et le tag depuis l'URL, comme lire le badge du joueur
        const { name, tag } = req.params;
        // On vérifie si une région est spécifiée, comme demander "dans quel pays ?"
        const region = typeof req.query.region === "string" ? req.query.region : undefined;
        // On demande au service l'historique de MMR du joueur, comme demander le carnet de notes complet
        const data = await statsService.getMMRHistory(name, tag, region);
        // On renvoie l'historique au client, comme donner le carnet de notes
        res.json(data);
    // Si quelque chose se passe mal, on attrape l'erreur
    } catch (error: any) {
        // On récupère le code d'erreur ou 500 par défaut
        const status = error.status || 500;
        // On renvoie le message d'erreur avec le bon code
        res.status(status).json({ message: error.message || "Erreur server" });
    }
};

// On exporte la fonction getMatches qui récupère les parties d'un joueur, comme voir la liste des matchs de foot joués
export const getMatches = async (req: Request, res: Response) => {
    // On ouvre un bloc "essayer", comme mettre un filet de sécurité
    try {
        // On récupère le nom et le tag depuis l'URL, comme lire le badge du joueur
        const { name, tag } = req.params;
        // On vérifie si une région est spécifiée, comme demander "dans quel stade ?"
        const region = typeof req.query.region === "string" ? req.query.region : undefined;
        // On vérifie si un nombre maximum de parties est demandé, comme dire "montre-moi seulement les 5 derniers matchs"
        const size = req.query.size ? Number(req.query.size) : undefined;
        // On demande au service les parties du joueur, comme aller chercher la liste des matchs dans les archives
        const data = await statsService.getMatches(name, tag, region, size);
        // On renvoie la liste des parties au client, comme donner la feuille de matchs au supporter
        res.json(data);
    // Si quelque chose se passe mal, on attrape l'erreur
    } catch (error: any) {
        // On récupère le code d'erreur ou 500 par défaut
        const status = error.status || 500;
        // On renvoie le message d'erreur avec le bon code
        res.status(status).json({ message: error.message || "Erreur server" });
    }
};

// On exporte la fonction getStoredMatches qui récupère les parties sauvegardées, comme regarder les matchs enregistrés sur une cassette vidéo
export const getStoredMatches = async (req: Request, res: Response) => {
    // On ouvre un bloc "essayer", comme mettre un filet de sécurité
    try {
        // On récupère le nom et le tag depuis l'URL, comme lire le badge du joueur
        const { name, tag } = req.params;
        // On vérifie si une région est spécifiée, comme demander "quel championnat ?"
        const region = typeof req.query.region === "string" ? req.query.region : undefined;
        // On demande au service les parties stockées du joueur, comme aller chercher les cassettes dans l'armoire
        const data = await statsService.getStoredMatches(name, tag, region);
        // On renvoie les parties stockées au client, comme donner les cassettes au visiteur
        res.json(data);
    // Si quelque chose se passe mal, on attrape l'erreur
    } catch (error: any) {
        // On récupère le code d'erreur ou 500 par défaut
        const status = error.status || 500;
        // On renvoie le message d'erreur avec le bon code
        res.status(status).json({ message: error.message || "Erreur server" });
    }
};

// On exporte la fonction getMatch qui récupère une partie précise par son identifiant, comme retrouver un match de foot précis par sa date
export const getMatch = async (req: Request, res: Response) => {
    // On ouvre un bloc "essayer", comme mettre un filet de sécurité
    try {
        // On récupère l'identifiant du match depuis l'URL, comme lire le numéro du ticket du match
        const { matchId } = req.params;
        // On vérifie si une région est spécifiée, comme demander "dans quel pays ce match a été joué ?"
        const region = typeof req.query.region === "string" ? req.query.region : undefined;
        // On demande au service les détails de ce match précis, comme aller chercher le résumé du match dans les archives
        const data = await statsService.getMatchById(matchId, region);
        // On renvoie les détails du match au client, comme donner le résumé du match au supporter
        res.json(data);
    // Si quelque chose se passe mal, on attrape l'erreur
    } catch (error: any) {
        // On récupère le code d'erreur ou 500 par défaut
        const status = error.status || 500;
        // On renvoie le message d'erreur avec le bon code
        res.status(status).json({ message: error.message || "Erreur server" });
    }
};
