// On importe notre application Express configurée dans app.ts (c'est le serveur tout prêt, on n'a plus qu'à le démarrer)
import app from '@/app';
// On importe la connexion à la base de données Prisma (c'est comme le câble qui relie notre serveur au coffre-fort où sont stockées les données)
import db from '@/lib/db';

// On définit le port sur lequel le serveur va écouter — le port 3000, c'est comme le numéro de porte de notre restaurant
const PORT = process.env.PORT || 3000;

// ========== DÉMARRAGE DU SERVEUR ==========
// On démarre le serveur en lui disant d'écouter sur le port 3000 — comme ouvrir les portes du restaurant le matin
// La fonction async en callback sera exécutée une fois que le serveur est prêt à recevoir des requêtes
app.listen(PORT, async () => {
    // On affiche dans la console que le serveur tourne bien, pour que le développeur sache que tout va bien
    console.log(`Server is running on port ${PORT}`);
    // On essaie de se connecter à la base de données dans un bloc try/catch (comme essayer d'allumer la lumière avec un plan B si ça ne marche pas)
    try{
        // On attend que Prisma se connecte à la base de données PostgreSQL — comme brancher le tuyau d'eau avant d'ouvrir le robinet
        await db.$connect();
        // Si la connexion réussit, on affiche un message de succès dans la console pour le confirmer
        console.log("Database connected successfull");
    // Si la connexion échoue, on attrape l'erreur au lieu de laisser le serveur planter (comme un filet de sécurité)
    } catch(error){
        // On affiche l'erreur dans la console pour que le développeur puisse comprendre ce qui n'a pas marché
        console.log("Database connection failed:", error);
    }
});
