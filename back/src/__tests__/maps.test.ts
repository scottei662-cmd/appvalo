// On importe les fonctions de test de Vitest : describe pour grouper les tests, it pour écrire un test, expect pour vérifier un résultat, vi pour créer des faux objets, beforeEach pour exécuter du code avant chaque test
import { describe, it, expect, vi, beforeEach } from "vitest";
// On importe supertest, un outil qui permet de simuler des requêtes HTTP sur notre API sans démarrer un vrai serveur (comme tester une voiture sur un simulateur)
import request from "supertest";
// On importe notre application Express pour pouvoir envoyer des fausses requêtes dessus
import app from "@/app";

// On crée un faux module Prisma (Mock) qui remplace la vraie base de données — comme jouer avec des pièces de Monopoly au lieu de vrai argent
// Ça évite de toucher à la vraie base de données pendant les tests
vi.mock("@/lib/db", () => ({
    // On exporte un objet par défaut qui imite la structure de Prisma
    default: {
        // On crée un faux modèle "map" avec toutes les méthodes que Prisma utilise normalement
        map: {
            // findMany est une fausse fonction qui simule la récupération de plusieurs maps
            findMany: vi.fn(),
            // findUnique est une fausse fonction qui simule la récupération d'une seule map par son identifiant
            findUnique: vi.fn(),
            // create est une fausse fonction qui simule la création d'une nouvelle map
            create: vi.fn(),
            // update est une fausse fonction qui simule la mise à jour d'une map existante
            update: vi.fn(),
            // delete est une fausse fonction qui simule la suppression d'une map
            delete: vi.fn(),
        },
        // On crée une fausse fonction $connect pour simuler la connexion à la base de données (sinon l'app planterait en essayant de se connecter)
        $connect: vi.fn(),
    },
}));

// On crée un faux middleware d'authentification — au lieu de vérifier un vrai token, on laisse passer tout le monde avec un faux userId
// C'est comme mettre un faux vigile qui dit "oui oui entre" à tout le monde pendant les tests
vi.mock("@/middlewares/auth.middleware", () => ({
    // La fausse fonction authMiddleware reçoit la requête, la réponse et le next (pour passer au middleware suivant)
    authMiddleware: vi.fn((req: any, _res: any, next: any) => {
        // On met un faux userId dans la requête pour simuler un utilisateur connecté
        req.userId = "test-user-id";
        // On appelle next() pour dire "c'est bon, passe à la suite" — comme un tampon sur la main à l'entrée d'un parc
        next();
    }),
}));

// On crée un faux module better-auth/node pour éviter que l'authentification réelle s'active pendant les tests
vi.mock("better-auth/node", () => ({
    // toNodeHandler retourne une fausse fonction qui répond toujours 404 (pas trouvé) — on n'a pas besoin de l'auth réelle en test
    toNodeHandler: vi.fn(() => (_req: any, res: any) => res.status(404).end()),
    // fromNodeHeaders est une fausse fonction qui ne fait rien, car on n'en a pas besoin dans les tests
    fromNodeHeaders: vi.fn(),
}));

// On crée un faux module auth pour simuler le système d'authentification Better Auth
vi.mock("@/lib/auth", () => ({
    // On crée un faux objet auth avec une méthode getSession simulée (qui ne fait rien)
    auth: { api: { getSession: vi.fn() } },
}));

// On importe le faux module db APRÈS l'avoir mocké — c'est important car l'import récupère la version mockée
// C'est comme récupérer le faux billet de Monopoly après l'avoir fabriqué
import db from "@/lib/db";

