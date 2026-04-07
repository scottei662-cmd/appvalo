// On importe Express, le framework qui gère les routes comme un standard téléphonique qui dirige les appels
import express from "express";
// On importe le middleware d'authentification, comme un vigile qui vérifie les badges à l'entrée
import { authMiddleware } from "@/middlewares/auth.middleware";
// On importe toutes les fonctions du contrôleur build, comme un employé spécialisé pour gérer les configurations de jeu
import * as buildController from "@/controllers/build.controller";

// On crée un nouveau routeur Express, comme installer un nouveau panneau de direction dans le couloir
const router: express.Router = express.Router();

// Quand quelqu'un demande la liste de tous les builds (GET /), on appelle getAll, comme afficher le catalogue — tout le monde peut regarder
router.get("/", buildController.getAll);
// Quand quelqu'un demande un build précis par son identifiant (GET /:id), on appelle getById, comme chercher une recette précise dans le livre
router.get("/:id", buildController.getById);
// Quand quelqu'un veut créer un build (POST /), on vérifie d'abord qu'il est connecté, comme vérifier le badge avant de laisser écrire dans le livre de recettes
router.post("/", authMiddleware, buildController.create);
// Quand quelqu'un veut modifier un build (PUT /:id), on vérifie qu'il est connecté, comme vérifier le badge avant de laisser modifier une recette
router.put("/:id", authMiddleware, buildController.update);
// Quand quelqu'un veut supprimer un build (DELETE /:id), on vérifie qu'il est connecté, comme vérifier le badge avant de laisser déchirer une page du livre
router.delete("/:id", authMiddleware, buildController.remove);

// On exporte le routeur pour qu'il puisse être utilisé dans l'application principale, comme accrocher le panneau de direction dans le hall
export default router;
