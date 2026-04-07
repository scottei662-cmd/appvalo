// On importe Express, le framework qui gère les routes comme un standard téléphonique qui dirige les appels
import express from "express";
// On importe toutes les fonctions du contrôleur de statistiques, comme un employé spécialisé pour afficher les scores et résultats
import * as statsController from "@/controllers/stats.controller";

// On crée un nouveau routeur Express, comme installer un nouveau panneau de direction dans le couloir
const router: express.Router = express.Router();

// Quand quelqu'un demande les infos d'un compte par nom et tag (GET /account/:name/:tag), on appelle getAccount, comme chercher la fiche d'un joueur dans l'annuaire
router.get("/account/:name/:tag", statsController.getAccount);
// Quand quelqu'un demande le rang d'un joueur par nom et tag (GET /mmr/:name/:tag), on appelle getMMR, comme regarder la note d'un élève sur le tableau d'affichage
router.get("/mmr/:name/:tag", statsController.getMMR);
// Quand quelqu'un demande l'historique de rang d'un joueur (GET /mmr-history/:name/:tag), on appelle getMMRHistory, comme feuilleter le carnet de notes pour voir l'évolution
router.get("/mmr-history/:name/:tag", statsController.getMMRHistory);
// Quand quelqu'un demande les parties d'un joueur (GET /matches/:name/:tag), on appelle getMatches, comme demander la liste des matchs joués par un sportif
router.get("/matches/:name/:tag", statsController.getMatches);
// Quand quelqu'un demande les parties sauvegardées d'un joueur (GET /stored-matches/:name/:tag), on appelle getStoredMatches, comme regarder les matchs enregistrés sur cassette
router.get("/stored-matches/:name/:tag", statsController.getStoredMatches);
// Quand quelqu'un demande un match précis par son identifiant (GET /match/:matchId), on appelle getMatch, comme retrouver un match de foot précis par son numéro de ticket
router.get("/match/:matchId", statsController.getMatch);

// On exporte le routeur pour qu'il puisse être utilisé dans l'application principale, comme accrocher le panneau de direction dans le hall
export default router;
