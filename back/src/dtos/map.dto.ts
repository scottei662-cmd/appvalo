// On importe "z" depuis Zod v4, notre outil de validation de données
// C'est le gardien qui s'assure que les données des maps sont correctes avant de les accepter
import { z } from "zod/v4";

// On définit le schéma de validation pour CRÉER une nouvelle map
// Une map dans Valorant, c'est un terrain de jeu — comme un terrain de foot mais pour le jeu vidéo
// Ce schéma décrit les informations nécessaires pour enregistrer une nouvelle map
export const createMapSchema = z.object({
    // Le nom de la map (obligatoire) — ex: "Ascent", "Bind", "Haven"
    // Doit être une chaîne de caractères
    name: z.string(),
    // L'URL de l'image de la map (obligatoire) — la photo ou miniature qui représente la map
    // C'est l'image qu'on verra dans la liste des maps
    image: z.string(),
});

// On définit le schéma pour METTRE À JOUR une map existante
// Les deux champs sont optionnels car on peut vouloir ne changer que le nom ou que l'image
// C'est comme un formulaire de modification partielle
export const updateMapSchema = z.object({
    // Le nom de la map (optionnel) — on peut le renommer si besoin
    name: z.string().optional(),
    // L'URL de l'image de la map (optionnel) — on peut changer la photo
    image: z.string().optional(),
});

// On exporte le type TypeScript déduit du schéma de création
// Ça donne un type avec { name: string, image: string } pour l'autocomplétion
export type CreateMapDto = z.infer<typeof createMapSchema>;
// On exporte le type TypeScript déduit du schéma de mise à jour
// Ça donne un type avec { name?: string, image?: string } — tout est optionnel
export type UpdateMapDto = z.infer<typeof updateMapSchema>;
