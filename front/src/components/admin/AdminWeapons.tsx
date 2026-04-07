// On importe useEffect (pour executer du code au chargement) et useState (pour stocker des valeurs qui changent)
import { useEffect, useState } from "react";
// On importe les fonctions API pour gerer les armes — lire, creer, modifier, supprimer
import { getWeapons, createWeapon, updateWeapon, deleteWeapon } from "../../lib/api";
// On importe le composant ImageUpload — pour uploader ou coller des images d'armes
import ImageUpload from "./ImageUpload";

// On definit le type Weapon — c'est la forme d'une arme du jeu, comme sa fiche technique
type Weapon = {
    // L'identifiant unique de l'arme — comme un numero de serie
    id: string;
    // Le nom de l'arme — ex: "Vandal", "Phantom", "Operator"
    name: string;
    // L'URL de l'image de l'arme — la photo de l'arme
    image: string;
    // La categorie de l'arme — ex: "Rifle", "Sniper", "SMG"
    category: string;
};

// Les 7 categories d'armes possibles — comme les rayons d'un magasin d'armes
const categories = ["Sidearm", "SMG", "Shotgun", "Rifle", "Sniper", "Heavy", "Melee"];
// Un formulaire vide — comme un formulaire vierge pour une nouvelle arme, Rifle par defaut
const emptyForm = { name: "", image: "", category: "Rifle" };

/**
 * @description Composant CRUD pour la gestion des armes — permet de creer, lire, modifier et supprimer des armes
 * @returns JSX du panel admin weapons
 */
