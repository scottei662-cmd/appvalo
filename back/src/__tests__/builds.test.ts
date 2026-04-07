// On importe les fonctions de test de Vitest : describe pour grouper, it pour un test individuel, expect pour vérifier, vi pour mocker, beforeEach pour préparer avant chaque test
import { describe, it, expect, vi, beforeEach } from "vitest";
// On importe supertest pour simuler des requêtes HTTP sur notre API sans avoir besoin d'un vrai navigateur ou serveur
import request from "supertest";
// On importe l'application Express pour pouvoir y envoyer des fausses requêtes pendant les tests
import app from "@/app";

// On remplace le vrai module de base de données par un faux (mock) — comme utiliser un faux coffre-fort pour s'entraîner à crocheter des serrures sans risque
vi.mock("@/lib/db", () => ({
    // On crée un faux export par défaut qui imite Prisma Client
    default: {
        // On crée un faux modèle "build" avec toutes les méthodes CRUD nécessaires
        build: {
            // findMany simulé : chercher plusieurs builds dans la fausse base de données
            findMany: vi.fn(),
            // findUnique simulé : chercher un seul build par son identifiant
            findUnique: vi.fn(),
            // create simulé : créer un nouveau build dans la fausse base
            create: vi.fn(),
            // update simulé : mettre à jour un build existant
            update: vi.fn(),
            // delete simulé : supprimer un build
            delete: vi.fn(),
        },
        // On crée aussi un faux modèle "map" car certaines routes de builds peuvent en avoir besoin (relation entre builds et maps)
        map: {
            // findMany simulé pour les maps
            findMany: vi.fn(),
            // findUnique simulé pour trouver une map précise
            findUnique: vi.fn(),
            // create simulé pour créer une map
            create: vi.fn(),
            // update simulé pour modifier une map
            update: vi.fn(),
            // delete simulé pour supprimer une map
            delete: vi.fn(),
        },
        // On simule la connexion à la base de données pour éviter une vraie connexion PostgreSQL pendant les tests
        $connect: vi.fn(),
    },
}));

// On remplace le middleware d'authentification par un faux qui laisse tout passer — comme enlever le verrou de la porte pendant les tests
vi.mock("@/middlewares/auth.middleware", () => ({
    // Le faux middleware met un userId de test dans la requête et passe directement au suivant
    authMiddleware: vi.fn((req: any, _res: any, next: any) => {
        // On assigne un faux identifiant utilisateur pour simuler un utilisateur connecté
        req.userId = "test-user-id";
        // On appelle next() pour continuer vers le contrôleur, comme donner le feu vert à une voiture au péage
        next();
    }),
}));

// On remplace le module better-auth/node par un faux pour désactiver l'authentification réelle pendant les tests
vi.mock("better-auth/node", () => ({
    // toNodeHandler retourne un handler bidon qui répond 404 — on n'a pas besoin de l'auth réelle ici
    toNodeHandler: vi.fn(() => (_req: any, res: any) => res.status(404).end()),
    // fromNodeHeaders est mocké aussi car il est importé quelque part dans le code, même si on ne l'utilise pas directement
    fromNodeHeaders: vi.fn(),
}));

// On remplace le module auth par un faux avec une méthode getSession simulée
vi.mock("@/lib/auth", () => ({
    // Le faux objet auth a la même structure que le vrai, mais avec des fonctions qui ne font rien
    auth: { api: { getSession: vi.fn() } },
}));

// On importe le faux db APRÈS avoir configuré les mocks — l'ordre est crucial car Node.js utilise la version mockée
import db from "@/lib/db";

