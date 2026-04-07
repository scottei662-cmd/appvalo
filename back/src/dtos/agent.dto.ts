// On importe "z" depuis la librairie Zod (version 4)
// Zod est un outil de validation de données : il vérifie que les données ont la bonne forme
// C'est comme un douanier qui vérifie que chaque colis contient exactement ce qui est déclaré
import { z } from "zod/v4";

// On crée un enum (liste fermée de valeurs possibles) pour les rôles des agents dans Valorant
// Un agent ne peut avoir QUE l'un de ces 4 rôles, rien d'autre
// C'est comme dire "tu peux être Contrôleur, Duelliste, Initiateur ou Sentinelle, point final"
const roleEnum = z.enum(["Controller", "Duelist", "Initiator", "Sentinel"]);

// On définit le schéma de validation pour une capacité (ability) d'un agent
// Chaque agent a des capacités spéciales, et ce schéma décrit la forme exacte d'une capacité
// C'est comme un formulaire à remplir pour décrire chaque pouvoir d'un personnage
const abilitySchema = z.object({
    // Le nom de la capacité, doit être une chaîne de caractères (texte)
    // Par exemple : "Smoke Screen" ou "Flash Bang"
    name: z.string(),
    // L'icône de la capacité, une chaîne de caractères (probablement une URL vers l'image de l'icône)
    icon: z.string(),
    // L'aperçu visuel de la capacité (une URL vers une vidéo ou image de démonstration)
    // .optional() signifie que ce champ n'est pas obligatoire — on peut l'envoyer ou pas
    preview: z.string().optional(),
    // Le nombre de charges (utilisations) de la capacité
    // .int() = doit être un nombre entier (pas de décimales, on ne peut pas avoir 1.5 charges)
    // .min(0) = minimum 0, on ne peut pas avoir un nombre négatif de charges
    charges: z.number().int().min(0),
    // La touche du clavier associée à cette capacité (ex: "Q", "E", "C", "X")
    keyboardKey: z.string(),
    // La description textuelle de ce que fait la capacité
    // C'est l'explication du pouvoir, comme dans un manuel de jeu
    description: z.string(),
});

// On définit le schéma pour CRÉER un nouvel agent
// Tous les champs obligatoires doivent être fournis lors de la création
// C'est comme le formulaire d'inscription d'un nouveau personnage dans le jeu
export const createAgentSchema = z.object({
    // Le nom de l'agent (obligatoire) — ex: "Jett", "Omen", "Sage"
    name: z.string(),
    // La description courte de l'agent (obligatoire) — un résumé de qui il est
    description: z.string(),
    // La biographie complète de l'agent (obligatoire) — son histoire détaillée
    biography: z.string(),
    // Le pays d'origine de l'agent (obligatoire) — ex: "South Korea", "Morocco"
    origin: z.string(),
    // Le rôle de l'agent (obligatoire) — doit être l'une des 4 valeurs de roleEnum
    role: roleEnum,
    // L'URL du portrait de l'agent (obligatoire) — son image principale
    portrait: z.string(),
    // L'URL du portrait en pied de l'agent (optionnel) — son image en taille complète
    fullPortrait: z.string().optional(),
    // L'URL de l'image de fond de l'agent (optionnel) — le décor derrière son portrait
    background: z.string().optional(),
    // La liste des capacités de l'agent (optionnel) — un tableau d'objets suivant abilitySchema
    // C'est comme la liste des pouvoirs du personnage, chacun validé par abilitySchema
    abilities: z.array(abilitySchema).optional(),
});

// On définit le schéma pour METTRE À JOUR un agent existant
// Tous les champs sont optionnels car on ne veut peut-être modifier qu'un seul champ
// C'est comme un formulaire de modification : tu changes seulement ce que tu veux
export const updateAgentSchema = z.object({
    // Le nom de l'agent (optionnel) — on peut le changer ou le laisser tel quel
    name: z.string().optional(),
    // La description de l'agent (optionnel)
    description: z.string().optional(),
    // La biographie de l'agent (optionnel)
    biography: z.string().optional(),
    // L'origine de l'agent (optionnel)
    origin: z.string().optional(),
    // Le rôle de l'agent (optionnel) — s'il est fourni, doit être dans la liste roleEnum
    role: roleEnum.optional(),
    // Le portrait de l'agent (optionnel)
    portrait: z.string().optional(),
    // Le portrait en pied (optionnel)
    fullPortrait: z.string().optional(),
    // L'image de fond (optionnel)
    background: z.string().optional(),
    // Les capacités de l'agent (optionnel) — si fourni, doit suivre le format abilitySchema
    abilities: z.array(abilitySchema).optional(),
});

// On exporte le type TypeScript déduit du schéma de création
// z.infer permet de transformer un schéma Zod en type TypeScript automatiquement
// C'est comme dire "TypeScript, le type CreateAgentDto a exactement la forme du schéma createAgentSchema"
export type CreateAgentDto = z.infer<typeof createAgentSchema>;
// Même chose pour le type de mise à jour — tous les champs sont optionnels
export type UpdateAgentDto = z.infer<typeof updateAgentSchema>;