// On declare le composant AdminWeapons — c'est la section du panel admin dediee aux armes
function AdminWeapons() {
    // Boite pour stocker la liste de toutes les armes — au debut c'est vide
    const [weapons, setWeapons] = useState<Weapon[]>([]);
    // Boite pour stocker les valeurs du formulaire — ce que l'admin remplit
    const [form, setForm] = useState(emptyForm);
    // Boite pour savoir si on modifie une arme existante — null = on en cree une nouvelle
    const [editId, setEditId] = useState<string | null>(null);
    // Boite pour savoir si le formulaire est visible ou cache
    const [showForm, setShowForm] = useState(false);
    // Boite pour savoir si on est en train de sauvegarder — le sablier tourne
    const [loading, setLoading] = useState(false);
    // Boite pour stocker les messages d'erreur
    const [error, setError] = useState("");

    // Fonction qui charge la liste des armes depuis le serveur
    const loadWeapons = () => {
        // On appelle l'API getWeapons, et quand on a la reponse, on met a jour la liste
        getWeapons().then(setWeapons).catch(console.error);
    };

    // useEffect avec [] — s'execute une seule fois au chargement pour charger les armes
    useEffect(() => { loadWeapons(); }, []);

    // Fonction qui s'execute quand on soumet le formulaire — creer ou modifier une arme
    const handleSubmit = async (e: React.FormEvent) => {
        // On empeche le rechargement de la page
        e.preventDefault();
        // On active le mode chargement
        setLoading(true);
        // On efface les anciennes erreurs
        setError("");
        // On essaie de sauvegarder
        try {
            // Si editId existe, on modifie l'arme existante
            if (editId) {
                await updateWeapon(editId, form);
            // Sinon, on cree une nouvelle arme
            } else {
                await createWeapon(form);
            }
            // On remet le formulaire a zero
            setForm(emptyForm);
            // On sort du mode edition
            setEditId(null);
            // On cache le formulaire
            setShowForm(false);
            // On recharge la liste des armes
            loadWeapons();
        // Si une erreur se produit
        } catch (err: unknown) {
            // On affiche le message d'erreur
            setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde");
        // Quoi qu'il arrive
        } finally {
            // On desactive le mode chargement
            setLoading(false);
        }
    };

    // Fonction pour pre-remplir le formulaire avec les donnees d'une arme existante
    const handleEdit = (weapon: Weapon) => {
        // On copie le nom, l'image et la categorie de l'arme dans le formulaire
        setForm({ name: weapon.name, image: weapon.image, category: weapon.category });
        // On note l'ID de l'arme qu'on modifie
        setEditId(weapon.id);
        // On affiche le formulaire
        setShowForm(true);
    };

    // Fonction pour supprimer une arme
    const handleDelete = async (id: string) => {
        // On demande confirmation — popup "Es-tu sur ?"
        if (!confirm("Supprimer cette arme ?")) return;
        // On essaie de supprimer
        try {
            // On appelle l'API pour supprimer l'arme
            await deleteWeapon(id);
            // On recharge la liste
            loadWeapons();
        // Si ca echoue
        } catch (err: unknown) {
            // On affiche l'erreur
            setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
        }
    };

    // Fonction pour annuler et tout remettre a zero
    const handleCancel = () => {
        // On vide le formulaire
        setForm(emptyForm);
        // On sort du mode edition
        setEditId(null);
        // On cache le formulaire
        setShowForm(false);
        // On efface les erreurs
        setError("");
    };

    // On retourne le JSX — l'interface du gestionnaire d'armes
    return (
        // Conteneur principal
        <div>
            {/* Barre d'actions — nombre d'armes + bouton ajouter */}
            <div className="flex items-center justify-between mb-4">
                {/* Compteur d'armes — affiche "X armes" ou "X arme" */}
                <span className="font-rajdhani text-[18px] text-beige/70">
                    {/* On ajoute un "s" au pluriel */}
                    {weapons.length} arme{weapons.length > 1 ? "s" : ""}
                </span>
                {/* Le bouton ajouter n'apparait que si le formulaire est cache */}
                {!showForm && (
                    // Bouton rouge pour ajouter une nouvelle arme
                    <button
                        // Quand on clique, on ouvre un formulaire vierge
                        onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
                        // Style — fond rouge, texte blanc, gras
                        className="px-4 py-2 bg-val-red rounded-lg font-rajdhani text-[14px] font-bold text-white hover:bg-val-red-dark transition-colors"
                    >
                        {/* Texte du bouton */}
                        + Ajouter une arme
                    </button>
                )}
            </div>

            {/* Boite d'erreur — s'affiche seulement si il y a une erreur */}
            {error && (
                // Message d'erreur rouge
                <div className="mb-4 px-4 py-2 bg-val-red/20 border border-val-red rounded-lg text-val-red font-rajdhani text-[14px]">
                    {/* Le texte de l'erreur */}
                    {error}
                </div>
            )}

            {/* Le formulaire — visible seulement si showForm est true */}
            {showForm && (
                // Formulaire avec handleSubmit au clic
                <form onSubmit={handleSubmit} className="bg-navy-card rounded-xl p-5 mb-6 border border-[#2a343e]">
                    {/* Titre du formulaire — change selon creation ou modification */}
                    <h3 className="font-oswald text-[18px] font-bold text-white mb-4">
                        {/* Si on modifie, "Modifier l'arme" ; si on cree, "Nouvelle arme" */}
                        {editId ? "Modifier l'arme" : "Nouvelle arme"}
                    </h3>
                    {/* Grille de champs — 2 colonnes */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Colonne gauche — champ nom */}
                        <div>
                            {/* Etiquette "Nom" */}
                            <label className="block font-rajdhani text-[13px] text-beige/60 mb-1">Nom</label>
                            {/* Champ de saisie pour le nom de l'arme */}
                            <input
                                // Type texte
                                type="text"
                                // Valeur liee au formulaire
                                value={form.name}
                                // Mise a jour du formulaire quand on tape
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                // Obligatoire
                                required
                                // Style du champ
                                className="w-full h-[38px] bg-dark-input border border-[#2a343e] rounded-lg px-3 font-rajdhani text-[14px] text-white focus:outline-none focus:border-val-red"
                            />
                        </div>
                        {/* Colonne droite — selecteur de categorie */}
                        <div>
                            {/* Etiquette "Categorie" */}
                            <label className="block font-rajdhani text-[13px] text-beige/60 mb-1">Categorie</label>
                            {/* Menu deroulant pour choisir la categorie de l'arme */}
                            <select
                                // Valeur actuelle de la categorie
                                value={form.category}
                                // Mise a jour quand on change la selection
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                // Style du selecteur
                                className="w-full h-[38px] bg-dark-input border border-[#2a343e] rounded-lg px-3 font-rajdhani text-[14px] text-white focus:outline-none focus:border-val-red"
                            >
                                {/* Une option pour chaque categorie possible */}
                                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        {/* Upload d'image sur toute la largeur — obligatoire */}
                        <div className="col-span-2">
                            {/* Composant d'upload pour l'image de l'arme */}
                            <ImageUpload label="Image" value={form.image} onChange={(v) => setForm({ ...form, image: v })} required />
                        </div>
                    </div>
                    {/* Boutons d'action — Sauvegarder et Annuler */}
                    <div className="flex gap-3 mt-5">
                        {/* Bouton de soumission */}
                        <button
                            // Ce bouton soumet le formulaire
                            type="submit"
                            // Desactive pendant le chargement
                            disabled={loading}
                            // Style — fond rouge, semi-transparent si desactive
                            className="px-6 py-2 bg-val-red rounded-lg font-rajdhani text-[14px] font-bold text-white hover:bg-val-red-dark transition-colors disabled:opacity-50"
                        >
                            {/* "..." si chargement, "Modifier" si edition, "Creer" si creation */}
                            {loading ? "..." : editId ? "Modifier" : "Créer"}
                        </button>
                        {/* Bouton Annuler */}
                        <button
                            // Ne soumet pas le formulaire
                            type="button"
                            // Appelle handleCancel pour tout reinitialiser
                            onClick={handleCancel}
                            // Style — transparent avec bordure
                            className="px-6 py-2 bg-transparent border border-[#2a343e] rounded-lg font-rajdhani text-[14px] text-beige/60 hover:text-white transition-colors"
                        >
                            {/* Texte du bouton */}
                            Annuler
                        </button>
                    </div>
                {/* Fin du formulaire */}
                </form>
            )}

            {/* Liste des armes — chaque arme est affichee dans une ligne horizontale */}
            <div className="flex flex-col gap-2">
                {/* On parcourt chaque arme pour creer sa ligne */}
                {weapons.map((weapon) => (
                    // Ligne d'une arme — carte horizontale avec image, nom, categorie et boutons
                    <div key={weapon.id} className="flex items-center gap-4 bg-navy-card rounded-lg p-3 border border-[#2a343e]">
                        {/* Miniature de l'arme — rectangle avec l'image centree */}
                        <div className="w-[64px] h-[40px] rounded-md overflow-hidden bg-dark-input flex-shrink-0 flex items-center justify-center p-1">
                            {/* Image de l'arme — s'adapte au rectangle sans etre deformee */}
                            <img src={weapon.image} alt={weapon.name} className="max-w-full max-h-full object-contain" />
                        </div>
                        {/* Infos de l'arme — nom et categorie */}
                        <div className="flex-1 min-w-0">
                            {/* Nom de l'arme — en gras, tronque si trop long */}
                            <span className="font-rajdhani text-[16px] font-bold text-white block truncate">{weapon.name}</span>
                            {/* Categorie — texte plus petit et plus pale */}
                            <span className="font-rajdhani text-[13px] text-beige/50">{weapon.category}</span>
                        </div>
                        {/* Boutons d'action */}
                        <div className="flex gap-2 flex-shrink-0">
                            {/* Bouton Modifier — ouvre le formulaire pre-rempli */}
                            <button
                                onClick={() => handleEdit(weapon)}
                                className="px-3 py-1.5 bg-[#2a343e] rounded-md font-rajdhani text-[12px] font-bold text-beige hover:bg-navy-lighter transition-colors"
                            >
                                Modifier
                            </button>
                            {/* Bouton Supprimer — supprime l'arme apres confirmation */}
                            <button
                                onClick={() => handleDelete(weapon.id)}
                                className="px-3 py-1.5 bg-val-red/20 rounded-md font-rajdhani text-[12px] font-bold text-val-red hover:bg-val-red/30 transition-colors"
                            >
                                Supprimer
                            </button>
                        </div>
                    {/* Fin de la ligne arme */}
                    </div>
                ))}
            {/* Fin de la liste des armes */}
            </div>
        {/* Fin du conteneur principal */}
        </div>
    );
}

// On exporte AdminWeapons pour pouvoir l'utiliser dans la page Admin
export default AdminWeapons;
