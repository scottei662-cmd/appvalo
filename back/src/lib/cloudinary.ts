// On importe la version 2 de la librairie Cloudinary et on la renomme "cloudinary"
// Cloudinary est un service de stockage d'images et de vidéos dans le cloud
// C'est comme un album photo en ligne où on peut ranger et retrouver toutes nos images
import { v2 as cloudinary } from "cloudinary";

// On configure Cloudinary avec nos identifiants secrets
// C'est comme se connecter à notre compte d'album photo en ligne avec nos identifiants
cloudinary.config({
  // Le nom de notre espace cloud sur Cloudinary (comme un nom d'utilisateur)
  // On le récupère depuis les variables d'environnement pour ne pas l'écrire en dur dans le code
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  // La clé API, c'est comme un badge d'accès qui dit "j'ai le droit d'utiliser ce service"
  // Elle est aussi rangée dans les variables d'environnement pour rester secrète
  api_key: process.env.CLOUDINARY_API_KEY,
  // Le secret API, c'est comme le mot de passe qui accompagne le badge d'accès
  // Sans lui, la clé API seule ne suffit pas — c'est une double vérification de sécurité
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// On exporte l'instance Cloudinary configurée pour que les autres fichiers puissent l'utiliser
// C'est comme donner l'accès à l'album photo à tous ceux qui en ont besoin dans l'application
export default cloudinary;
