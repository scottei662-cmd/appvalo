// On importe "z" depuis Zod v4, notre outil de validation de données
// C'est le douanier qui vérifie que chaque build envoyé a la bonne forme
import { z } from "zod/v4";

// On crée un enum pour les styles de gameplay possibles d'un build
// Un build ne peut être que "Aggressive", "Defensive" ou "Polyvalent"
// C'est comme choisir un mode de jeu : attaque, défense, ou les deux
const gameplayEnum = z.enum(["Aggressive", "Defensive", "Polyvalent"]);

// On définit le schéma de validation pour CRÉER un nouveau build
// Un build, c'est une combinaison d'agent + armes + maps + style de jeu
// C'est comme une recette de cuisine : tu choisis les ingrédients et la méthode
export const createBuildSchema = z.object({
    // Le nom du build (obligatoire) — ex: "Rush B Jett" ou "Défense Sage"
    name: z.string(),
    // Le style de gameplay du build (obligatoire) — doit être l'une des 3 valeurs de gameplayEnum
    gameplay: gameplayEnum,
    // Des notes supplémentaires sur le build (optionnel) — des conseils ou remarques du créateur
    notes: z.string().optional(),
    // L'identifiant de l'agent utilisé dans ce build (obligatoire)
    // C'est comme dire "ce build est fait pour jouer avec cet agent précis"
    agentId: z.string(),
    // La liste des identifiants des maps compatibles avec ce build (obligatoire)
    // Un build peut fonctionner sur plusieurs maps — c'est un tableau de strings
    mapIds: z.array(z.string()),
    // La liste des identifiants des armes recommandées pour ce build (obligatoire)
    // Chaque build suggère certaines armes — c'est un tableau de strings
    weaponIds: z.array(z.string()),
});

// On définit le schéma pour METTRE À JOUR un build existant
// Tous les champs sont optionnels car on peut vouloir modifier qu'une seule chose
// C'est comme modifier une recette : tu changes un ingrédient sans tout réécrire
export const updateBuildSchema = z.object({
    // Le nom du build (optionnel) — on peut le renommer
    name: z.string().optional(),
    // Le style de gameplay (optionnel) — on peut changer de stratégie
    gameplay: gameplayEnum.optional(),
    // Les notes (optionnel) — on peut ajouter ou modifier des remarques
    notes: z.string().optional(),
    // L'agent associé (optionnel) — on peut changer d'agent
    agentId: z.string().optional(),
    // Les maps compatibles (optionnel) — on peut ajouter ou retirer des maps
    mapIds: z.array(z.string()).optional(),
    // Les armes recommandées (optionnel) — on peut changer l'arsenal
    weaponIds: z.array(z.string()).optional(),
});

// On exporte le type TypeScript déduit du schéma de création de build
// Ça permet d'utiliser ce type dans le reste du code pour avoir l'autocomplétion et la vérification de types
export type CreateBuildDto = z.infer<typeof createBuildSchema>;
// On exporte le type TypeScript déduit du schéma de mise à jour de build
// Tous les champs sont optionnels dans ce type
export type UpdateBuildDto = z.infer<typeof updateBuildSchema>;
