// On importe les types Request et Response depuis Express, comme des formulaires types pour les demandes et les réponses
import { Request, Response } from "express";
// On importe toutes les fonctions du service image, comme une boîte à outils spécialisée pour gérer les photos
import * as imageService from "@/services/image.service";

/**
 * POST / — Upload une image.
 */
// On exporte la fonction upload qui envoie une image sur le serveur, comme coller une photo dans un album
export async function upload(req: Request, res: Response): Promise<void> {
  // On ouvre un bloc "essayer", comme mettre un filet de sécurité avant de faire une acrobatie
  try {
    // On vérifie si un fichier a bien été envoyé avec la requête, comme vérifier qu'il y a bien une photo dans l'enveloppe
    if (!req.file) {
      // Si pas de fichier, on renvoie un code 400 (mauvaise demande), comme dire "tu as oublié de mettre la photo !"
      res.status(400).json({ message: "Aucune image fournie" });
      // On arrête la fonction ici, comme fermer la porte car il n'y a rien à faire
      return;
    }

    // On demande au service d'enregistrer l'image avec l'identifiant de l'utilisateur et le contenu du fichier, comme coller la photo dans l'album du bon élève
    const image = await imageService.uploadImage(req.userId!, req.file.buffer);
    // On renvoie l'image créée avec le code 201 (créé), comme montrer la photo collée dans l'album
    res.status(201).json(image);
  // Si quelque chose se passe mal, on attrape l'erreur
  } catch (error) {
    // On renvoie un message d'erreur serveur, comme dire "la machine à coller est en panne"
    res.status(500).json({ message: "Erreur serveur" });
  }
}

/**
 * GET / — Récupère toutes les images de l'utilisateur.
 */
// On exporte la fonction getAll qui récupère toutes les images d'un utilisateur, comme feuilleter tout l'album photo
export async function getAll(req: Request, res: Response): Promise<void> {
  // On ouvre un bloc "essayer", comme mettre un filet de sécurité
  try {
    // On demande au service toutes les images de l'utilisateur connecté, comme demander au bibliothécaire "montre-moi toutes mes photos"
    const images = await imageService.getAllImages(req.userId!);
    // On renvoie la liste des images, comme donner l'album photo au visiteur
    res.json(images);
  // Si quelque chose se passe mal, on attrape l'erreur
  } catch (error) {
    // On renvoie un message d'erreur serveur
    res.status(500).json({ message: "Erreur serveur" });
  }
}

/**
 * DELETE /:id — Supprime une image.
 */
// On exporte la fonction remove qui supprime une image, comme arracher une photo de l'album
export async function remove(req: Request, res: Response): Promise<void> {
  // On ouvre un bloc "essayer", comme mettre un filet de sécurité
  try {
    // On demande au service de supprimer l'image avec son identifiant et celui de l'utilisateur, comme demander de retirer la photo numéro X de l'album
    const result = await imageService.deleteImage(Number(req.params.id), req.userId!);
    // Si l'image n'a pas été trouvée, on prévient
    if (!result) {
      // On renvoie un code 404 (non trouvé), comme dire "cette photo n'existe pas dans ton album"
      res.status(404).json({ message: "Image not found" });
      // On arrête la fonction ici
      return;
    }
    // On renvoie un code 204 (pas de contenu) pour confirmer la suppression, comme dire "la photo a bien été retirée"
    res.status(204).send();
  // Si quelque chose se passe mal, on attrape l'erreur (avec le type "any" pour accéder aux propriétés)
  } catch (error: any) {
    // On vérifie si l'erreur est un code Prisma "P2025" qui signifie "enregistrement non trouvé", comme vérifier si le problème vient du fait que la photo a déjà disparu
    if (error.code === "P2025") {
      // On renvoie un code 404, comme dire "la photo a déjà été retirée par quelqu'un d'autre"
      res.status(404).json({ message: "Image not found" });
      // On arrête la fonction ici
      return;
    }
    // Si c'est une autre erreur, on renvoie un message d'erreur serveur
    res.status(500).json({ message: "Erreur serveur" });
  }
}
