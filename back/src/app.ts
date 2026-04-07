// On importe Express, le framework qui crée notre serveur web (comme un serveur de restaurant qui prend les commandes)
// On importe aussi les types Request et Response pour dire à TypeScript à quoi ressemblent les requêtes et réponses
import express, { Request, Response } from 'express';
// On importe cors, un module qui permet à notre API d'accepter des requêtes venant d'un autre site web (comme autoriser un ami d'une autre école à entrer dans ta cantine)
import cors from "cors";
// On importe toNodeHandler de better-auth, qui transforme les requêtes d'authentification en quelque chose que Node.js comprend (comme un traducteur)
import { toNodeHandler } from 'better-auth/node';
// On importe notre configuration d'authentification maison, qui contient toutes les règles de connexion/inscription
import { auth } from '@/lib/auth';
// On importe le routeur des agents Valorant (les personnages jouables), qui gère toutes les requêtes liées aux agents
import agentsRouter from "@/routes/agent.route";
// On importe le routeur des maps (les cartes de jeu), qui gère toutes les requêtes liées aux maps
import mapsRouter from "@/routes/map.route";
// On importe le routeur des armes, qui gère toutes les requêtes liées aux armes
import weaponsRouter from "@/routes/weapon.route";
// On importe le routeur des builds (les configurations de jeu créées par les joueurs), qui gère les requêtes liées aux builds
import buildsRouter from "@/routes/build.route";
// On importe le routeur des statistiques, qui gère les requêtes liées aux stats des joueurs
import statsRouter from "@/routes/stats.route";
// On importe le routeur des utilisateurs, qui gère les requêtes liées aux profils des utilisateurs
import userRouter from "@/routes/user.route";
// On importe le routeur des images, qui gère l'upload et la récupération des images (via Cloudinary)
import imageRouter from "@/routes/image.route";

// On crée notre application Express — c'est le coeur de notre serveur, comme le cerveau qui coordonne tout
const app = express();

// On configure CORS pour autoriser uniquement le frontend local (localhost:5173) à communiquer avec notre API
// C'est comme une liste d'invités : seul le frontend a le droit d'envoyer des requêtes
app.use(cors({
    // On précise l'adresse exacte du frontend autorisé à parler à notre API (le site Vite en développement)
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    // On autorise l'envoi de cookies et d'informations d'authentification dans les requêtes (pour que la session reste active)
    credentials: true,
}));

// On dit à Express que toutes les requêtes qui commencent par /api/auth/ doivent être gérées par Better Auth
// Le {*splat} capture tout ce qui vient après /api/auth/ (comme un filet qui attrape tous les poissons d'un coup)
app.all("/api/auth/{*splat}", toNodeHandler(auth));
// On active le middleware qui permet à Express de comprendre le JSON dans le corps des requêtes (comme apprendre à lire une langue)
app.use(express.json());

// On définit la route d'accueil "/" — quand quelqu'un visite la racine de l'API, on lui envoie un message de bienvenue
// _req est préfixé d'un underscore car on n'utilise pas la requête ici, mais Express l'exige dans la signature
app.get("/", (_req: Request, res: Response) => {
    // On répond avec un objet JSON contenant un message de bienvenue pour confirmer que l'API fonctionne
    res.json({ message: "Bienvenue sur l'API de Valorant App !" });
});

// On branche le routeur des agents sur le chemin /agents — toute requête vers /agents sera gérée par agentsRouter
app.use("/agents", agentsRouter);
// On branche le routeur des maps sur le chemin /maps — toute requête vers /maps sera gérée par mapsRouter
app.use("/maps", mapsRouter);
// On branche le routeur des armes sur le chemin /weapons — toute requête vers /weapons sera gérée par weaponsRouter
app.use("/weapons", weaponsRouter);
// On branche le routeur des builds sur le chemin /builds — toute requête vers /builds sera gérée par buildsRouter
app.use("/builds", buildsRouter);
// On branche le routeur des statistiques sur le chemin /stats — toute requête vers /stats sera gérée par statsRouter
app.use("/stats", statsRouter);
// On branche le routeur des utilisateurs sur le chemin /users — toute requête vers /users sera gérée par userRouter
app.use("/users", userRouter);
// On branche le routeur des images sur le chemin /images — toute requête vers /images sera gérée par imageRouter
app.use("/images", imageRouter);

// On exporte l'application pour pouvoir l'utiliser ailleurs (dans index.ts pour démarrer le serveur, ou dans les tests)
export default app;
