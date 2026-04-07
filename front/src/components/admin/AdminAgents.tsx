// On importe useEffect (pour executer du code au chargement) et useState (pour stocker des valeurs qui changent)
import { useEffect, useState } from "react";
// On importe les fonctions API pour gerer les agents — lire, lire un seul, creer, modifier, supprimer — comme les 5 actions d'un gestionnaire
import { getAgents, getAgent, createAgent, updateAgent, deleteAgent } from "../../lib/api";
// On importe le composant ImageUpload — c'est le mini-formulaire pour envoyer ou coller des images
import ImageUpload from "./ImageUpload";

// On definit le type Ability — c'est la forme d'une competence d'agent, comme une fiche technique pour un pouvoir
type Ability = {
    // L'identifiant unique de l'ability — optionnel car les nouvelles abilities n'en ont pas encore
    id?: string;
    // Le nom de la competence — ex: "Smoke Screen"
    name: string;
    // L'URL de l'icone de la competence — l'image qui represente le pouvoir
    icon: string;
    // L'URL d'une image de preview — optionnelle, pour montrer un apercu du pouvoir
    preview?: string;
    // Le nombre de charges — combien de fois on peut utiliser ce pouvoir dans un round
    charges: number;
    // La touche du clavier associee — quelle touche appuyer pour activer le pouvoir (A, X, C, E)
    keyboardKey: string;
    // La description du pouvoir — ce qu'il fait en detail
    description: string;
};

// On definit le type Agent — c'est la forme d'un personnage du jeu, comme sa carte d'identite
type Agent = {
    // L'identifiant unique de l'agent — comme un numero de passeport
    id: string;
    // Le nom de l'agent — ex: "Jett", "Phoenix"
    name: string;
    // Une courte description de l'agent
    description: string;
    // La biographie complete de l'agent — son histoire
    biography: string;
    // Le pays ou la region d'origine de l'agent
    origin: string;
    // Le role de l'agent — Controller, Duelist, Initiator ou Sentinel
    role: string;
    // L'URL de l'image portrait de l'agent — sa photo
    portrait: string;
    // L'URL du portrait en pied — optionnel, image en taille complete
    fullPortrait?: string;
    // L'URL de l'image de fond — optionnel, l'arriere-plan decore
    background?: string;
    // La liste des competences de l'agent — optionnel, ses 4 pouvoirs
    abilities?: Ability[];
};

// Les 4 roles possibles pour un agent — comme les 4 postes dans une equipe de sport
const roles = ["Controller", "Duelist", "Initiator", "Sentinel"];
// Les 4 touches du clavier pour les abilities — chaque pouvoir est lie a une touche
const keyOptions = ["A", "X", "C", "E"];

// Un modele d'ability vide — comme un formulaire vierge a remplir pour un nouveau pouvoir
const emptyAbility: Ability = {
    // Pas de nom au debut
    name: "",
    // Pas d'icone au debut
    icon: "",
    // 1 charge par defaut — on peut utiliser le pouvoir 1 fois
    charges: 1,
    // Touche Q par defaut — sera changee automatiquement si Q est deja pris
    keyboardKey: "Q",
    // Pas de description au debut
    description: "",
};

// Un modele de formulaire agent vide — comme une fiche vierge pour un nouvel agent
const emptyForm = {
    // Pas de nom
    name: "",
    // Pas de description
    description: "",
    // Pas de biographie
    biography: "",
    // Pas d'origine
    origin: "",
    // Role par defaut : Duelist — le type d'agent le plus courant
    role: "Duelist",
    // Pas de portrait
    portrait: "",
    // Pas de fond
    background: "",
};

/**
 * @description Composant CRUD pour la gestion des agents avec abilities — permet de creer, lire, modifier et supprimer des agents
 * @returns JSX du panel admin agents
 */
