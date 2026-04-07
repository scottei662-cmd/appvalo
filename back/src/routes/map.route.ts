// On importe Express, le framework qui gère les routes comme un standard téléphonique qui dirige les appels
import express from "express";
// On importe le middleware d'authentification, comme un vigile qui vérifie les badges à l'entrée
import { authMiddleware } from "@/middlewares/auth.middleware";
// On importe le middleware admin, comme un deuxième vigile qui vérifie que tu es bien le chef
import { adminMiddleware } from "@/middlewares/admin.middleware";
// On importe toutes les fonctions du contrôleur map, comme un employé spécialisé pour gérer les cartes du jeu
import * as mapController from "@/controllers/map.controller";

// On crée un nouveau routeur Express, comme installer un nouveau panneau de direction dans le couloir
const router: express.Router = express.Router();

// Quand quelqu'un demande la liste de toutes les maps (GET /), on appelle getAll, comme afficher toutes les cartes sur le mur — tout le monde peut regarder
router.get("/", mapController.getAll);
// Quand quelqu'un demande une map précise par son identifiant (GET /:id), on appelle getById, comme pointer une carte précise du doigt
router.get("/:id", mapController.getById);
// Quand quelqu'un veut créer une map (POST /), on vérifie connexion + admin, comme vérifier le badge et le grade avant de dessiner une nouvelle carte
router.post("/", authMiddleware, adminMiddleware, mapController.create);
// Quand quelqu'un veut modifier une map (PUT /:id), on vérifie connexion + admin, comme vérifier le badge et le grade avant de modifier une carte existante
router.put("/:id", authMiddleware, adminMiddleware, mapController.update);
// Quand quelqu'un veut supprimer une map (DELETE /:id), on vérifie connexion + admin, comme vérifier le badge et le grade avant de retirer une carte du mur
router.delete("/:id", authMiddleware, adminMiddleware, mapController.remove);

// On exporte le routeur pour qu'il puisse être utilisé dans l'application principale, comme accrocher le panneau de direction dans le hall
export default router;
