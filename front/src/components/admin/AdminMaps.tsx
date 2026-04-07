// On importe useEffect (pour executer du code au chargement) et useState (pour stocker des valeurs qui changent)
import { useEffect, useState } from "react";
// On importe les fonctions API pour gerer les maps — lire, creer, modifier, supprimer
import { getMaps, createMap, updateMap, deleteMap } from "../../lib/api";
// On importe le composant ImageUpload — pour uploader ou coller des images de maps
import ImageUpload from "./ImageUpload";

// On definit le type MapItem — c'est la forme d'une carte du jeu, comme sa fiche d'identite
type MapItem = {
    // L'identifiant unique de la map — comme un code-barres
    id: string;
    // Le nom de la map — ex: "Bind", "Haven", "Ascent"
    name: string;
    // L'URL de l'image de la map — la photo de la carte
    image: string;
};

// Un formulaire vide — comme un formulaire vierge pour creer une nouvelle map
const emptyForm = { name: "", image: "" };

/**
 * @description Composant CRUD pour la gestion des maps — permet de creer, lire, modifier et supprimer des cartes
 * @returns JSX du panel admin maps
 */
// On declare le composant AdminMaps — c'est la section du panel admin dediee aux maps
function AdminMaps() {
    // Boite pour stocker la liste de toutes les maps — au debut c'est vide
    const [maps, setMaps] = useState<MapItem[]>([]);
    // Boite pour stocker les valeurs du formulaire — ce que l'admin tape
    const [form, setForm] = useState(emptyForm);
    // Boite pour savoir si on modifie une map existante — null = on cree une nouvelle
    const [editId, setEditId] = useState<string | null>(null);
    // Boite pour savoir si le formulaire est visible — true = ouvert, false = ferme
    const [showForm, setShowForm] = useState(false);
    // Boite pour savoir si on est en train de sauvegarder
    const [loading, setLoading] = useState(false);
    // Boite pour stocker les messages d'erreur
    const [error, setError] = useState("");

    // Fonction qui charge la liste des maps depuis le serveur — comme rafraichir la liste
    const loadMaps = () => {
        // On appelle l'API getMaps, et quand on a la reponse, on met a jour la liste
        getMaps().then(setMaps).catch(console.error);
    };

    // useEffect avec [] — s'execute une seule fois au chargement pour charger les maps
    useEffect(() => { loadMaps(); }, []);

    // Fonction qui s'execute quand on soumet le formulaire — creer ou modifier une map
    const handleSubmit = async (e: React.FormEvent) => {
        // On empeche le rechargement de la page
        e.preventDefault();
        // On active le mode chargement
        setLoading(true);
        // On efface les anciennes erreurs
        setError("");
        // On essaie de sauvegarder
        try {
            // Si editId existe, on modifie la map existante
            if (editId) {
                await updateMap(editId, form);
            // Sinon, on cree une nouvelle map
            } else {
                await createMap(form);
            }
            // On remet le formulaire a zero
            setForm(emptyForm);
            // On sort du mode edition
            setEditId(null);
            // On cache le formulaire
            setShowForm(false);
            // On recharge la liste des maps
            loadMaps();
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

    // Fonction pour pre-remplir le formulaire avec les donnees d'une map existante
    const handleEdit = (map: MapItem) => {
        // On copie le nom et l'image de la map dans le formulaire
        setForm({ name: map.name, image: map.image });
        // On note l'ID de la map qu'on modifie
        setEditId(map.id);
        // On affiche le formulaire
        setShowForm(true);
    };

    // Fonction pour supprimer une map
    const handleDelete = async (id: string) => {
        // On demande confirmation — popup "Es-tu sur ?"
        if (!confirm("Supprimer cette map ?")) return;
        // On essaie de supprimer
        try {
            // On appelle l'API pour supprimer la map
            await deleteMap(id);
            // On recharge la liste
            loadMaps();
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

    // On retourne le JSX — l'interface du gestionnaire de maps
    return (
        // Conteneur principal
        <div>
            {/* Barre d'actions — nombre de maps + bouton ajouter */}
            <div className="flex items-center justify-between mb-4">
                {/* Compteur de maps — affiche "X maps" ou "X map" */}
                <span className="font-rajdhani text-[18px] text-beige/70">
                    {/* On ajoute un "s" au pluriel */}
                    {maps.length} map{maps.length > 1 ? "s" : ""}
                </span>
                {/* Le bouton ajouter n'apparait que si le formulaire est cache */}
                {!showForm && (
                    // Bouton rouge pour ajouter une nouvelle map
                    <button
                        // Quand on clique, on ouvre un formulaire vierge
                        onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
                        // Style — fond rouge, texte blanc, gras
                        className="px-4 py-2 bg-val-red rounded-lg font-rajdhani text-[14px] font-bold text-white hover:bg-val-red-dark transition-colors"
                    >
                        {/* Texte du bouton */}
                        + Ajouter une map
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
                // Formulaire avec handleSubmit au clic sur le bouton de soumission
                <form onSubmit={handleSubmit} className="bg-navy-card rounded-xl p-5 mb-6 border border-[#2a343e]">
                    {/* Titre du formulaire — change selon creation ou modification */}
                    <h3 className="font-oswald text-[18px] font-bold text-white mb-4">
                        {/* Si on modifie, "Modifier la map" ; si on cree, "Nouvelle map" */}
                        {editId ? "Modifier la map" : "Nouvelle map"}
                    </h3>
                    {/* Grille de champs — 2 colonnes */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Colonne gauche — champ nom */}
                        <div>
                            {/* Etiquette "Nom" */}
                            <label className="block font-rajdhani text-[13px] text-beige/60 mb-1">Nom</label>
                            {/* Champ de saisie pour le nom de la map */}
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
                        {/* Colonne droite — upload d'image pour la map, obligatoire */}
                        <ImageUpload label="Image" value={form.image} onChange={(v) => setForm({ ...form, image: v })} required />
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

            {/* Liste des maps — chaque map est affichee dans une ligne horizontale */}
            <div className="flex flex-col gap-2">
                {/* On parcourt chaque map pour creer sa ligne */}
                {maps.map((map) => (
                    // Ligne d'une map — carte horizontale avec image, nom et boutons
                    <div key={map.id} className="flex items-center gap-4 bg-navy-card rounded-lg p-3 border border-[#2a343e]">
                        {/* Miniature de la map — rectangle avec l'image */}
                        <div className="w-[64px] h-[40px] rounded-md overflow-hidden bg-dark-input flex-shrink-0">
                            {/* Image de la map — remplit le rectangle */}
                            <img src={map.image} alt={map.name} className="w-full h-full object-cover" />
                        </div>
                        {/* Nom de la map */}
                        <div className="flex-1 min-w-0">
                            {/* Texte du nom — en gras, tronque si trop long */}
                            <span className="font-rajdhani text-[16px] font-bold text-white block truncate">{map.name}</span>
                        </div>
                        {/* Boutons d'action */}
                        <div className="flex gap-2 flex-shrink-0">
                            {/* Bouton Modifier — ouvre le formulaire pre-rempli */}
                            <button
                                onClick={() => handleEdit(map)}
                                className="px-3 py-1.5 bg-[#2a343e] rounded-md font-rajdhani text-[12px] font-bold text-beige hover:bg-navy-lighter transition-colors"
                            >
                                Modifier
                            </button>
                            {/* Bouton Supprimer — supprime la map apres confirmation */}
                            <button
                                onClick={() => handleDelete(map.id)}
                                className="px-3 py-1.5 bg-val-red/20 rounded-md font-rajdhani text-[12px] font-bold text-val-red hover:bg-val-red/30 transition-colors"
                            >
                                Supprimer
                            </button>
                        </div>
                    {/* Fin de la ligne map */}
                    </div>
                ))}
            {/* Fin de la liste des maps */}
            </div>
        {/* Fin du conteneur principal */}
        </div>
    );
}

// On exporte AdminMaps pour pouvoir l'utiliser dans la page Admin
export default AdminMaps;