// On declare le composant AdminAgents — c'est la section du panel admin dediee aux agents
function AdminAgents() {
    // Boite pour stocker la liste de tous les agents — au debut c'est un tableau vide
    const [agents, setAgents] = useState<Agent[]>([]);
    // Boite pour stocker les valeurs du formulaire — ce que l'admin est en train de remplir
    const [form, setForm] = useState(emptyForm);
    // Boite pour stocker les abilities de l'agent en cours d'edition — la liste de ses pouvoirs
    const [abilities, setAbilities] = useState<Ability[]>([]);
    // Boite pour savoir si on modifie un agent existant — si c'est null, on cree un nouvel agent
    const [editId, setEditId] = useState<string | null>(null);
    // Boite pour savoir si le formulaire est visible ou cache — comme ouvrir/fermer un tiroir
    const [showForm, setShowForm] = useState(false);
    // Boite pour savoir si on est en train de sauvegarder — le sablier tourne
    const [loading, setLoading] = useState(false);
    // Boite pour stocker les messages d'erreur
    const [error, setError] = useState("");

    // Fonction qui charge la liste des agents depuis le serveur — comme aller chercher le catalogue
    const loadAgents = () => {
        // On appelle l'API getAgents, et quand on a la reponse, on met a jour la liste des agents
        getAgents().then(setAgents).catch(console.error);
    };

    // useEffect avec un tableau vide [] — ce code s'execute une seule fois au chargement de la page
    useEffect(() => { loadAgents(); }, []);

    // Fonction qui s'execute quand on soumet le formulaire — pour creer ou modifier un agent
    const handleSubmit = async (e: React.FormEvent) => {
        // On empeche le rechargement de la page — le formulaire ne doit pas recharger
        e.preventDefault();
        // On active le mode chargement
        setLoading(true);
        // On efface les anciennes erreurs
        setError("");
        // On essaie de sauvegarder
        try {
            // On prepare les donnees a envoyer au serveur — on combine le formulaire avec les abilities
            const data = {
                // On copie toutes les valeurs du formulaire (nom, description, etc.)
                ...form,
                // fullPortrait prend la meme valeur que portrait, ou undefined si vide
                fullPortrait: form.portrait || undefined,
                // background prend la valeur du formulaire, ou undefined si vide
                background: form.background || undefined,
                // On transforme les abilities en format propre pour l'API — on ne garde que les champs necessaires
                abilities: abilities.map((ab) => ({
                    // Le nom de l'ability
                    name: ab.name,
                    // L'icone de l'ability
                    icon: ab.icon,
                    // Le nombre de charges, converti en nombre au cas ou ce serait une chaine
                    charges: Number(ab.charges),
                    // La touche du clavier
                    keyboardKey: ab.keyboardKey,
                    // La description
                    description: ab.description,
                })),
            };
            // Si editId existe, on modifie un agent existant — on change sa fiche
            if (editId) {
                await updateAgent(editId, data);
            // Sinon, on cree un nouvel agent — on ajoute une nouvelle fiche au catalogue
            } else {
                await createAgent(data);
            }
            // On remet le formulaire a zero — on efface tout ce qu'on a ecrit
            setForm(emptyForm);
            // On vide la liste des abilities
            setAbilities([]);
            // On remet editId a null — on n'est plus en mode edition
            setEditId(null);
            // On cache le formulaire — on referme le tiroir
            setShowForm(false);
            // On recharge la liste des agents pour voir les changements
            loadAgents();
        // Si une erreur se produit pendant la sauvegarde
        } catch (err: unknown) {
            // On affiche le message d'erreur — soit le message de l'erreur, soit un message par defaut
            setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde");
        // Quoi qu'il arrive, on fait le menage
        } finally {
            // On desactive le mode chargement
            setLoading(false);
        }
    };

    // Fonction pour pre-remplir le formulaire avec les donnees d'un agent existant — pour le modifier
    const handleEdit = async (agent: Agent) => {
        // On remplit le formulaire avec les infos de l'agent — comme copier sa fiche dans le formulaire
        setForm({
            name: agent.name,
            description: agent.description,
            biography: agent.biography,
            origin: agent.origin,
            role: agent.role,
            portrait: agent.portrait,
            background: agent.background || "",
        });
        // On charge les abilities completes de l'agent depuis le serveur
        try {
            // On demande au serveur toutes les infos de cet agent, y compris ses abilities
            const full = await getAgent(agent.id);
            // On met a jour la liste des abilities avec celles de l'agent
            setAbilities(full.abilities || []);
        // Si ca echoue, on met une liste vide
        } catch {
            setAbilities([]);
        }
        // On note l'ID de l'agent qu'on est en train de modifier
        setEditId(agent.id);
        // On affiche le formulaire
        setShowForm(true);
    };

    // Fonction pour supprimer un agent — comme dechirer sa fiche du catalogue
    const handleDelete = async (id: string) => {
        // On demande confirmation — un popup "Es-tu sur ?" pour eviter les erreurs
        if (!confirm("Supprimer cet agent ?")) return;
        // On essaie de supprimer
        try {
            // On appelle l'API pour supprimer l'agent avec cet ID
            await deleteAgent(id);
            // On recharge la liste pour que l'agent disparaisse
            loadAgents();
        // Si ca echoue
        } catch (err: unknown) {
            // On affiche l'erreur
            setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
        }
    };

    // Fonction pour annuler la creation ou modification — on remet tout a zero
    const handleCancel = () => {
        // On vide le formulaire
        setForm(emptyForm);
        // On vide les abilities
        setAbilities([]);
        // On sort du mode edition
        setEditId(null);
        // On cache le formulaire
        setShowForm(false);
        // On efface les erreurs
        setError("");
    };

    // Fonction pour ajouter une nouvelle ability — comme ajouter un nouveau pouvoir a l'agent
    const addAbility = () => {
        // On regarde quelles touches sont deja utilisees par les autres abilities
        const usedKeys = abilities.map((a) => a.keyboardKey);
        // On trouve la prochaine touche disponible — si A est pris, on prend X, etc.
        const nextKey = keyOptions.find((k) => !usedKeys.includes(k)) || "Q";
        // On ajoute une nouvelle ability vide avec la touche trouvee a la fin de la liste
        setAbilities([...abilities, { ...emptyAbility, keyboardKey: nextKey }]);
    };

    // Fonction pour modifier un champ d'une ability specifique — comme changer une info sur la fiche d'un pouvoir
    const updateAbility = (index: number, field: keyof Ability, value: string | number) => {
        // On parcourt toutes les abilities — si c'est celle a l'index donne, on la modifie, sinon on la laisse telle quelle
        setAbilities(abilities.map((ab, i) => i === index ? { ...ab, [field]: value } : ab));
    };

    // Fonction pour supprimer une ability — comme retirer un pouvoir a l'agent
    const removeAbility = (index: number) => {
        // On garde toutes les abilities sauf celle a l'index donne
        setAbilities(abilities.filter((_, i) => i !== index));
    };

    // On retourne le JSX — l'interface du gestionnaire d'agents
    return (
        // Conteneur principal du composant
        <div>
            {/* Barre d'actions — affiche le nombre d'agents et le bouton pour en ajouter */}
            <div className="flex items-center justify-between mb-4">
                {/* Compteur d'agents — affiche "X agents" ou "X agent" selon le nombre */}
                <span className="font-rajdhani text-[18px] text-beige/70">
                    {/* On ajoute un "s" si il y a plus d'un agent — accord au pluriel */}
                    {agents.length} agent{agents.length > 1 ? "s" : ""}
                </span>
                {/* Le bouton "Ajouter" n'apparait que si le formulaire est cache — pour eviter d'ouvrir deux formulaires */}
                {!showForm && (
                    // Bouton pour ajouter un nouvel agent — rouge, avec un "+"
                    <button
                        // Quand on clique, on ouvre le formulaire, on reset tout pour un nouvel agent
                        onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); setAbilities([]); }}
                        // Style du bouton — fond rouge, texte blanc, gras, coins arrondis
                        className="px-4 py-2 bg-val-red rounded-lg font-rajdhani text-[14px] font-bold text-white hover:bg-val-red-dark transition-colors"
                    >
                        {/* Texte du bouton */}
                        + Ajouter un agent
                    </button>
                )}
            </div>

            {/* Si il y a une erreur, on affiche une boite rouge avec le message */}
            {error && (
                // Boite d'erreur — fond rouge transparent, bordure rouge, texte rouge
                <div className="mb-4 px-4 py-2 bg-val-red/20 border border-val-red rounded-lg text-val-red font-rajdhani text-[14px]">
                    {/* Le message d'erreur */}
                    {error}
                </div>
            )}

            {/* Le formulaire n'apparait que si showForm est true — comme un panneau qui glisse */}
            {showForm && (
                // Formulaire — quand on le soumet, handleSubmit s'execute
                <form onSubmit={handleSubmit} className="bg-navy-card rounded-xl p-5 mb-6 border border-[#2a343e]">
                    {/* Titre du formulaire — change selon si on cree ou modifie */}
                    <h3 className="font-oswald text-[18px] font-bold text-white mb-4">
                        {/* Si editId existe, on modifie ; sinon, on cree */}
                        {editId ? "Modifier l'agent" : "Nouvel agent"}
                    </h3>

                    {/* Grille de champs — 2 colonnes cote a cote */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Champ "Nom" — utilise le composant InputField reutilisable, obligatoire */}
                        <InputField label="Nom" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                        {/* Champ "Origine" — le pays ou la region de l'agent, obligatoire */}
                        <InputField label="Origine" value={form.origin} onChange={(v) => setForm({ ...form, origin: v })} required />

                        {/* Le selecteur de role prend toute la largeur (2 colonnes) */}
                        <div className="col-span-2">
                            {/* Etiquette "Role" au dessus du selecteur */}
                            <label className="block font-rajdhani text-[13px] text-beige/60 mb-1">Role</label>
                            {/* Menu deroulant pour choisir le role — comme choisir une categorie dans une liste */}
                            <select
                                // La valeur selectionnee est liee au formulaire
                                value={form.role}
                                // Quand on change la selection, on met a jour le formulaire
                                onChange={(e) => setForm({ ...form, role: e.target.value })}
                                // Style du selecteur — fond sombre, bordure, coins arrondis
                                className="w-full h-[38px] bg-dark-input border border-[#2a343e] rounded-lg px-3 font-rajdhani text-[14px] text-white focus:outline-none focus:border-val-red"
                            >
                                {/* On cree une option pour chaque role possible */}
                                {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>

                        {/* Champ description sur toute la largeur */}
                        <div className="col-span-2">
                            {/* InputField pour la description de l'agent, obligatoire */}
                            <InputField label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} required />
                        </div>
                        {/* Zone de texte biographie sur toute la largeur */}
                        <div className="col-span-2">
                            {/* Etiquette "Biographie" */}
                            <label className="block font-rajdhani text-[13px] text-beige/60 mb-1">Biographie</label>
                            {/* Zone de texte multi-lignes pour ecrire la biographie — plus grand qu'un input classique */}
                            <textarea
                                // Valeur liee au formulaire
                                value={form.biography}
                                // Mise a jour du formulaire a chaque frappe
                                onChange={(e) => setForm({ ...form, biography: e.target.value })}
                                // Obligatoire
                                required
                                // 3 lignes de hauteur par defaut
                                rows={3}
                                // Style — fond sombre, pas de redimensionnement, bordure rouge au focus
                                className="w-full bg-dark-input border border-[#2a343e] rounded-lg px-3 py-2 font-rajdhani text-[14px] text-white resize-none focus:outline-none focus:border-val-red"
                            />
                        </div>

                        {/* Composant d'upload pour l'image portrait de l'agent — obligatoire */}
                        <ImageUpload label="Image de l'agent" value={form.portrait} onChange={(v) => setForm({ ...form, portrait: v })} required />
                        {/* Composant d'upload pour l'image de fond — optionnel */}
                        <ImageUpload label="Background" value={form.background} onChange={(v) => setForm({ ...form, background: v })} />
                    </div>

                    {/* Section des abilities — separee par une ligne horizontale */}
                    <div className="mt-6 border-t border-[#2a343e] pt-4">
                        {/* En-tete de la section abilities — titre + bouton ajouter */}
                        <div className="flex items-center justify-between mb-3">
                            {/* Titre affichant le nombre d'abilities actuelles */}
                            <h4 className="font-oswald text-[16px] font-bold text-white">
                                Abilities ({abilities.length})
                            </h4>
                            {/* Le bouton "Ajouter" n'apparait que si on a moins de 4 abilities — un agent a max 4 pouvoirs */}
                            {abilities.length < 4 && (
                                // Bouton pour ajouter une nouvelle ability
                                <button
                                    // type="button" pour ne pas soumettre le formulaire
                                    type="button"
                                    // Quand on clique, on ajoute une ability vide
                                    onClick={addAbility}
                                    // Style — petit bouton rouge
                                    className="px-3 py-1 bg-val-red rounded-md font-rajdhani text-[12px] font-bold text-white hover:bg-val-red-dark transition-colors"
                                >
                                    {/* Texte du bouton */}
                                    + Ajouter
                                </button>
                            )}
                        </div>

                        {/* Liste des abilities — empilees verticalement avec un espace entre chaque */}
                        <div className="flex flex-col gap-4">
                            {/* On parcourt chaque ability pour afficher son mini-formulaire */}
                            {abilities.map((ab, i) => (
                                // Carte d'une ability — fond sombre, bordure, position relative pour le bouton supprimer
                                <div key={i} className="bg-dark-input rounded-lg p-4 border border-[#2a343e] relative">
                                    {/* Bouton pour supprimer cette ability — petit cercle rouge en haut a droite */}
                                    <button
                                        // type="button" pour ne pas soumettre le formulaire
                                        type="button"
                                        // Quand on clique, on supprime l'ability a cet index
                                        onClick={() => removeAbility(i)}
                                        // Style — petit cercle rouge positionne en haut a droite de la carte
                                        className="absolute top-2 right-2 w-6 h-6 bg-val-red/20 rounded-full flex items-center justify-center hover:bg-val-red/40 transition-colors"
                                    >
                                        {/* Icone X (croix) en SVG — deux lignes qui se croisent */}
                                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#ff4656" strokeWidth="2" strokeLinecap="round">
                                            {/* Premiere ligne de la croix — de haut-gauche a bas-droite */}
                                            <line x1="2" y1="2" x2="8" y2="8" />
                                            {/* Deuxieme ligne de la croix — de haut-droite a bas-gauche */}
                                            <line x1="8" y1="2" x2="2" y2="8" />
                                        </svg>
                                    </button>

                                    {/* Grille de champs pour cette ability — 2 colonnes */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Champ pour le nom de l'ability — obligatoire */}
                                        <InputField
                                            label="Nom de l'ability"
                                            value={ab.name}
                                            onChange={(v) => updateAbility(i, "name", v)}
                                            required
                                        />
                                        {/* Selecteur de touche du clavier */}
                                        <div>
                                            {/* Etiquette "Touche" */}
                                            <label className="block font-rajdhani text-[13px] text-beige/60 mb-1">Touche</label>
                                            {/* Menu deroulant pour choisir la touche (A, X, C, E) */}
                                            <select
                                                // Valeur actuelle de la touche
                                                value={ab.keyboardKey}
                                                // Mise a jour quand on change la selection
                                                onChange={(e) => updateAbility(i, "keyboardKey", e.target.value)}
                                                // Style du selecteur
                                                className="w-full h-[38px] bg-navy border border-[#2a343e] rounded-lg px-3 font-rajdhani text-[14px] text-white focus:outline-none focus:border-val-red"
                                            >
                                                {/* Une option pour chaque touche possible */}
                                                {keyOptions.map((k) => <option key={k} value={k}>{k}</option>)}
                                            </select>
                                        </div>

                                        {/* Champ pour le nombre de charges */}
                                        <div>
                                            {/* Etiquette "Charges" */}
                                            <label className="block font-rajdhani text-[13px] text-beige/60 mb-1">Charges</label>
                                            {/* Input numerique — min 0, max 10, pour definir combien de fois on peut utiliser l'ability */}
                                            <input
                                                // Type nombre — on ne peut entrer que des chiffres
                                                type="number"
                                                // Minimum 0 — pas de charges negatives
                                                min={0}
                                                // Maximum 10 — pas plus de 10 charges
                                                max={10}
                                                // Valeur actuelle des charges
                                                value={ab.charges}
                                                // Mise a jour — on convertit en nombre, ou 0 si la conversion echoue
                                                onChange={(e) => updateAbility(i, "charges", parseInt(e.target.value) || 0)}
                                                // Style de l'input
                                                className="w-full h-[38px] bg-navy border border-[#2a343e] rounded-lg px-3 font-rajdhani text-[14px] text-white focus:outline-none focus:border-val-red"
                                            />
                                        </div>

                                        {/* Upload d'image pour l'icone de l'ability — obligatoire */}
                                        <ImageUpload
                                            label="Icone"
                                            value={ab.icon}
                                            onChange={(v) => updateAbility(i, "icon", v)}
                                            required
                                        />

                                        {/* Zone de texte pour la description de l'ability — sur toute la largeur */}
                                        <div className="col-span-2">
                                            {/* Etiquette "Description" */}
                                            <label className="block font-rajdhani text-[13px] text-beige/60 mb-1">Description</label>
                                            {/* Zone de texte multi-lignes pour decrire ce que fait l'ability */}
                                            <textarea
                                                // Valeur liee a l'ability
                                                value={ab.description}
                                                // Mise a jour de la description
                                                onChange={(e) => updateAbility(i, "description", e.target.value)}
                                                // Obligatoire
                                                required
                                                // 2 lignes de hauteur
                                                rows={2}
                                                // Style — fond bleu marine, pas de redimensionnement
                                                className="w-full bg-navy border border-[#2a343e] rounded-lg px-3 py-2 font-rajdhani text-[14px] text-white resize-none focus:outline-none focus:border-val-red"
                                            />
                                        </div>
                                    </div>
                                {/* Fin de la carte ability */}
                                </div>
                            ))}
                        {/* Fin de la liste des abilities */}
                        </div>
                    {/* Fin de la section abilities */}
                    </div>

                    {/* Boutons d'action du formulaire — Sauvegarder et Annuler */}
                    <div className="flex gap-3 mt-5">
                        {/* Bouton de soumission — Creer ou Modifier selon le contexte */}
                        <button
                            // Ce bouton soumet le formulaire
                            type="submit"
                            // Desactive pendant le chargement
                            disabled={loading}
                            // Style — fond rouge, texte blanc, semi-transparent si desactive
                            className="px-6 py-2 bg-val-red rounded-lg font-rajdhani text-[14px] font-bold text-white hover:bg-val-red-dark transition-colors disabled:opacity-50"
                        >
                            {/* "..." pendant le chargement, "Modifier" si edition, "Creer" si creation */}
                            {loading ? "..." : editId ? "Modifier" : "Créer"}
                        </button>
                        {/* Bouton Annuler — remet tout a zero et ferme le formulaire */}
                        <button
                            // type="button" pour ne pas soumettre le formulaire
                            type="button"
                            // Quand on clique, on annule tout
                            onClick={handleCancel}
                            // Style — transparent avec bordure, texte gris qui devient blanc au survol
                            className="px-6 py-2 bg-transparent border border-[#2a343e] rounded-lg font-rajdhani text-[14px] text-beige/60 hover:text-white transition-colors"
                        >
                            {/* Texte du bouton */}
                            Annuler
                        </button>
                    </div>
                {/* Fin du formulaire */}
                </form>
            )}

            {/* Liste des agents — affichee sous le formulaire */}
            <div className="flex flex-col gap-2">
                {/* On parcourt chaque agent pour afficher sa ligne */}
                {agents.map((agent) => (
                    // Ligne d'un agent — carte horizontale avec image, infos et boutons
                    <div key={agent.id} className="flex items-center gap-4 bg-navy-card rounded-lg p-3 border border-[#2a343e]">
                        {/* Miniature de l'agent — petit carre avec l'image portrait */}
                        <div className="w-[48px] h-[48px] rounded-lg overflow-hidden bg-dark-input flex-shrink-0">
                            {/* Image portrait de l'agent — remplie dans le carre */}
                            <img src={agent.portrait} alt={agent.name} className="w-full h-full object-cover" />
                        </div>
                        {/* Infos de l'agent — nom et role/origine */}
                        <div className="flex-1 min-w-0">
                            {/* Nom de l'agent — en gras, tronque si trop long */}
                            <span className="font-rajdhani text-[16px] font-bold text-white block truncate">{agent.name}</span>
                            {/* Role et origine — texte plus petit et plus pale */}
                            <span className="font-rajdhani text-[13px] text-beige/50">{agent.role} — {agent.origin}</span>
                        </div>
                        {/* Boutons d'action — Modifier et Supprimer */}
                        <div className="flex gap-2 flex-shrink-0">
                            {/* Bouton Modifier — ouvre le formulaire pre-rempli avec les infos de cet agent */}
                            <button
                                onClick={() => handleEdit(agent)}
                                className="px-3 py-1.5 bg-[#2a343e] rounded-md font-rajdhani text-[12px] font-bold text-beige hover:bg-navy-lighter transition-colors"
                            >
                                Modifier
                            </button>
                            {/* Bouton Supprimer — supprime l'agent apres confirmation */}
                            <button
                                onClick={() => handleDelete(agent.id)}
                                className="px-3 py-1.5 bg-val-red/20 rounded-md font-rajdhani text-[12px] font-bold text-val-red hover:bg-val-red/30 transition-colors"
                            >
                                Supprimer
                            </button>
                        </div>
                    {/* Fin de la ligne agent */}
                    </div>
                ))}
            {/* Fin de la liste des agents */}
            </div>
        {/* Fin du conteneur principal */}
        </div>
    );
}

