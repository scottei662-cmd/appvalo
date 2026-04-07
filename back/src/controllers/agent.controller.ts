// On importe les types Request et Response depuis Express, c'est comme importer les formulaires qu'on va remplir pour parler avec le facteur (le serveur web)
import { Request, Response } from "express";
// On importe les schémas de validation pour créer et modifier un agent — c'est comme un moule à gâteau, si les données ne rentrent pas dans le moule, on refuse
import { createAgentSchema, updateAgentSchema } from "@/dtos/agent.dto";
// On importe toutes les fonctions du service agent — c'est le cuisinier qui fait le vrai travail en cuisine, nous on est juste le serveur au restaurant
import * as agentService from "@/services/agent.service";

// Fonction pour récupérer tous les agents — comme demander la liste de tous les élèves de la classe
export const getAll = async (req: Request, res: Response) => {
    // On essaie d'exécuter le code, et si ça plante, on attrape l'erreur — comme un filet de sécurité sous un trapéziste
    try {
        // On regarde si l'utilisateur a envoyé un filtre de recherche "title" dans l'URL — comme quand tu tapes un mot dans la barre de recherche Google
        const search = typeof req.query.title === "string" ? req.query.title : undefined;
        // On demande au service de nous donner tous les agents, avec éventuellement un filtre de recherche — comme demander au bibliothécaire tous les livres ou seulement ceux d'un auteur
        const notes = await agentService.getAllAgents(search);
        // On renvoie la liste des agents au client en format JSON — comme donner la réponse à quelqu'un qui a posé une question
        res.json(notes);
    // Si quelque chose a mal tourné, on tombe ici
    } catch (error) {
        // On renvoie une erreur 500 (erreur serveur) avec un message — comme dire "désolé, la machine est en panne"
        res.status(500).json({message : "Erreur server", error});
    };
};

// Fonction pour récupérer un seul agent par son identifiant — comme chercher un élève précis par son numéro dans la classe
export const getById = async (req : Request, res : Response) => {
    // Filet de sécurité pour attraper les erreurs
    try {
        // On demande au service de trouver l'agent avec l'ID donné dans l'URL — comme chercher un livre précis par son code-barres
        const note = await agentService.getAgentById(String(req.params.id));
        // Si l'agent n'existe pas, on prévient le client — comme dire "ce livre n'est pas dans la bibliothèque"
        if(!note){
            // On renvoie une erreur 400 pour dire que l'agent n'a pas été trouvé
            return res.status(400).json({message : "Agent not found"})
        };
        // Si on a trouvé l'agent, on le renvoie au client — comme tendre le livre demandé
        res.json(note);
    // Si une erreur inattendue survient
    } catch (error) {
        // On renvoie une erreur 500 au client — le serveur a eu un problème interne
        res.status(500).json({message : "Erreur server", error});
    };
};

// Fonction pour créer un nouvel agent — comme inscrire un nouvel élève dans la classe
export const create = async (req : Request, res : Response) => {
    // Filet de sécurité pour attraper les erreurs
    try {
        // On vérifie que les données envoyées par le client sont valides grâce au schéma Zod — comme vérifier que le formulaire d'inscription est bien rempli
        const parsed = createAgentSchema.safeParse(req.body);
        // Si les données ne sont pas valides, on refuse — comme refuser un formulaire mal rempli
        if(!parsed.success){
            // On renvoie une erreur 400 avec les détails des problèmes — comme entourer en rouge les champs mal remplis
            return res.status(400).json({message : "Données invalides", errors : parsed.error.issues});
        }
        // On demande au service de créer l'agent avec les données validées — comme enregistrer le nouvel élève dans le registre
        const note = await agentService.createAgent(parsed.data);
        // On renvoie l'agent créé avec le code 201 (créé avec succès) — comme donner le badge au nouvel élève
        res.status(201).json(note);
    // Si une erreur inattendue survient
    } catch (error) {
        // On renvoie une erreur 500 — problème interne du serveur
        res.status(500).json({message : "Erreur server", error});
    };
};

// Fonction pour modifier un agent existant — comme corriger les informations d'un élève
export const update = async (req : Request, res : Response) => {
    // Filet de sécurité pour attraper les erreurs
    try {
        // On vérifie que les données de mise à jour sont valides — comme vérifier le formulaire de modification
        const parsed = updateAgentSchema.safeParse(req.body);
        // Si les données ne sont pas valides, on refuse la modification
        if(!parsed.success){
            // On renvoie une erreur 400 avec les détails — quels champs sont mal remplis
            return res.status(400).json({message : "Données invalides", errors : parsed.error.issues});
        }
        // On demande au service de modifier l'agent identifié par l'ID dans l'URL — comme mettre à jour la fiche de l'élève
        const note = await agentService.updateAgent(String(req.params.id), parsed.data);
        // Si l'agent n'existe pas, on ne peut pas le modifier — on ne peut pas corriger une fiche qui n'existe pas
        if(!note){
            // On renvoie une erreur 404 (non trouvé) — l'agent demandé n'existe pas
            return res.status(404).json({message : "Agent not found"});
        }
        // Si tout s'est bien passé, on renvoie l'agent mis à jour — comme rendre la fiche corrigée
        res.json(note)
    // Si une erreur inattendue survient
    } catch (error) {
        // On renvoie une erreur 500 — problème interne
       res.status(500).json({message : "Erreur server", error});
    };
};

// Fonction pour supprimer un agent — comme retirer un élève de la classe
export const remove = async (req : Request, res : Response) => {
    // Filet de sécurité pour attraper les erreurs
    try {
        // On demande au service de supprimer l'agent par son ID — comme effacer la fiche d'un élève du registre
        const result = await agentService.deleteAgent(String(req.params.id))
        // Si l'agent n'existait pas, on ne peut pas le supprimer
        if(!result){
            // On renvoie une erreur 404 — l'agent n'a pas été trouvé pour suppression
           return res.status(404).json({message : "Agent not found"});
        }
        // On renvoie un code 204 (succès sans contenu) — la suppression a réussi, il n'y a plus rien à montrer
        res.status(204).json({message : "Agent deleted successfully"});
    // Si une erreur inattendue survient
    } catch (error) {
        // On renvoie une erreur 500 — problème interne du serveur
        res.status(500).json({message : "Erreur server", error});
    }
}
