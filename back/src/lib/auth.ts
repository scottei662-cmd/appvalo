// On importe la fonction "betterAuth" depuis la librairie "better-auth"
// C'est comme prendre la boîte à outils d'authentification, celle qui gère les connexions des utilisateurs
import { betterAuth } from "better-auth";
// On importe l'adaptateur Prisma pour Better Auth
// C'est un traducteur : il permet à Better Auth de parler avec notre base de données via Prisma
import { prismaAdapter } from "better-auth/adapters/prisma";
// On importe notre connexion à la base de données (le client Prisma qu'on a configuré dans db.ts)
// C'est comme brancher le fil entre Better Auth et notre base de données
import db from "@/lib/db";

const isProduction = process.env.NODE_ENV === "production";
// On crée et exporte notre instance d'authentification avec betterAuth()
// C'est le gardien de notre application : il vérifie qui a le droit d'entrer
export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },

  trustedOrigins: [process.env.FRONTEND_URL || "http://localhost:5173"],
  advanced: {
    crossSubDomainCookies: {
      enabled: isProduction,
    },
    defaultCookieAttributes: {
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    },
  },
});