// On crée un groupe de tests appelé "Maps API" — c'est comme un dossier qui contient tous les tests liés aux maps
describe("Maps API", () => {
    // Avant chaque test, on remet tous les mocks à zéro pour que chaque test parte d'une base propre (comme nettoyer le tableau avant chaque exercice)
    beforeEach(() => {
        // On efface tous les appels et résultats précédents des fonctions mockées
        vi.clearAllMocks();
    });

    // Sous-groupe de tests pour la route GET /maps (récupérer toutes les maps)
    describe("GET /maps", () => {
        // Test : on vérifie que la route retourne bien toutes les maps
        it("devrait retourner toutes les maps", async () => {
            // On crée de fausses données de maps, comme des cartes dans un jeu de société
            const mockMaps = [
                // Première fausse map : Bind avec son image
                { id: "1", name: "Bind", image: "bind.jpg" },
                // Deuxième fausse map : Haven avec son image
                { id: "2", name: "Haven", image: "haven.jpg" },
            ];
            // On dit au faux findMany de retourner nos fausses maps quand il sera appelé (comme préparer la réponse à l'avance)
            (db.map.findMany as any).mockResolvedValue(mockMaps);

            // On envoie une requête GET sur /maps avec supertest et on attend la réponse
            const res = await request(app).get("/maps");

            // On vérifie que le code de statut HTTP est 200 (succès) — comme vérifier qu'on a bien reçu un "OK"
            expect(res.status).toBe(200);
            // On vérifie que le corps de la réponse contient exactement nos fausses maps — les données doivent être identiques
            expect(res.body).toEqual(mockMaps);
        });
    });

    // Sous-groupe de tests pour la route GET /maps/:id (récupérer une map par son identifiant)
    describe("GET /maps/:id", () => {
        // Test : on vérifie que la route retourne bien une map quand on donne un id valide
        it("devrait retourner une map par id", async () => {
            // On crée une seule fausse map pour simuler le résultat de la recherche par id
            const mockMap = { id: "1", name: "Bind", image: "bind.jpg" };
            // On dit au faux findUnique de retourner cette map quand il sera appelé
            (db.map.findUnique as any).mockResolvedValue(mockMap);

            // On envoie une requête GET sur /maps/1 pour récupérer la map avec l'id "1"
            const res = await request(app).get("/maps/1");

            // On vérifie que le statut est 200 (succès)
            expect(res.status).toBe(200);
            // On vérifie que la réponse contient bien la map qu'on attendait
            expect(res.body).toEqual(mockMap);
        });

        // Test : on vérifie que la route retourne une erreur 404 quand la map n'existe pas
        it("devrait retourner 404 si map pas trouvée", async () => {
            // On dit au faux findUnique de retourner null (rien trouvé), comme chercher un livre inexistant à la bibliothèque
            (db.map.findUnique as any).mockResolvedValue(null);

            // On envoie une requête GET avec un id qui n'existe pas (999)
            const res = await request(app).get("/maps/999");

            // On vérifie que le statut est 404 (pas trouvé) — la map n'existe pas, donc c'est normal
            expect(res.status).toBe(404);
        });
    });

    // Sous-groupe de tests pour la route POST /maps (créer une nouvelle map)
    describe("POST /maps", () => {
        // Test : on vérifie qu'on peut créer une nouvelle map avec des données valides
        it("devrait créer une map", async () => {
            // On prépare les données de la nouvelle map à créer (nom et image)
            const newMap = { name: "Ascent", image: "ascent.jpg" };
            // On crée l'objet "created" qui simule ce que la base de données retournerait après la création (avec un id en plus)
            const created = { id: "3", ...newMap };
            // On dit au faux create de retourner l'objet créé quand il sera appelé
            (db.map.create as any).mockResolvedValue(created);

            // On envoie une requête POST sur /maps avec les données de la nouvelle map dans le corps de la requête
            const res = await request(app).post("/maps").send(newMap);

            // On vérifie que le statut est 201 (créé avec succès) — le code HTTP pour "une nouvelle ressource a été créée"
            expect(res.status).toBe(201);
            // On vérifie que la réponse contient bien la map créée avec son id
            expect(res.body).toEqual(created);
        });

        // Test : on vérifie que la route refuse de créer une map si les données sont manquantes
        it("devrait retourner 400 si données invalides", async () => {
            // On envoie une requête POST avec un objet vide (pas de nom, pas d'image) — comme envoyer une lettre sans adresse
            const res = await request(app).post("/maps").send({});

            // On vérifie que le statut est 400 (mauvaise requête) — le serveur refuse car les données sont invalides
            expect(res.status).toBe(400);
        });
    });

    // Sous-groupe de tests pour la route DELETE /maps/:id (supprimer une map)
    describe("DELETE /maps/:id", () => {
        // Test : on vérifie qu'on peut supprimer une map qui existe
        it("devrait supprimer une map", async () => {
            // On dit au faux findUnique de retourner une map existante (on vérifie d'abord qu'elle existe avant de la supprimer)
            (db.map.findUnique as any).mockResolvedValue({ id: "1" });
            // On dit au faux delete de retourner un objet vide (la suppression a réussi, il n'y a rien à retourner)
            (db.map.delete as any).mockResolvedValue({});

            // On envoie une requête DELETE sur /maps/1 pour supprimer la map avec l'id "1"
            const res = await request(app).delete("/maps/1");

            // On vérifie que le statut est 204 (pas de contenu) — la suppression a réussi et il n'y a rien à retourner
            expect(res.status).toBe(204);
        });
    });
});