// On crée le groupe de tests principal pour l'API des builds (configurations de jeu des joueurs)
describe("Builds API", () => {
    // Avant chaque test, on nettoie tous les mocks pour repartir de zéro (comme effacer le tableau noir entre deux cours)
    beforeEach(() => {
        // On remet à zéro l'historique de tous les appels de fonctions mockées
        vi.clearAllMocks();
    });

    // Sous-groupe de tests pour GET /builds (récupérer tous les builds)
    describe("GET /builds", () => {
        // Test : vérifier que la route retourne la liste de tous les builds
        it("devrait retourner tous les builds", async () => {
            // On crée un tableau de faux builds — ici un seul build pour Jett en style agressif
            const mockBuilds = [
                // Un faux build avec un id, un nom et un style de jeu
                { id: "1", name: "Aggro Jett", gameplay: "Aggressive" },
            ];
            // On configure le faux findMany pour qu'il retourne nos faux builds quand il sera appelé
            (db.build.findMany as any).mockResolvedValue(mockBuilds);

            // On envoie une requête GET sur /builds et on attend la réponse
            const res = await request(app).get("/builds");

            // On vérifie que le statut HTTP est 200 (tout va bien, voici les données)
            expect(res.status).toBe(200);
            // On vérifie que le corps de la réponse contient exactement les builds qu'on a préparés
            expect(res.body).toEqual(mockBuilds);
        });
    });

    // Sous-groupe de tests pour GET /builds/:id (récupérer un build spécifique)
    describe("GET /builds/:id", () => {
        // Test : vérifier que la route retourne 404 quand le build n'existe pas dans la base de données
        it("devrait retourner 404 si build pas trouvé", async () => {
            // On configure findUnique pour retourner null — comme chercher un joueur inexistant dans l'équipe
            (db.build.findUnique as any).mockResolvedValue(null);

            // On envoie une requête GET avec un id qui n'existe pas (999)
            const res = await request(app).get("/builds/999");

            // On vérifie que la réponse est bien 404 (pas trouvé) — le serveur nous dit "ce build n'existe pas"
            expect(res.status).toBe(404);
        });
    });

    // Sous-groupe de tests pour POST /builds (créer un nouveau build)
    describe("POST /builds", () => {
        // Test : vérifier qu'on peut créer un build avec toutes les données requises
        it("devrait créer un build", async () => {
            // On prépare les données d'un nouveau build complet avec nom, gameplay, agent, maps et armes
            const newBuild = {
                // Le nom du build, choisi par le joueur
                name: "Aggro Jett",
                // Le style de jeu : Aggressive, Defensive ou Polyvalent
                gameplay: "Aggressive",
                // L'identifiant de l'agent associé au build (ici un faux id)
                agentId: "agent-1",
                // La liste des identifiants des maps où ce build est efficace
                mapIds: ["map-1"],
                // La liste des identifiants des armes recommandées pour ce build
                weaponIds: ["weapon-1"],
            };
            // On simule ce que la base de données retournerait après la création : le build avec un id ajouté
            const created = { id: "1", ...newBuild };
            // On dit au faux create de retourner notre objet créé
            (db.build.create as any).mockResolvedValue(created);

            // On envoie une requête POST sur /builds avec les données du nouveau build
            const res = await request(app).post("/builds").send(newBuild);

            // On vérifie que le statut est 201 (créé) — le build a bien été enregistré
            expect(res.status).toBe(201);
        });

        // Test : vérifier que le serveur refuse un build incomplet (sans agentId)
        it("devrait refuser un build sans agentId", async () => {
            // On envoie un build avec un nom et un gameplay mais SANS agentId — c'est comme un gâteau sans farine, ça ne marche pas
            const res = await request(app).post("/builds").send({
                // On met juste le nom du build
                name: "Test",
                // On met le gameplay mais il manque l'agentId qui est obligatoire
                gameplay: "Aggressive",
            });

            // On vérifie que le statut est 400 (mauvaise requête) — le serveur refuse car il manque des données obligatoires
            expect(res.status).toBe(400);
        });
    });

    // Sous-groupe de tests pour DELETE /builds/:id (supprimer un build)
    describe("DELETE /builds/:id", () => {
        // Test : vérifier qu'un utilisateur ne peut pas supprimer le build d'un autre utilisateur
        it("devrait refuser la suppression si pas le propriétaire", async () => {
            // On simule un build qui appartient à "autre-user" — pas à notre "test-user-id" du mock d'auth
            (db.build.findUnique as any).mockResolvedValue({
                // L'id du build qu'on essaie de supprimer
                id: "1",
                // Le userId est différent de "test-user-id", donc ce n'est pas le propriétaire qui essaie de supprimer
                userId: "autre-user",
            });

            // On envoie une requête DELETE pour supprimer le build avec l'id "1"
            const res = await request(app).delete("/builds/1");

            // On vérifie que le statut est 403 (interdit) — comme essayer d'entrer dans la chambre de quelqu'un d'autre, c'est refusé
            expect(res.status).toBe(403);
        });
    });
});
