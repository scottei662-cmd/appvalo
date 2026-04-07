// On importe Express, le framework qui gère les routes comme un standard téléphonique qui dirige les appels
import express from "express";
// On importe le middleware d'authentification, comme un vigile qui vérifie les badges à l'entrée
import { authMiddleware } from "@/middlewares/auth.middleware";
// On importe le middleware admin, comme un deuxième vigile qui vérifie que tu es bien le chef
import { adminMiddleware } from "@/middlewares/admin.middleware";
// On importe toutes les fonctions du contrôleur agent, comme un employé spécialisé pour gérer les agents Valorant
import * as agentController from "@/controllers/agent.controller";

// On crée un nouveau routeur Express, comme installer un nouveau panneau de direction dans le couloir
const router: express.Router = express.Router();

// Quand quelqu'un demande la liste de tous les agents (GET /), on appelle getAll, comme afficher le catalogue complet — tout le monde peut regarder
router.get("/", agentController.getAll);
// Quand quelqu'un demande un agent précis par son identifiant (GET /:id), on appelle getById, comme chercher une fiche précise — tout le monde peut regarder
router.get("/:id", agentController.getById);
// Quand quelqu'un veut créer un agent (POST /), on vérifie d'abord qu'il est connecté puis qu'il est admin, comme vérifier le badge puis le grade avant de laisser entrer dans l'atelier
router.post("/", authMiddleware, adminMiddleware, agentController.create);
// Quand quelqu'un veut modifier un agent (PUT /:id), on vérifie connexion + admin, comme pour la création — seul le chef peut toucher aux fiches
router.put("/:id", authMiddleware, adminMiddleware, agentController.update);
// Quand quelqu'un veut supprimer un agent (DELETE /:id), on vérifie connexion + admin, comme pour les autres — seul le chef peut jeter une fiche
router.delete("/:id", authMiddleware, adminMiddleware, agentController.remove)

// On exporte le routeur pour qu'il puisse être utilisé dans l'application principale, comme accrocher le panneau de direction dans le hall
export default router