/**
 * @description Champ input reutilisable pour les formulaires admin — un composant simple qui evite de repeter le meme code
 */
// Composant InputField — un champ de texte generique avec une etiquette, utilise partout dans les formulaires
function InputField({ label, value, onChange, required = false }: {
    // Le texte de l'etiquette au dessus du champ
    label: string;
    // La valeur actuelle du champ
    value: string;
    // La fonction a appeler quand la valeur change
    onChange: (v: string) => void;
    // Si le champ est obligatoire ou non — par defaut non
    required?: boolean;
}) {
    // On retourne le JSX du champ
    return (
        // Conteneur du champ
        <div>
            {/* Etiquette du champ — texte petit et pale */}
            <label className="block font-rajdhani text-[13px] text-beige/60 mb-1">{label}</label>
            {/* Champ de saisie texte */}
            <input
                // Type texte — l'utilisateur peut ecrire ce qu'il veut
                type="text"
                // Valeur liee a la prop value
                value={value}
                // Quand l'utilisateur tape, on appelle onChange avec la nouvelle valeur
                onChange={(e) => onChange(e.target.value)}
                // Si required est true, le champ est obligatoire
                required={required}
                // Style — fond sombre, bordure, coins arrondis, texte blanc, bordure rouge au focus
                className="w-full h-[38px] bg-dark-input border border-[#2a343e] rounded-lg px-3 font-rajdhani text-[14px] text-white focus:outline-none focus:border-val-red"
            />
        </div>
    );
}

// On exporte AdminAgents pour pouvoir l'utiliser dans la page Admin
export default AdminAgents;
