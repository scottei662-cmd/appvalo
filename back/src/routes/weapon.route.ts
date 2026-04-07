// On importe Express, le framework qui gère les routes comme un standard téléphonique qui dirige les appels
import express from "express";
// On importe le middleware d'authentification, comme un vigile qui vérifie les badges à l'entrée
import { authMiddleware } from "@/middlewares/auth.middleware";
// On importe le middleware admin, comme un deuxième vigile qui vérifie que tu es bien le chef
import { adminMiddleware } from "@/middlewares/admin.middleware";
// On importe toutes les fonctions du contrôleur weapon, comme un employé spécialisé pour gérer les armes du jeu
import * as weaponController from "@/controllers/weapon.controller";

// On crée un nouveau routeur Express, comme installer un nouveau panneau de direction dans le couloir
const router: express.Router = express.Router();

// Quand quelqu'un demande la liste de toutes les armes (GET /), on appelle getAll, comme ouvrir la vitrine du magasin d'armes — tout le monde peut regarder
router.get("/", weaponController.getAll);
// Quand quelqu'un demande une arme précise par son identifiant (GET /:id), on appelle getById, comme demander à voir une arme en particulier dans la vitrine
router.get("/:id", weaponController.getById);
// Quand quelqu'un veut créer une arme (POST /), on vérifie connexion + admin, comme vérifier le badge et le grade avant de fabriquer une nouvelle arme
router.post("/", authMiddleware, adminMiddleware, weaponController.create);
// Quand quelqu'un veut modifier une arme (PUT /:id), on vérifie connexion + admin, comme vérifier le badge et le grade avant de modifier une arme existante
router.put("/:id", authMiddleware, adminMiddleware, weaponController.update);
// Quand quelqu'un veut supprimer une arme (DELETE /:id), on vérifie connexion + admin, comme vérifier le badge et le grade avant de retirer une arme de la vitrine
router.delete("/:id", authMiddleware, adminMiddleware, weaponController.remove);

// On exporte le routeur pour qu'il puisse être utilisé dans l'application principale, comme accrocher le panneau de direction dans le hall
export default router;
