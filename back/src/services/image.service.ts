// On importe la connexion à la base de données, c'est comme ouvrir la porte du grand classeur où on range toutes les infos
import db from "@/lib/db";
// On importe Cloudinary, c'est le service qui stocke les images dans le cloud, comme un album photo en ligne
import cloudinary from "@/lib/cloudinary";

/**
 * Upload une image sur Cloudinary et enregistre la référence en DB.
 */
// Cette fonction envoie une image sur Cloudinary et enregistre son adresse dans la base de données, comme coller une photo dans un album et noter où elle est rangée
export async function uploadImage(userId: string, fileBuffer: Buffer) {
  // On crée une promesse qui va gérer l'envoi de l'image, c'est comme une boîte aux lettres qui nous prévient quand le colis est arrivé
  const result = await new Promise<{ secure_url: string; public_id: string }>(
    // resolve = tout s'est bien passé, reject = il y a eu un problème
    (resolve, reject) => {
      // On crée un flux d'envoi vers Cloudinary, comme ouvrir un tuyau pour envoyer l'image
      const stream = cloudinary.uploader.upload_stream(
        // Les options d'envoi, comme les instructions collées sur le colis
        {
          // On range l'image dans un dossier au nom de l'utilisateur, comme un casier personnel
          folder: `valorant-app/${userId}`,
          // On applique des transformations à l'image, comme la retoucher avant de la ranger
          transformation: [
            // On limite la largeur à 1920 pixels, comme réduire une photo trop grande pour qu'elle rentre dans le cadre
            { width: 1920, crop: "limit" },
            // On optimise la qualité automatiquement et on convertit en format webp, comme compresser la photo pour qu'elle prenne moins de place
            { quality: "auto", fetch_format: "webp" },
          ],
        },
        // Cette fonction est appelée quand l'envoi est terminé, comme le facteur qui sonne à la porte pour confirmer la livraison
        (error, result) => {
          // Si il y a une erreur ou pas de résultat, on signale le problème
          if (error || !result) {
            // On rejette la promesse avec l'erreur, comme renvoyer le colis à l'expéditeur avec un mot "ça n'a pas marché"
            reject(error || new Error("Upload échoué"));
          } else {
            // Sinon tout va bien, on renvoie l'URL sécurisée et l'identifiant public de l'image, comme noter l'adresse où la photo est stockée
            resolve({ secure_url: result.secure_url, public_id: result.public_id });
          }
        }
      );
      // On envoie le contenu du fichier dans le tuyau et on ferme, comme verser l'eau dans le tuyau et fermer le robinet
      stream.end(fileBuffer);
    }
  );

  // On enregistre les infos de l'image dans la base de données, comme écrire dans le registre "cette photo est rangée ici"
  return db.image.create({
    // Les données à enregistrer
    data: {
      // L'URL sécurisée de l'image sur Cloudinary, c'est l'adresse pour retrouver la photo
      url: result.secure_url,
      // L'identifiant public de l'image sur Cloudinary, c'est comme le numéro de série de la photo
      publicId: result.public_id,
      // L'identifiant de l'utilisateur qui possède cette image, c'est comme écrire le nom du propriétaire sur la photo
      userId,
    },
  });
}

/**
 * Récupère toutes les images d'un utilisateur.
 */
// Cette fonction récupère toutes les images d'un utilisateur, comme ouvrir son album photo personnel
export async function getAllImages(userId: string) {
  // On cherche dans la base de données toutes les images qui appartiennent à cet utilisateur
  return db.image.findMany({
    // On filtre par l'identifiant de l'utilisateur, comme chercher toutes les photos avec son nom dessus
    where: { userId },
    // On trie par date de création décroissante, les plus récentes en premier, comme mettre les dernières photos en haut de la pile
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Supprime une image de Cloudinary et de la DB.
 */
// Cette fonction supprime une image à la fois de Cloudinary et de la base de données, comme jeter une photo et effacer son nom du registre
export async function deleteImage(id: number, userId: string) {
  // On cherche l'image dans la base de données par son identifiant, comme chercher une photo par son numéro
  const existing = await db.image.findUnique({ where: { id } });
  // Si l'image n'existe pas ou n'appartient pas à l'utilisateur, on renvoie null (rien), comme dire "cette photo n'est pas à toi"
  if (!existing || existing.userId !== userId) return null;

  // On supprime l'image de Cloudinary en utilisant son identifiant public, comme arracher la photo de l'album en ligne
  await cloudinary.uploader.destroy(existing.publicId);
  // On supprime aussi l'enregistrement de l'image dans la base de données, comme effacer la ligne dans le registre
  await db.image.delete({ where: { id } });
  // On renvoie true pour confirmer que la suppression a réussi, comme dire "c'est fait, la photo est supprimée"
  return true;
}
