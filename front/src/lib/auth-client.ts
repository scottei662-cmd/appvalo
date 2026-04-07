// On importe la fonction createAuthClient depuis la bibliothèque "better-auth/react"
// C'est l'outil qui gère toute l'authentification (connexion, inscription, déconnexion)
// Comme un vigile à l'entrée d'un bâtiment — il vérifie les badges et laisse entrer les gens autorisés
import { createAuthClient } from "better-auth/react";

// On crée notre client d'authentification en lui donnant l'adresse du serveur
// baseURL pointe vers notre API backend — c'est là que le vigile vérifie les identifiants
// Le client saura où envoyer les demandes de connexion et d'inscription
export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

// On extrait les fonctions utiles du client d'authentification pour les utiliser facilement partout
// signIn — pour se connecter (comme montrer son badge au vigile)
// signUp — pour s'inscrire (comme demander un nouveau badge)
// signOut — pour se déconnecter (comme rendre son badge en partant)
// useSession — un hook React qui donne les infos de la session en cours (est-ce que quelqu'un est connecté ? qui ?)
// On les exporte pour que n'importe quel fichier de l'appli puisse les utiliser directement
export const { signIn, signUp, signOut, useSession } = authClient;
