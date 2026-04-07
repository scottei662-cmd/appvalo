// On importe Express et ses types pour créer des routes, c'est comme importer les outils pour construire des routes dans une ville
import express, { Request, Response, NextFunction } from "express";
// On importe Multer, un outil qui gère l'envoi de fichiers, c'est comme un réceptionniste qui reçoit les colis
import multer from "multer";
// On importe le middleware d'authentification, c'est comme le vigile qui vérifie les badges à l'entrée
import { authMiddleware } from "@/middlewares/auth.middleware";
// On importe le contrôleur d'images qui contient les actions possibles, c'est comme le chef d'équipe qui sait quoi faire avec les photos
import * as imageController from "@/controllers/image.controller";

// On crée un routeur Express, c'est comme dessiner un plan de routes pour les images
const router: express.Router = express.Router();

// On configure Multer pour gérer les fichiers envoyés
const upload = multer({
  // On stocke les fichiers en mémoire (dans la RAM), c'est comme garder le colis dans les mains au lieu de le poser par terre
  storage: multer.memoryStorage(),
  // On ajoute un filtre pour vérifier le type de fichier, comme un douanier qui vérifie le contenu du colis
  fileFilter: (_req, file, cb) => {
    // Si le type du fichier commence par "image/", c'est bien une image, on accepte
    if (file.mimetype.startsWith("image/")) {
      // On dit "ok, c'est bon, laisse passer" (cb = callback, null = pas d'erreur, true = accepté)
      cb(null, true);
    } else {
      // Sinon on refuse en renvoyant une erreur, comme dire "non, on n'accepte que les images ici"
      cb(new Error("Seules les images sont autorisées"));
    }
  },
});

// On applique le middleware d'authentification à TOUTES les routes de ce routeur, comme mettre un vigile devant tout le bâtiment
router.use(authMiddleware);

// Route POST "/" : quand quelqu'un veut envoyer une image, on utilise Multer pour recevoir le fichier puis le contrôleur pour le traiter
router.post("/", upload.single("image"), imageController.upload);
// Route GET "/" : quand quelqu'un veut voir toutes ses images, on appelle la fonction getAll du contrôleur
router.get("/", imageController.getAll);
// Route DELETE "/:id" : quand quelqu'un veut supprimer une image précise (identifiée par son id dans l'URL), on appelle la fonction remove
router.delete("/:id", imageController.remove);

// Gestionnaire d'erreurs pour les erreurs liées à Multer, c'est comme un filet de sécurité qui attrape les problèmes d'envoi de fichiers
// Error handler pour les erreurs multer
router.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  // Si l'erreur vient de Multer (problème avec le fichier envoyé)
  if (err instanceof multer.MulterError) {
    // On renvoie une erreur 400 (mauvaise requête) avec le message de Multer, comme dire "ton colis a un problème"
    res.status(400).json({ message: err.message });
    // On arrête ici, pas besoin d'aller plus loin
    return;
  }
  // Si l'erreur est celle qu'on a définie nous-mêmes pour les fichiers non-images
  if (err.message === "Seules les images sont autorisées") {
    // On renvoie aussi une erreur 400 avec notre message personnalisé
    res.status(400).json({ message: err.message });
    // On arrête ici aussi
    return;
  }
  // Pour toute autre erreur inattendue, on renvoie une erreur 500 (erreur serveur), comme dire "quelque chose s'est cassé à l'intérieur"
  res.status(500).json({ message: "Erreur serveur" });
});

// On exporte le routeur pour qu'il puisse être utilisé dans l'application principale, comme donner le plan des routes au chef de chantier
export default router;
