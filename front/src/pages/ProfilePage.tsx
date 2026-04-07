// On importe useEffect (pour lancer des actions au chargement, comme allumer la lumière en entrant) et useState (pour se souvenir de choses, comme un carnet de notes)
import { useEffect, useState } from "react";
// On importe useNavigate (pour changer de page, comme zapper) et Link (pour créer des liens cliquables, comme des portes vers d'autres pièces)
import { useNavigate, Link } from "react-router-dom";
// On importe les fonctions qui parlent au serveur : récupérer son profil, ses builds, ses matchs, son compte Riot, les agents, mettre à jour son profil, et uploader une image — comme des messagers spécialisés
import { getMe, getBuilds, getMatches, getStoredMatches, getAccount, getAgents, updateMe, uploadImage } from "../lib/api";
// On importe useSession (pour savoir qui est connecté) et signOut (pour se déconnecter) — comme vérifier son badge et pouvoir le rendre
import { useSession, signOut } from "../lib/auth-client";

// On définit la forme d'un profil utilisateur — comme un formulaire d'inscription avec les infos personnelles
type UserProfile = {
    // L'identifiant unique de l'utilisateur — comme un numéro de carte d'identité
    id: string;
    // Le nom affiché de l'utilisateur — comme le prénom sur un badge
    name: string;
    // Le pseudo Riot Games (peut être vide) — comme un nom de joueur optionnel
    gameName: string | null;
    // Le tag Riot Games (peut être vide) — comme le numéro après le # dans le pseudo
    tagLine: string | null;
    // L'adresse email — comme l'adresse postale numérique
    email: string;
    // L'URL de la photo de profil (peut être vide) — comme une photo d'identité optionnelle
    image: string | null;
};

/**
 * @description Page profil avec edition du nom, image, Riot ID et stats
 * @returns JSX de la page profil
 */
