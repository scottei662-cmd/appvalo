// On importe Express, le framework qui gère les routes comme un standard téléphonique qui dirige les appels
import express from "express";
// On importe le middleware d'authentification, comme un vigile qui vérifie les badges à l'entrée
import { authMiddleware } from "@/middlewares/auth.middleware";
// On importe toutes les fonctions du contrôleur utilisateur, comme un employé spécialisé pour gérer les profils des joueurs
import * as userController from "@/controllers/user.controller";

// On crée un nouveau routeur Express, comme installer un nouveau panneau de direction dans le couloir
const router: express.Router = express.Router();

// Quand quelqu'un demande son propre profil (GET /me), on vérifie d'abord qu'il est connecté puis on appelle getMe, comme montrer un miroir au joueur après avoir vérifié son badge
router.get("/me", authMiddleware, userController.getMe);
// Quand quelqu'un veut modifier son profil (PUT /me), on vérifie d'abord qu'il est connecté puis on appelle updateMe, comme laisser le joueur se recoiffer devant le miroir après avoir vérifié son badge
router.put("/me", authMiddleware, userController.updateMe);

// On exporte le routeur pour qu'il puisse être utilisé dans l'application principale, comme accrocher le panneau de direction dans le hall
export default router;
