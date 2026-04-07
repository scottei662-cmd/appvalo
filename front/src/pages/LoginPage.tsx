// On importe useState depuis React — c'est comme une boite ou on range des valeurs qui peuvent changer (ex: ce que l'utilisateur tape)
import { useState } from "react";
// On importe useNavigate pour changer de page, et Link pour creer des liens cliquables — comme des portes vers d'autres pages
import { useNavigate, Link } from "react-router-dom";
// On importe la fonction signIn qui permet de connecter l'utilisateur — c'est comme montrer son badge pour entrer
import { signIn } from "../lib/auth-client";

// On declare la fonction LoginPage — c'est la page de connexion, comme la porte d'entree de l'application
function LoginPage() {
    // navigate permet de rediriger l'utilisateur vers une autre page — comme un GPS qui change de destination
    const navigate = useNavigate();
    // On cree une boite "email" pour stocker ce que l'utilisateur tape dans le champ email — au debut c'est vide
    const [email, setEmail] = useState("");
    // On cree une boite "password" pour stocker le mot de passe tape — au debut c'est vide aussi
    const [password, setPassword] = useState("");
    // On cree une boite "error" pour stocker les messages d'erreur — si quelque chose se passe mal, on met le message ici
    const [error, setError] = useState("");
    // On cree une boite "loading" pour savoir si on est en train d'attendre une reponse du serveur — comme un feu rouge/vert
    const [loading, setLoading] = useState(false);

    // Cette fonction se declenche quand l'utilisateur clique sur "Se connecter" — c'est le processus de connexion
    const handleSubmit = async (e: React.FormEvent) => {
        // On empeche le formulaire de recharger la page — par defaut un formulaire recharge tout, on ne veut pas ca
        e.preventDefault();
        // On efface les anciennes erreurs — on repart a zero avant chaque tentative
        setError("");
        // On met loading a true — on dit "attention, on est en train de travailler, patientez"
        setLoading(true);
        // On essaie de se connecter — comme essayer d'ouvrir une porte avec une cle
        try {
            // On appelle la fonction signIn avec l'email et le mot de passe — on envoie nos identifiants au serveur
            const result = await signIn.email({ email, password });
            // Si le serveur repond avec une erreur — la cle ne marche pas
            if (result.error) {
                // On affiche le message d'erreur du serveur, ou un message par defaut si il n'y en a pas
                setError(result.error.message || "Email ou mot de passe incorrect");
            // Sinon, la connexion a reussi — la porte s'ouvre
            } else {
                // On redirige vers la page d'accueil — bienvenue a la maison !
                navigate("/");
            }
        // Si une erreur inattendue se produit — comme une panne de courant
        } catch (err: any) {
            // On affiche le message d'erreur ou un message generique
            setError(err.message || "Erreur de connexion");
        // finally s'execute toujours, que ca ait marche ou pas — comme ranger ses affaires apres avoir essaye
        } finally {
            // On remet loading a false — on a fini de travailler, le feu repasse au vert
            setLoading(false);
        }
    };

    // On retourne le JSX — c'est le HTML que l'utilisateur va voir a l'ecran
    return (
        // Conteneur principal — prend toute la hauteur de l'ecran, fond bleu marine, centre le contenu horizontalement
        <div className="min-h-screen bg-navy flex justify-center">
        {/* Conteneur interieur — largeur max 600px, centre tout verticalement et horizontalement, comme un cadre au milieu */}
        <div className="w-full max-w-[600px] min-h-screen bg-navy flex flex-col items-center justify-center px-6">
            {/* Logo — un lien cliquable vers la page d'accueil, comme un panneau "retour a l'accueil" */}
            <Link to="/" aria-label="Accueil">
                {/* L'image du logo — petite taille 48x40 pixels, avec une marge en bas pour espacer */}
                <img src="/logo.svg" alt="Logo" className="w-[48px] h-[40px] mb-6" />
            </Link>

            {/* Titre "Connexion" — en gros, en gras, en italique, en majuscules, avec la police Oswald et couleur beige */}
            <h1 className="font-oswald text-beige text-3xl font-bold italic uppercase mb-8">Connexion</h1>

            {/* Formulaire — quand on le soumet, on appelle handleSubmit. Largeur max, elements empiles verticalement avec un espace de 4 */}
            <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
                {/* Si il y a une erreur, on affiche une boite rouge avec le message — comme un panneau "attention" */}
                {error && (
                    // Boite d'erreur — fond rouge transparent, bordure rouge, texte rouge, coins arrondis
                    <div className="bg-val-red/20 border border-val-red/50 text-val-red font-rajdhani text-sm rounded-lg p-3">
                        {/* On affiche le texte de l'erreur a l'interieur de la boite */}
                        {error}
                    </div>
                )}

                {/* Champ email — l'utilisateur tape son adresse email ici, comme ecrire son nom sur une etiquette */}
                <input
                    // Le type "email" dit au navigateur que c'est un email — il verifie le format automatiquement
                    type="email"
                    // Le placeholder est le texte gris affiche quand le champ est vide — un indice pour l'utilisateur
                    placeholder="Email"
                    // La valeur du champ est liee a notre boite "email" — ce qui est dans la boite s'affiche dans le champ
                    value={email}
                    // Quand l'utilisateur tape, on met a jour la boite "email" avec ce qu'il a tape
                    onChange={(e) => setEmail(e.target.value)}
                    // required = obligatoire — le formulaire ne peut pas etre soumis si ce champ est vide
                    required
                    // Style du champ — fond sombre, bordure, coins arrondis, texte beige, la bordure devient rouge quand on clique dessus
                    className="w-full bg-dark-input border border-navy-lighter rounded-xl px-4 py-3 text-beige placeholder-beige/40 font-rajdhani text-sm focus:outline-none focus:border-val-red"
                />

                {/* Champ mot de passe — pareil que l'email mais les caracteres sont caches avec des points */}
                <input
                    // Le type "password" cache ce que l'utilisateur tape — comme ecrire derriere un rideau
                    type="password"
                    // Texte indicatif quand le champ est vide
                    placeholder="Mot de passe"
                    // La valeur est liee a notre boite "password"
                    value={password}
                    // Quand l'utilisateur tape, on met a jour la boite "password"
                    onChange={(e) => setPassword(e.target.value)}
                    // Obligatoire — il faut un mot de passe pour se connecter
                    required
                    // Meme style que le champ email — coherence visuelle
                    className="w-full bg-dark-input border border-navy-lighter rounded-xl px-4 py-3 text-beige placeholder-beige/40 font-rajdhani text-sm focus:outline-none focus:border-val-red"
                />

                {/* Bouton de connexion — c'est le gros bouton rouge sur lequel on clique pour se connecter */}
                <button
                    // type="submit" signifie que ce bouton envoie le formulaire — il declenche handleSubmit
                    type="submit"
                    // Si loading est true, le bouton est desactive — on ne peut pas cliquer deux fois pendant le chargement
                    disabled={loading}
                    // Style du bouton — fond rouge, texte blanc, gras, coins arrondis, devient plus sombre au survol, semi-transparent si desactive
                    className="w-full bg-val-red text-white font-rajdhani font-bold py-3 rounded-xl hover:bg-val-red-dark transition-colors disabled:opacity-50"
                >
                    {/* Si on charge, on affiche "Connexion...", sinon "Se connecter" — pour que l'utilisateur sache qu'il se passe quelque chose */}
                    {loading ? "Connexion..." : "Se connecter"}
                </button>

                {/* Lien vers la page d'inscription — pour ceux qui n'ont pas encore de compte */}
                <p className="font-rajdhani text-beige/50 text-sm text-center">
                    {/* Texte "Pas de compte ?" suivi d'un espace insecable pour eviter que le lien colle au texte */}
                    Pas de compte ?{" "}
                    {/* Lien cliquable vers /register — en rouge, souligne au survol */}
                    <Link to="/register" className="text-val-red hover:underline">S'inscrire</Link>
                </p>
            {/* Fin du formulaire */}
            </form>
        {/* Fin du conteneur interieur */}
        </div>
        {/* Fin du conteneur principal */}
        </div>
    );
}

// On exporte LoginPage pour que d'autres fichiers puissent l'utiliser — comme mettre la page dans un catalogue
export default LoginPage;