// On déclare la fonction principale de la page profil — comme ouvrir sa fiche personnelle
function ProfilePage() {
    // On prépare la fonction pour changer de page — comme avoir une télécommande
    const navigate = useNavigate();
    // On récupère la session de l'utilisateur connecté — comme regarder qui est assis devant l'écran
    const { data: session } = useSession();
    // Tiroir pour le profil de l'utilisateur, vide au début — comme un cadre photo vide
    const [profile, setProfile] = useState<UserProfile | null>(null);
    // Tiroir pour le nombre de builds créés — comme un compteur à zéro
    const [buildCount, setBuildCount] = useState(0);
    // Tiroir pour la liste des matchs récents — comme un tableau de scores vide
    const [matches, setMatches] = useState<any[]>([]);
    // Tiroir pour l'agent favori (nom, portrait, heures jouées) — comme une carte "joueur star" vide
    const [favAgent, setFavAgent] = useState<{ name: string; portrait: string; hours: string } | null>(null);
    // Tiroir pour le dictionnaire des agents (nom -> portrait) — comme un annuaire photos vide
    const [agentsMap, setAgentsMap] = useState<Record<string, string>>({});

    // --- Variables pour le mode édition du profil ---
    // Interrupteur pour savoir si on est en mode édition — comme un stylo levé ou posé
    const [editing, setEditing] = useState(false);
    // Tiroir pour le nom en cours de modification — comme un brouillon du nouveau nom
    const [editName, setEditName] = useState("");
    // Tiroir pour le Riot ID tapé par l'utilisateur — comme un champ de formulaire pour le pseudo de jeu
    const [riotInput, setRiotInput] = useState("");
    // Tiroir pour le message d'erreur du Riot ID — comme un petit panneau d'avertissement
    const [riotError, setRiotError] = useState("");
    // Indicateur si le Riot ID a été vérifié avec succès — comme un tampon "vérifié" sur un document
    const [riotVerified, setRiotVerified] = useState(false);
    // Indicateur de sauvegarde en cours — comme un voyant "enregistrement"
    const [saving, setSaving] = useState(false);
    // Indicateur d'upload d'image en cours — comme un voyant "téléchargement de photo"
    const [uploadingImage, setUploadingImage] = useState(false);

    // Au chargement ou quand la session change, on récupère les infos du profil — comme ouvrir son dossier au bureau
    useEffect(() => {
        // Si l'utilisateur n'est pas connecté, on le renvoie à la page de connexion — comme refuser l'accès sans badge
        if (!session?.user) { navigate("/login"); return; }
        // On va chercher les infos du profil sur le serveur — comme demander son dossier au secrétariat
        getMe().then((user) => {
            // On range le profil reçu dans le tiroir — comme poser le dossier sur le bureau
            setProfile(user);
            // On pré-remplit le nom dans le champ d'édition — comme mettre l'ancien nom dans le brouillon
            setEditName(user.name);
            // Si le Riot ID est déjà enregistré, on le pré-remplit et on le marque comme vérifié
            if (user.gameName && user.tagLine) {
                // On met le pseudo#tag dans le champ — comme écrire le numéro déjà connu
                setRiotInput(`${user.gameName}#${user.tagLine}`);
                // On marque comme vérifié — comme tamponner "validé"
                setRiotVerified(true);
            }
        // Si ça échoue, on note l'erreur — comme consigner un problème
        }).catch(console.error);
        // On va chercher les builds de l'utilisateur pour compter combien il en a — comme compter ses créations
        getBuilds(undefined, session.user.id).then((b) => setBuildCount(b.length)).catch(console.error);
    // Ce code se relance si la session ou la navigation change
    }, [session, navigate]);

    // Quand le profil est chargé et qu'on a un Riot ID, on va chercher les stats de jeu — comme consulter ses résultats sportifs
    useEffect(() => {
        // Si pas de Riot ID complet, on ne fait rien — comme ne pas chercher de résultats sans numéro de joueur
        if (!profile?.gameName || !profile?.tagLine) return;

        // On charge la liste des agents depuis la base de données pour avoir leurs portraits — comme récupérer un album photo des personnages
        getAgents().then((agents: any[]) => {
            // On crée un dictionnaire : nom en minuscule -> URL du portrait — comme un annuaire
            const map: Record<string, string> = {};
            // Pour chaque agent, on associe son nom (en minuscule) à son portrait — comme écrire chaque entrée dans l'annuaire
            agents.forEach((a: any) => { map[a.name.toLowerCase()] = a.portrait; });
            // On range le dictionnaire dans le tiroir — comme poser l'annuaire sur l'étagère
            setAgentsMap(map);
        // Si ça échoue, on note l'erreur
        }).catch(console.error);

        // On va chercher les 6 derniers matchs ranked — comme consulter les 6 derniers scores au tableau
        getMatches(profile.gameName, profile.tagLine, 6)
            // On extrait les données des matchs et on les range — comme coller les résultats au mur
            .then((data: any) => setMatches(data.data || []))
            // Si ça échoue, on note l'erreur
            .catch(console.error);

        // On va chercher TOUS les matchs stockés pour calculer l'agent favori — comme éplucher tout l'historique sportif
        getStoredMatches(profile.gameName, profile.tagLine)
            .then(async (data: any) => {
                // On récupère la liste des matchs stockés, ou une liste vide — comme ouvrir le classeur des résultats
                const storedList = data.data || [];
                // On crée un compteur de parties par agent — comme un tableau de points par joueur
                const agentGames: Record<string, number> = {};
                // Variable pour retenir le nom de l'agent le plus joué — comme le champion actuel
                let topAgentName = "";

                // On parcourt chaque match pour compter les apparitions de chaque agent — comme compter les buts de chaque joueur
                for (const match of storedList) {
                    // On récupère le nom de l'agent utilisé dans ce match — comme lire quel personnage a été choisi
                    const agentName = match.stats?.character?.name;
                    // Si on a un nom d'agent — comme vérifier que la case n'est pas vide
                    if (agentName) {
                        // On incrémente le compteur de cet agent (ou on commence à 1) — comme ajouter un point au score
                        agentGames[agentName] = (agentGames[agentName] || 0) + 1;
                        // Si c'est le premier agent ou s'il a plus de parties que le champion actuel, il devient le nouveau champion
                        if (!topAgentName || agentGames[agentName] > agentGames[topAgentName]) {
                            // On met à jour le nom du champion — comme changer le nom en tête du classement
                            topAgentName = agentName;
                        }
                    }
                }

                // On récupère le nombre total de parties avec l'agent favori — comme le score final du champion
                const totalGames = topAgentName ? agentGames[topAgentName] : 0;
                // On estime les heures jouées : environ 35 minutes par match compétitif — comme calculer le temps passé à s'entraîner
                const estimatedHours = Math.round((totalGames * 35) / 60);

                // Si on a trouvé un agent favori — comme s'il y a bien un champion
                if (topAgentName) {
                    // On essaie de récupérer les infos de l'agent depuis la base — comme aller chercher sa photo officielle
                    try {
                        // On récupère tous les agents de la base de données
                        const agents = await getAgents();
                        // On cherche l'agent correspondant (en ignorant majuscules/minuscules) — comme chercher un nom dans une liste
                        const dbAgent = agents.find((a: any) => a.name.toLowerCase() === topAgentName.toLowerCase());
                        // On range les infos de l'agent favori dans le tiroir — comme créer sa carte de champion
                        setFavAgent({
                            // Le nom officiel de l'agent (ou le nom trouvé dans les matchs si pas en base)
                            name: dbAgent?.name || topAgentName,
                            // Le portrait officiel (ou vide si pas trouvé)
                            portrait: dbAgent?.portrait || "",
                            // Le nombre d'heures estimé sous forme de texte
                            hours: `${estimatedHours}h`,
                        });
                    // Si la recherche en base échoue, on utilise juste le nom trouvé dans les matchs
                    } catch {
                        // On crée la carte du champion avec les infos qu'on a — comme une carte faite main
                        setFavAgent({ name: topAgentName, portrait: "", hours: `${estimatedHours}h` });
                    }
                }
            })
            // Si tout échoue, on note l'erreur
            .catch(console.error);
    // Ce code se relance quand le profil change — comme re-consulter les stats si le joueur change
    }, [profile]);

    // Fonction pour se déconnecter — comme rendre son badge et quitter le bâtiment
    const handleSignOut = async () => { await signOut(); navigate("/login"); };

    // Fonction pour vérifier si le Riot ID saisi existe vraiment — comme vérifier si un numéro de téléphone est valide
    const handleVerifyRiot = async () => {
        // On efface l'ancien message d'erreur — comme nettoyer le tableau
        setRiotError("");
        // On découpe le texte au niveau du # pour séparer pseudo et tag — comme couper une feuille en deux
        const parts = riotInput.split("#");
        // Si le format n'est pas bon (pas exactement un # avec du texte de chaque côté), on affiche une erreur
        if (parts.length !== 2 || !parts[0] || !parts[1]) {
            // On affiche le format attendu — comme montrer un exemple
            setRiotError("Format: Pseudo#Tag");
            // On arrête là — comme refuser un formulaire mal rempli
            return;
        }
        // On essaie de vérifier le compte auprès de Riot — comme appeler pour confirmer un numéro
        try {
            // On appelle l'API avec le pseudo et le tag — comme envoyer une demande de vérification
            await getAccount(parts[0], parts[1]);
            // Si ça marche, on marque comme vérifié — comme tamponner "confirmé"
            setRiotVerified(true);
        // Si le compte n'existe pas — comme recevoir "numéro inconnu"
        } catch {
            // On affiche le message d'erreur — comme afficher "compte non trouvé"
            setRiotError("Compte Riot introuvable");
            // On enlève le statut vérifié — comme retirer le tampon "confirmé"
            setRiotVerified(false);
        }
    };

    // Fonction pour sauvegarder les modifications du profil — comme appuyer sur "Enregistrer" dans un formulaire
    const handleSave = async () => {
        // Si pas de profil chargé, on ne fait rien — comme ne pas sauvegarder un formulaire vide
        if (!profile) return;
        // On allume le voyant "sauvegarde en cours" — comme afficher un sablier
        setSaving(true);
        // On essaie de sauvegarder — comme tenter d'enregistrer le fichier
        try {
            // On re-découpe le Riot ID — comme relire le pseudo et le tag
            const parts = riotInput.split("#");
            // On prépare les données à envoyer avec le nouveau nom — comme remplir le formulaire de modification
            const data: Record<string, string> = { name: editName };
            // Si le Riot ID est vérifié et bien formaté, on l'ajoute aux données — comme ajouter le numéro validé au formulaire
            if (riotVerified && parts.length === 2) {
                // On ajoute le pseudo — la partie avant le #
                data.gameName = parts[0];
                // On ajoute le tag — la partie après le #
                data.tagLine = parts[1];
            }
            // On envoie les modifications au serveur et on récupère le profil mis à jour — comme poster le formulaire et recevoir la confirmation
            const updated = await updateMe(data);
            // On met à jour le profil affiché avec les nouvelles données — comme remplacer l'ancienne fiche par la nouvelle
            setProfile(updated);
            // On quitte le mode édition — comme poser le stylo
            setEditing(false);
        // Si ça échoue, on note l'erreur — comme constater que l'enregistrement a échoué
        } catch (err) { console.error(err); }
        // Dans tous les cas, on éteint le voyant "sauvegarde" — comme retirer le sablier
        finally { setSaving(false); }
    };

    // Fonction pour changer sa photo de profil — comme changer sa photo d'identité
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        // On récupère le fichier choisi par l'utilisateur — comme prendre la photo de la main du visiteur
        const file = e.target.files?.[0];
        // Si aucun fichier n'a été choisi, on ne fait rien — comme repartir les mains vides
        if (!file) return;
        // On allume le voyant "téléchargement en cours" — comme afficher "envoi de la photo..."
        setUploadingImage(true);
        // On essaie d'envoyer la photo — comme tenter de télécharger la photo
        try {
            // On envoie l'image au serveur et on récupère son URL — comme déposer la photo et recevoir son emplacement
            const result = await uploadImage(file);
            // On met à jour le profil avec la nouvelle URL de la photo — comme coller la nouvelle photo sur la fiche
            const updated = await updateMe({ image: result.url });
            // On met à jour le profil affiché — comme afficher la nouvelle fiche
            setProfile(updated);
        // Si ça échoue, on note l'erreur
        } catch (err) { console.error(err); }
        // Dans tous les cas, on éteint le voyant "téléchargement" — comme retirer le message "envoi en cours"
        finally { setUploadingImage(false); }
    };

    // Si le profil n'est pas encore chargé, on affiche un écran de chargement — comme un sablier en attendant
    if (!profile) {
        // On retourne un écran de chargement centré
        return (
            // Conteneur plein écran avec fond beige et contenu centré — comme une salle d'attente
            <div className="min-h-screen bg-beige flex items-center justify-center">
                {/* Petit cercle qui tourne — comme une roue de chargement */}
                <div className="w-8 h-8 border-2 border-val-red border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Si le profil est chargé, on affiche la vraie page — comme ouvrir le dossier complet
    return (
        // Conteneur principal de la page avec fond beige — comme le fond d'un tableau de bord
        <div className="min-h-screen bg-beige">
            {/* En-tête avec le titre "PROFIL" et le lien retour */}
            <div className="px-[41px] pt-[64px] pb-0">
                {/* Lien vers la page d'accueil avec flèche retour — comme un panneau de sortie vers l'accueil */}
                <Link to="/" className="flex items-center gap-2">
                    {/* Petite flèche triangulaire vers la gauche — comme un symbole de retour */}
                    <div className="w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-r-[13px] border-r-[#0f1923]" />
                    {/* Titre "PROFIL" en grand et italique — comme l'enseigne de la page */}
                    <h1 className="font-oswald text-[36px] font-medium italic uppercase tracking-[4px] text-[#0f1923]" style={{ lineHeight: "0.56" }}>
                        PROFIL
                    </h1>
                </Link>
            </div>

            {/* ===== Carte de l'utilisateur ===== */}
            <div className="mx-[22px] mt-[40px]">
                {/* Carte sombre avec l'avatar, le nom et le bouton éditer — comme un badge d'identification */}
                <div className="w-full bg-[#2a343e] rounded-[10px] p-5 flex items-center gap-4">
                    {/* Avatar cliquable pour changer la photo — comme un cadre photo qu'on peut remplacer */}
                    <label className="relative w-[62px] h-[62px] rounded-full overflow-hidden bg-[#1f2326] flex items-center justify-center cursor-pointer flex-shrink-0">
                        {/* Si l'utilisateur a une photo, on l'affiche — comme montrer sa photo d'identité */}
                        {profile.image ? (
                            // Image de profil qui remplit le cercle — comme une photo dans un cadre rond
                            <img src={profile.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                            // Sinon on affiche la première lettre du nom en majuscule — comme les initiales sur un badge
                            <span className="font-rajdhani text-white text-[24px] font-bold">
                                {/* On prend le premier caractère du nom et on le met en majuscule */}
                                {profile.name.charAt(0).toUpperCase()}
                            </span>
                        )}
                        {/* Si une image est en cours d'upload, on affiche un spinner par-dessus — comme un voile "patientez" */}
                        {uploadingImage && (
                            // Overlay sombre semi-transparent avec un cercle qui tourne — comme un rideau avec un moulin
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                {/* Petit cercle de chargement blanc — comme une mini roue qui tourne */}
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                        {/* Overlay au survol avec une icône d'édition — comme montrer un crayon quand on passe la souris */}
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center">
                            {/* Icône SVG de fichier/édition — comme un petit crayon */}
                            <svg className="w-5 h-5 text-white opacity-0 hover:opacity-100" viewBox="0 0 20 20" fill="currentColor">
                                {/* Forme du crayon en SVG — comme un dessin vectoriel */}
                                <path d="M4 5a2 2 0 012-2h4.586A2 2 0 0112 3.586L15.414 7A2 2 0 0116 8.414V15a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" />
                            </svg>
                        </div>
                        {/* Champ fichier caché — le vrai bouton d'upload invisible, activé quand on clique sur l'avatar */}
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>

                    {/* Infos textuelles : nom + Riot ID — comme les lignes d'un badge */}
                    <div className="flex-1 min-w-0">
                        {/* Nom de l'utilisateur en gros et gras — comme le titre principal du badge */}
                        <span className="font-rajdhani text-[24px] font-bold text-white tracking-[2px] block truncate">
                            {/* On affiche le nom du profil */}
                            {profile.name}
                        </span>
                        {/* Riot ID ou message "non lié" — comme le sous-titre du badge */}
                        <span className="font-rajdhani text-[14px] font-medium text-white/60 tracking-[2px] block">
                            {/* Si le Riot ID existe, on affiche pseudo#tag, sinon un message par défaut */}
                            {profile.gameName ? `${profile.gameName}#${profile.tagLine}` : "Riot ID non lié"}
                        </span>
                    </div>

                    {/* Bouton crayon pour basculer le mode édition — comme un bouton "modifier" */}
                    <button
                        // Au clic, on active/désactive le mode édition — comme lever ou poser un stylo
                        onClick={() => setEditing(!editing)}
                        // Style : petit cercle sombre avec un crayon blanc — comme un bouton discret
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1f2326] hover:bg-navy-lighter transition-colors flex-shrink-0"
                    >
                        {/* Icône de crayon en SVG — comme un petit dessin de stylo */}
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
                            {/* Forme du crayon — comme un trait en forme de stylo */}
                            <path d="M8.5 2.5l3 3M1.5 9.5l6-6 3 3-6 6H1.5v-3z" />
                        </svg>
                    </button>
                </div>

                {/* ===== Panneau d'édition (visible seulement en mode édition) ===== */}
                {/* Si on est en mode édition, on affiche le formulaire de modification — comme déplier un formulaire caché */}
                {editing && (
                    // Conteneur du formulaire d'édition, collé sous la carte — comme un tiroir qui s'ouvre sous le badge
                    <div className="bg-[#f8f8f8] rounded-b-[10px] border border-t-0 border-[#2a343e] p-4 flex flex-col gap-3 -mt-1">
                        {/* Champ de modification du nom */}
                        <div>
                            {/* Étiquette "Nom" — comme le titre d'un champ de formulaire */}
                            <label className="font-rajdhani text-[13px] font-bold text-[#0f1923] mb-1 block">Nom</label>
                            {/* Champ de saisie pour le nom — comme une case à modifier */}
                            <input
                                // C'est un champ texte
                                type="text"
                                // La valeur affichée est celle du brouillon du nom
                                value={editName}
                                // Quand on tape, on met à jour le brouillon — comme écrire au crayon
                                onChange={(e) => setEditName(e.target.value)}
                                // Style du champ : fond blanc, bordure, coins arrondis — comme un joli champ de formulaire
                                className="w-full h-[36px] bg-white border border-[#2a343e] rounded-[6px] px-3 font-rajdhani text-[14px] text-[#0f1923] focus:outline-none focus:border-val-red"
                            />
                        </div>

                        {/* Champ de modification du Riot ID */}
                        <div>
                            {/* Étiquette "Riot ID" — comme le titre du champ */}
                            <label className="font-rajdhani text-[13px] font-bold text-[#0f1923] mb-1 block">Riot ID</label>
                            {/* Ligne avec le champ de saisie et le bouton vérifier — comme un champ avec un bouton à côté */}
                            <div className="flex gap-2">
                                {/* Champ pour taper le Riot ID — comme une case pour écrire pseudo#tag */}
                                <input
                                    // C'est un champ texte
                                    type="text"
                                    // La valeur affichée est celle du Riot ID en cours de saisie
                                    value={riotInput}
                                    // Quand on tape, on met à jour le champ et on remet la vérification à zéro — comme effacer et recommencer
                                    onChange={(e) => { setRiotInput(e.target.value); setRiotVerified(false); setRiotError(""); }}
                                    // Texte d'exemple grisé — comme un modèle
                                    placeholder="Pseudo#0000"
                                    // Style du champ — comme une case de formulaire élégante
                                    className="flex-1 h-[36px] bg-white border border-[#2a343e] rounded-[6px] px-3 font-rajdhani text-[14px] text-[#0f1923] focus:outline-none focus:border-val-red"
                                />
                                {/* Bouton pour vérifier le Riot ID — comme un bouton "confirmer" */}
                                <button
                                    // C'est un bouton, pas un lien
                                    type="button"
                                    // Au clic, on lance la vérification — comme appuyer sur "vérifier"
                                    onClick={handleVerifyRiot}
                                    // Style : vert si vérifié, sombre sinon — comme un voyant vert/gris
                                    className={`px-3 h-[36px] rounded-[6px] font-rajdhani text-[12px] font-bold transition-colors ${
                                        riotVerified
                                            ? "bg-green-600 text-white"
                                            : "bg-[#2a343e] text-white hover:bg-navy-lighter"
                                    }`}
                                >
                                    {/* Texte du bouton : coche + "Vérifié" ou "Vérifier" — comme un indicateur d'état */}
                                    {riotVerified ? "✓ Vérifié" : "Vérifier"}
                                </button>
                            </div>
                            {/* Si erreur de vérification, on affiche le message — comme un petit avertissement rouge */}
                            {riotError && <p className="font-rajdhani text-[12px] text-val-red mt-1">{riotError}</p>}
                        </div>

                        {/* Bouton sauvegarder — comme un gros bouton "Enregistrer" */}
                        <button
                            // Au clic, on sauvegarde les modifications
                            onClick={handleSave}
                            // Désactivé pendant la sauvegarde — comme griser le bouton pour éviter le double-clic
                            disabled={saving}
                            // Style : fond rouge, texte blanc — comme un bouton d'action principal
                            className="w-full h-[32px] bg-val-red rounded-[6px] font-rajdhani text-[14px] font-bold text-white hover:bg-val-red-dark transition-colors disabled:opacity-50"
                        >
                            {/* Texte du bouton : "..." pendant la sauvegarde, "Sauvegarder" sinon */}
                            {saving ? "..." : "Sauvegarder"}
                        </button>
                    </div>
                )}
            </div>

            {/* ===== Section des statistiques ===== */}
            <div className="mx-[22px] mt-[30px]">
                {/* Titre "Stats" — comme l'en-tête du tableau des scores */}
                <span className="font-rajdhani text-[20px] font-medium text-[#2a343e] mb-3 block">
                    Stats
                </span>

                {/* Conteneur des deux cartes de stats côte à côte — comme deux panneaux d'affichage */}
                <div className="flex gap-3">
                    {/* Carte "Builds Créés" — lien cliquable vers la page des builds, fond sombre */}
                    <Link to="/builds" className="flex-1 bg-[#2a343e] rounded-[10px] p-4 flex flex-col gap-1 text-left">
                        {/* Titre de la stat — comme l'étiquette au-dessus du compteur */}
                        <span className="font-rajdhani text-[14px] font-medium text-white/60 tracking-[1px]">
                            Builds Crées
                        </span>
                        {/* Nombre de builds — le gros chiffre du compteur */}
                        <span className="font-rajdhani text-[22px] font-bold text-white">
                            {/* On affiche le nombre de builds créés */}
                            {buildCount}
                        </span>
                        {/* Sous-texte "Total" — comme une légende sous le compteur */}
                        <span className="font-rajdhani text-[12px] font-medium text-white/40">
                            Total
                        </span>
                    </Link>

                    {/* Carte "Agent favori" — fond clair avec le nom, heures et portrait */}
                    <div className="flex-1 bg-[#f8f8f8] rounded-[10px] p-4 flex items-center gap-3">
                        {/* Infos textuelles de l'agent favori — comme la légende d'une carte */}
                        <div className="flex flex-col gap-1 flex-1">
                            {/* Titre "Agent fav" — comme l'étiquette */}
                            <span className="font-rajdhani text-[14px] font-medium text-[#2a343e]/60 tracking-[1px]">
                                Agent fav
                            </span>
                            {/* Nom de l'agent favori, ou un tiret si pas encore calculé — comme le nom du champion */}
                            <span className="font-rajdhani text-[20px] font-bold text-[#2a343e]">
                                {favAgent?.name || "—"}
                            </span>
                            {/* Heures jouées avec cet agent, ou un tiret — comme le temps de jeu affiché */}
                            <span className="font-rajdhani text-[12px] font-medium text-[#2a343e]/40">
                                {favAgent?.hours || "—"}
                            </span>
                        </div>
                        {/* Si on a un portrait de l'agent favori, on l'affiche — comme la photo du champion */}
                        {favAgent?.portrait && (
                            // Petit cadre carré arrondi avec le portrait de l'agent — comme une vignette
                            <div className="w-[60px] h-[60px] rounded-lg overflow-hidden bg-[#2a343e] flex-shrink-0">
                                {/* Image portrait de l'agent favori — comme sa photo officielle */}
                                <img src={favAgent.portrait} alt={favAgent.name} className="w-full h-full object-cover object-top" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ===== Section des derniers matchs ===== */}
            <div className="mx-[22px] mt-[25px] pb-8">
                {/* Titre "Dernier Match" — comme le panneau d'affichage des résultats récents */}
                <h3 className="font-rajdhani text-[20px] font-bold text-[#2a343e] tracking-[2px] mb-[12px]">
                    Dernier Match
                </h3>

                {/* Liste des cartes de matchs — comme une pile de fiches de résultats */}
                <div className="flex flex-col gap-3">
                    {/* Si aucun match, on affiche un message — comme un panneau "rien à afficher" */}
                    {matches.length === 0 && (
                        // Message informatif centré — comme une note sur un tableau vide
                        <p className="font-rajdhani text-[#2a343e]/50 text-sm text-center py-4">
                            {/* Si Riot ID lié, on dit "pas de match récent", sinon on invite à lier le compte */}
                            {profile.gameName ? "Aucun match récent" : "Liez votre Riot ID pour voir vos matchs"}
                        </p>
                    )}

                    {/* On parcourt chaque match et on crée une carte — comme afficher chaque résultat */}
                    {matches.map((match: any, i: number) => {
                        // On récupère la liste de tous les joueurs du match — comme la feuille de présence
                        const allPlayers = Array.isArray(match.players) ? match.players : match.players?.all_players || [];
                        // On cherche le joueur actuel dans la liste (par pseudo + tag, ou juste pseudo) — comme se retrouver dans une photo de classe
                        const player = allPlayers.find(
                            // On compare pseudo et tag en minuscule pour ignorer les majuscules — comme chercher sans se soucier des accents
                            (p: any) => p.name?.toLowerCase() === profile.gameName?.toLowerCase() && p.tag?.toLowerCase() === profile.tagLine?.toLowerCase()
                        ) || allPlayers.find(
                            // Plan B : on cherche juste par pseudo si le tag ne correspond pas — comme chercher par prénom seulement
                            (p: any) => p.name?.toLowerCase() === profile.gameName?.toLowerCase()
                        );

                        // On récupère le nom de la map — comme lire le nom du terrain
                        const mapName = typeof match.metadata?.map === "string" ? match.metadata.map : match.metadata?.map?.name || "—";
                        // On récupère le nom de l'agent joué — comme lire quel personnage a été utilisé
                        const agentName = player?.agent?.name || "";
                        // On récupère l'image de l'agent depuis notre annuaire, ou depuis les données du match — comme chercher la photo dans l'album
                        const agentImg = agentsMap[agentName.toLowerCase()] || player?.agent?.small || player?.assets?.agent?.small || "";
                        // On récupère l'équipe du joueur (en minuscule) — comme savoir si on était rouge ou bleu
                        const playerTeam = (player?.team_id || player?.team || "").toLowerCase();

                        // On initialise les scores — comme un tableau de scores à zéro
                        let myScore = 0;
                        let enemyScore = 0;
                        // Si les équipes sont dans un tableau — format d'API version 1
                        if (Array.isArray(match.teams)) {
                            // On trouve notre équipe et l'équipe adverse — comme séparer les deux camps
                            const myTeam = match.teams.find((t: any) => (t.team_id || "").toLowerCase() === playerTeam);
                            // L'équipe adverse est celle qui n'est pas la nôtre
                            const otherTeam = match.teams.find((t: any) => (t.team_id || "").toLowerCase() !== playerTeam);
                            // On récupère les rounds gagnés par notre équipe — comme compter nos points
                            myScore = myTeam?.rounds?.won ?? myTeam?.rounds_won ?? 0;
                            // On récupère les rounds gagnés par l'adversaire — comme compter les points de l'autre
                            enemyScore = otherTeam?.rounds?.won ?? otherTeam?.rounds_won ?? 0;
                        // Si les équipes sont en format rouge/bleu — format d'API version 2
                        } else if (match.teams?.red && match.teams?.blue) {
                            // Si on est dans l'équipe rouge
                            if (playerTeam === "red") {
                                // Notre score est celui des rouges
                                myScore = match.teams.red.rounds_won || 0;
                                // Le score adverse est celui des bleus
                                enemyScore = match.teams.blue.rounds_won || 0;
                            // Si on est dans l'équipe bleue
                            } else {
                                // Notre score est celui des bleus
                                myScore = match.teams.blue.rounds_won || 0;
                                // Le score adverse est celui des rouges
                                enemyScore = match.teams.red.rounds_won || 0;
                            }
                        }
                        // On détermine si c'est une victoire — comme vérifier si on a plus de points que l'adversaire
                        const isWin = myScore > enemyScore;

                        // On récupère les statistiques du joueur — comme lire sa feuille de stats
                        const kills = player?.stats?.kills || 0;
                        // Nombre de morts
                        const deaths = player?.stats?.deaths || 0;
                        // Nombre d'assistances
                        const assists = player?.stats?.assists || 0;

                        // On retourne la carte du match — comme dessiner une fiche de résultat
                        return (
                            // Carte du match avec fond clair et coins arrondis — comme une fiche de résultat
                            <div key={i} className="w-full bg-[#f8f8f8] rounded-[10px] px-4 py-3 flex items-center gap-3">
                                {/* Avatar de l'agent joué — comme la photo du personnage utilisé */}
                                <div className="w-[40px] h-[40px] rounded-[8px] bg-[#2a343e] overflow-hidden flex-shrink-0">
                                    {/* Si on a une image de l'agent, on l'affiche — comme montrer le portrait */}
                                    {agentImg && <img src={agentImg} alt="" className="w-full h-full object-cover object-top" />}
                                </div>

                                {/* Infos à gauche : victoire/défaite + nom de la map */}
                                <div className="flex-1 min-w-0">
                                    {/* Texte "Victoire" en vert ou "Défaite" en rouge — comme un résultat coloré */}
                                    <span className={`font-rajdhani text-[18px] font-bold tracking-[1px] block ${isWin ? "text-green-600" : "text-val-red"}`}>
                                        {/* On affiche "Victoire" ou "Défaite" selon le résultat */}
                                        {isWin ? "Victoire" : "Défaite"}
                                    </span>
                                    {/* Nom de la map en gris — comme le lieu du match */}
                                    <span className="font-rajdhani text-[13px] font-medium text-[#2a343e]/60 block">
                                        {mapName}
                                    </span>
                                </div>

                                {/* Infos à droite : score et K/D/A */}
                                <div className="flex flex-col items-end flex-shrink-0">
                                    {/* Score du match (mon score - score adverse) — comme le tableau d'affichage */}
                                    <span className="font-rajdhani text-[14px] font-bold text-[#2a343e]">
                                        {myScore} - {enemyScore}
                                    </span>
                                    {/* Statistiques kills / deaths / assists — comme la feuille de performance */}
                                    <span className="font-rajdhani text-[12px] font-medium text-[#2a343e]/60">
                                        {kills} / {deaths} / {assists}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bouton de déconnexion en bas de page — comme un bouton "quitter" */}
            <div className="mx-[22px] pt-4 pb-8">
                {/* Bouton "Déconnexion" avec bordure grise et texte rouge — comme un bouton de sortie */}
                <button onClick={handleSignOut} className="w-full h-[36px] bg-[#f8f8f8] rounded-[8px] border border-[#2a343e] flex items-center justify-center">
                    {/* Texte "Déconnexion" en rouge — comme le mot "Sortie" sur un panneau */}
                    <span className="font-rajdhani text-[14px] font-bold text-val-red">
                        Déconnexion
                    </span>
                </button>
            </div>
        </div>
    );
}

// On exporte la page pour que le reste de l'application puisse l'utiliser — comme mettre le dossier à disposition dans le bureau
export default ProfilePage;
