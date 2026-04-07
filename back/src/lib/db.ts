// On importe la configuration dotenv pour charger les variables d'environnement depuis le fichier .env
// C'est comme lire une feuille secrète où sont écrits les mots de passe et adresses importantes
import "dotenv/config";
// On importe PrismaClient, l'outil principal pour parler à la base de données
// C'est comme un messager qui transmet nos demandes à la base de données et rapporte les réponses
import { PrismaClient } from "@prisma/client";
// On importe l'adaptateur PostgreSQL pour Prisma
// C'est un traducteur spécialisé qui permet à Prisma de comprendre le dialecte PostgreSQL
import { PrismaPg } from "@prisma/adapter-pg";

// On crée une variable globale pour stocker notre client Prisma
// globalThis est un espace partagé accessible partout dans l'application
// Le "as unknown as" est un cast TypeScript : on force TypeScript à accepter qu'on ajoute une propriété "prisma" à globalThis
// C'est comme mettre une étiquette sur un casier partagé pour y ranger notre connexion à la base de données
const globalForPrisma = globalThis as unknown as {
  // On déclare que cette variable globale peut contenir un PrismaClient ou être undefined (pas encore créé)
  prisma: PrismaClient | undefined;
};

// On crée une fonction qui fabrique un nouveau client Prisma connecté à notre base de données
// C'est comme une usine qui construit un nouveau messager prêt à parler à la base de données
function createPrismaClient() {
  // On récupère l'adresse de connexion à la base de données depuis les variables d'environnement
  // C'est comme lire l'adresse postale de la base de données sur notre feuille secrète
  const connectionString = process.env.DATABASE_URL;

  // Si l'adresse de connexion n'existe pas, on lance une erreur
  // C'est comme dire : "impossible d'envoyer une lettre sans adresse !"
  if (!connectionString) {
    throw new Error("DATABASE_URL n'est pas défini !");
  }

  // On crée l'adaptateur PostgreSQL avec l'adresse de connexion
  // C'est comme préparer l'enveloppe avec la bonne adresse avant d'envoyer le courrier
  const adapter = new PrismaPg({ connectionString });

  // On crée et retourne un nouveau client Prisma qui utilise notre adaptateur PostgreSQL
  // C'est comme embaucher le messager et lui donner l'enveloppe avec l'adresse
  return new PrismaClient({ adapter });
}

// On crée notre client de base de données (db)
// L'opérateur ?? signifie : "si globalForPrisma.prisma existe déjà, utilise-le ; sinon, crée-en un nouveau"
// C'est comme vérifier si un messager est déjà disponible avant d'en embaucher un nouveau
// Ça évite de créer plein de connexions inutiles à chaque rechargement du code
const db = globalForPrisma.prisma ?? createPrismaClient();

// En mode développement (pas en production), on stocke le client dans la variable globale
// Comme ça, quand le code se recharge à chaud (hot reload), on réutilise la même connexion
// C'est comme garder le même messager entre deux rechargements au lieu d'en embaucher un nouveau à chaque fois
if (process.env.NODE_ENV !== "production") {
  // On range notre client Prisma dans le casier global pour le réutiliser plus tard
  globalForPrisma.prisma = db;
}

// On exporte notre client de base de données pour que les autres fichiers puissent l'utiliser
// C'est comme rendre le messager disponible pour tout le monde dans l'application
export default db;
