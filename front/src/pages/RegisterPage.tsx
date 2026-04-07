// On importe useState depuis React — c'est une boite magique qui garde en memoire des valeurs qui changent
import { useState } from "react";
// On importe useNavigate pour rediriger l'utilisateur, et Link pour creer des liens — comme des fleches vers d'autres pages
import { useNavigate, Link } from "react-router-dom";

// On importe la fonction signUp qui permet de creer un nouveau compte — c'est comme s'inscrire dans un club
import { signUp } from "../lib/auth-client";

// On declare la fonction RegisterPage — c'est la page d'inscription, ou on cree son compte pour la premiere fois
function RegisterPage() {
    // navigate permet de changer de page automatiquement — comme un ascenseur qui t'emmene a un autre etage
    const navigate = useNavigate();
    // Boite pour stocker le nom d'utilisateur — au debut elle est vide
    const [name, setName] = useState("");
    // Boite pour stocker l'email — au debut elle est vide
    const [email, setEmail] = useState("");
    // Boite pour stocker le mot de passe — au debut elle est vide
    const [password, setPassword] = useState("");
    // Boite pour stocker les erreurs — si quelque chose ne va pas, on met le message ici
    const [error, setError] = useState("");
    // Boite pour savoir si on est en train d'attendre — comme un sablier qui tourne
    const [loading, setLoading] = useState(false);

    // Cette fonction se declenche quand on clique sur "S'inscrire" — elle envoie les infos au serveur
    const handleSubmit = async (e: React.FormEvent) => {
        // On empeche la page de se recharger — on veut rester sur place pendant le traitement
        e.preventDefault();
        // On efface les erreurs precedentes — on repart a zero
        setError("");
        // On active le mode chargement — le sablier commence a tourner
        setLoading(true);
        // On essaie de creer le compte — comme remplir un formulaire d'inscription
        try {
            // On appelle signUp avec le nom, l'email et le mot de passe — on envoie tout au serveur
            await signUp.email({ name, email, password });
            // Si tout va bien, on redirige vers la page d'accueil — bienvenue, ton compte est cree !
            navigate("/");
        // Si ca ne marche pas — par exemple l'email existe deja
        } catch (err: any) {
            // On affiche le message d'erreur
            setError(err.message || "Erreur lors de l'inscription");
        // Que ca marche ou pas, on fait le menage
        } finally {
            // On arrete le chargement — le sablier s'arrete
            setLoading(false);
        }
    };

    // On retourne le JSX — c'est ce que l'utilisateur voit a l'ecran
    return (
        // Conteneur principal — occupe toute la hauteur de l'ecran, fond bleu marine, contenu centre
        <div className="min-h-screen bg-navy flex justify-center">
        {/* Conteneur interieur — largeur max 600px, tout centre verticalement, avec du padding horizontal */}
        <div className="w-full max-w-[600px] min-h-screen bg-navy flex flex-col items-center justify-center px-6">
            {/* Logo cliquable — un lien vers la page d'accueil, comme un bouton "retour a la maison" */}
            <Link to="/" aria-label="Accueil">
                {/* Image du logo — taille fixe, marge en bas pour espacer du titre */}
                <img src="/logo.svg" alt="Logo" className="w-[48px] h-[40px] mb-6" />
            </Link>

            {/* Titre de la page — "Inscription" en gros, gras, italique, majuscules, couleur beige */}
            <h1 className="font-oswald text-beige text-3xl font-bold italic uppercase mb-8">Inscription</h1>

            {/* Formulaire d'inscription — quand on le soumet, handleSubmit s'execute */}
            <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
                {/* Si il y a une erreur, on affiche une boite rouge d'alerte */}
                {error && (
                    // Boite d'erreur — fond rouge semi-transparent, bordure rouge, texte rouge
                    <div className="bg-val-red/20 border border-val-red/50 text-val-red font-rajdhani text-sm rounded-lg p-3">
                        {/* Le message d'erreur s'affiche ici */}
                        {error}
                    </div>
                )}

                {/* Champ nom d'utilisateur — l'utilisateur choisit comment il veut s'appeler */}
                <input
                    // Type texte — on peut ecrire n'importe quoi ici
                    type="text"
                    // Texte gris qui indique quoi ecrire quand le champ est vide
                    placeholder="Nom d'utilisateur"
                    // La valeur affichee est celle de notre boite "name"
                    value={name}
                    // A chaque lettre tapee, on met a jour la boite "name"
                    onChange={(e) => setName(e.target.value)}
                    // Obligatoire — il faut un nom pour s'inscrire
                    required
                    // Style du champ — fond sombre, bordure, coins arrondis, texte beige
                    className="w-full bg-dark-input border border-navy-lighter rounded-xl px-4 py-3 text-beige placeholder-beige/40 font-rajdhani text-sm focus:outline-none focus:border-val-red"
                />

                {/* Champ email — l'utilisateur entre son adresse email */}
                <input
                    // Type email — le navigateur verifie que c'est bien un format d'email valide
                    type="email"
                    // Texte indicatif quand le champ est vide
                    placeholder="Email"
                    // Valeur liee a la boite "email"
                    value={email}
                    // Mise a jour de la boite "email" a chaque frappe
                    onChange={(e) => setEmail(e.target.value)}
                    // Obligatoire — pas d'inscription sans email
                    required
                    // Meme style que les autres champs pour garder une coherence visuelle
                    className="w-full bg-dark-input border border-navy-lighter rounded-xl px-4 py-3 text-beige placeholder-beige/40 font-rajdhani text-sm focus:outline-none focus:border-val-red"
                />

                {/* Champ mot de passe — les caracteres sont caches */}
                <input
                    // Type password — les lettres sont remplacees par des points pour la securite
                    type="password"
                    // Texte indicatif
                    placeholder="Mot de passe"
                    // Valeur liee a la boite "password"
                    value={password}
                    // Mise a jour a chaque frappe
                    onChange={(e) => setPassword(e.target.value)}
                    // Obligatoire — il faut un mot de passe
                    required
                    // Minimum 8 caracteres — pour la securite, comme un cadenas qui a besoin d'au moins 8 chiffres
                    minLength={8}
                    // Meme style que les autres champs
                    className="w-full bg-dark-input border border-navy-lighter rounded-xl px-4 py-3 text-beige placeholder-beige/40 font-rajdhani text-sm focus:outline-none focus:border-val-red"
                />

                {/* Bouton d'inscription — le gros bouton rouge pour valider */}
                <button
                    // Ce bouton soumet le formulaire quand on clique
                    type="submit"
                    // Desactive pendant le chargement — pour eviter de cliquer plusieurs fois
                    disabled={loading}
                    // Style — fond rouge, texte blanc, gras, coins arrondis, effet au survol
                    className="w-full bg-val-red text-white font-rajdhani font-bold py-3 rounded-xl hover:bg-val-red-dark transition-colors disabled:opacity-50"
                >
                    {/* Si on charge, on affiche "Inscription...", sinon "S'inscrire" */}
                    {loading ? "Inscription..." : "S'inscrire"}
                </button>

                {/* Lien vers la page de connexion — pour ceux qui ont deja un compte */}
                <p className="font-rajdhani text-beige/50 text-sm text-center">
                    {/* Texte d'indication avec un espace insecable avant le lien */}
                    Déjà un compte ?{" "}
                    {/* Lien cliquable vers /login — rouge et souligne au survol */}
                    <Link to="/login" className="text-val-red hover:underline">Se connecter</Link>
                </p>
            {/* Fin du formulaire */}
            </form>
        {/* Fin du conteneur interieur */}
        </div>
        {/* Fin du conteneur principal */}
        </div>
    );
}

// On exporte RegisterPage pour que le routeur puisse l'utiliser — comme ranger la page dans le bon dossier
export default RegisterPage;
