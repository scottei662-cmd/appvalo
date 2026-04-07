// On importe useState (pour stocker des valeurs qui changent) et useRef (pour acceder directement a un element HTML)
import { useState, useRef } from "react";
// On importe la fonction uploadImage qui envoie une image au serveur (Cloudinary) et retourne son URL
import { uploadImage } from "../../lib/api";

// On definit le type des props du composant — les parametres qu'on lui passe, comme des instructions
type ImageUploadProps = {
    // Le texte de l'etiquette — ce qui s'affiche au dessus du composant (ex: "Image", "Icone")
    label: string;
    // L'URL actuelle de l'image — vide si aucune image n'est selectionnee
    value: string;
    // La fonction a appeler quand l'image change — on passe la nouvelle URL au parent
    onChange: (url: string) => void;
    // Si l'image est obligatoire ou non — par defaut non obligatoire
    required?: boolean;
};

/**
 * @description Composant d'upload d'image vers Cloudinary avec preview et fallback URL manuelle
 * @param props - label, value (URL), onChange callback, required
 * @returns JSX du composant upload
 */
// On declare le composant ImageUpload — il permet soit d'uploader un fichier, soit de coller une URL
function ImageUpload({ label, value, onChange, required = false }: ImageUploadProps) {
    // Boite pour savoir si un upload est en cours — le fichier est en train d'etre envoye au serveur
    const [uploading, setUploading] = useState(false);
    // Boite pour stocker les messages d'erreur d'upload
    const [error, setError] = useState("");
    // Boite pour savoir quel mode est actif — "upload" (choisir un fichier) ou "url" (coller un lien)
    const [mode, setMode] = useState<"upload" | "url">(value ? "url" : "upload");
    // Reference vers l'input file cache — on l'utilise pour ouvrir la fenetre de selection de fichier
    const inputRef = useRef<HTMLInputElement>(null);

    // Fonction qui s'execute quand l'utilisateur choisit un fichier — elle envoie le fichier au serveur
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        // On recupere le premier fichier selectionne — l'utilisateur peut en choisir un seul
        const file = e.target.files?.[0];
        // Si aucun fichier n'a ete selectionne, on ne fait rien
        if (!file) return;

        // On active le mode upload — le sablier tourne
        setUploading(true);
        // On efface les anciennes erreurs
        setError("");
        // On essaie d'envoyer le fichier
        try {
            // On envoie le fichier au serveur via l'API uploadImage — le serveur le stocke sur Cloudinary
            const result = await uploadImage(file);
            // On passe l'URL retournee par le serveur au composant parent — l'image est maintenant en ligne
            onChange(result.url);
        // Si l'upload echoue — probleme reseau, fichier trop gros, etc.
        } catch (err: unknown) {
            // On affiche le message d'erreur
            setError(err instanceof Error ? err.message : "Erreur upload");
        // Quoi qu'il arrive
        } finally {
            // On desactive le mode upload — le sablier s'arrete
            setUploading(false);
        }
    };

    // On retourne le JSX — l'interface du composant d'upload
    return (
        // Conteneur principal du composant
        <div>
            {/* En-tete — etiquette a gauche et bouton pour basculer le mode a droite */}
            <div className="flex items-center justify-between mb-1">
                {/* Etiquette du composant — affiche le label passe en prop */}
                <label className="font-rajdhani text-[13px] text-beige/60">{label}</label>
                {/* Bouton pour changer de mode — basculer entre upload fichier et URL manuelle */}
                <button
                    // type="button" pour ne pas soumettre le formulaire parent
                    type="button"
                    // Quand on clique, on bascule entre les deux modes — comme un interrupteur
                    onClick={() => setMode(mode === "upload" ? "url" : "upload")}
                    // Style — petit texte rouge, souligne au survol
                    className="font-rajdhani text-[11px] text-val-red hover:underline"
                >
                    {/* Le texte change selon le mode actuel — on propose toujours l'autre option */}
                    {mode === "upload" ? "Coller une URL" : "Uploader un fichier"}
                </button>
            </div>

            {/* Affichage conditionnel — soit le mode upload, soit le mode URL */}
            {mode === "upload" ? (
                // Mode upload — on choisit un fichier depuis son ordinateur
                <div>
                    {/* Input file cache — on ne le montre pas directement car il est moche par defaut */}
                    <input
                        // Reference pour pouvoir cliquer dessus depuis le bouton personnalise
                        ref={inputRef}
                        // Type "file" — ouvre la fenetre de selection de fichier
                        type="file"
                        // On n'accepte que les images — pas de PDF, pas de videos
                        accept="image/*"
                        // Quand un fichier est choisi, on appelle handleFileSelect
                        onChange={handleFileSelect}
                        // Cache — on utilise un bouton personnalise a la place
                        className="hidden"
                    />
                    {/* Bouton personnalise pour ouvrir la fenetre de selection — plus joli que l'input natif */}
                    <button
                        // Ne soumet pas le formulaire
                        type="button"
                        // Quand on clique, on simule un clic sur l'input file cache — ca ouvre la fenetre
                        onClick={() => inputRef.current?.click()}
                        // Desactive pendant l'upload — on ne peut pas choisir un autre fichier pendant l'envoi
                        disabled={uploading}
                        // Style — fond sombre, bordure en pointilles, texte pale, bordure rouge au survol
                        className="w-full h-[38px] bg-dark-input border border-[#2a343e] border-dashed rounded-lg px-3 font-rajdhani text-[14px] text-beige/50 hover:border-val-red hover:text-beige transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {/* Si un upload est en cours, on affiche un spinner et "Upload en cours..." */}
                        {uploading ? (
                            // Fragment contenant le spinner et le texte
                            <>
                                {/* Spinner — petit cercle qui tourne pour montrer le chargement */}
                                <div className="w-4 h-4 border-2 border-val-red border-t-transparent rounded-full animate-spin" />
                                {/* Texte de chargement */}
                                Upload en cours...
                            </>
                        ) : (
                            // Si pas d'upload en cours, on affiche l'icone fleche et "Choisir une image"
                            <>
                                {/* Icone SVG fleche vers le haut — symbolise l'upload */}
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                    {/* Le chemin de la fleche — une ligne verticale avec une pointe vers le haut */}
                                    <path d="M8 12V4M4 7l4-4 4 4" />
                                </svg>
                                {/* Texte du bouton */}
                                Choisir une image
                            </>
                        )}
                    </button>
                {/* Fin du mode upload */}
                </div>
            ) : (
                // Mode URL — on colle directement un lien vers une image
                <input
                    // Type texte — on peut coller une URL
                    type="text"
                    // Valeur liee a la prop value
                    value={value}
                    // Quand on tape ou colle, on met a jour la valeur via onChange
                    onChange={(e) => onChange(e.target.value)}
                    // Obligatoire seulement si required est true ET qu'il n'y a pas deja une valeur
                    required={required && !value}
                    // Texte indicatif — montre le format attendu
                    placeholder="https://..."
                    // Style du champ — fond sombre, bordure, coins arrondis
                    className="w-full h-[38px] bg-dark-input border border-[#2a343e] rounded-lg px-3 font-rajdhani text-[14px] text-white focus:outline-none focus:border-val-red"
                />
            )}

            {/* Message d'erreur — s'affiche seulement si il y a eu une erreur d'upload */}
            {error && (
                // Petit texte rouge sous le champ
                <p className="mt-1 font-rajdhani text-[12px] text-val-red">{error}</p>
            )}

            {/* Apercu de l'image — s'affiche seulement si une URL existe (une image a ete uploadee ou collee) */}
            {value && (
                // Conteneur de l'apercu — petit rectangle avec l'image et un bouton supprimer
                <div className="mt-2 relative w-[80px] h-[50px] rounded-md overflow-hidden bg-dark-input border border-[#2a343e]">
                    {/* Image de l'apercu — remplit le rectangle */}
                    <img src={value} alt="preview" className="w-full h-full object-cover" />
                    {/* Bouton pour supprimer l'image — petit cercle avec une croix en haut a droite */}
                    <button
                        // Ne soumet pas le formulaire
                        type="button"
                        // Quand on clique, on vide l'URL — l'image est supprimee du formulaire
                        onClick={() => onChange("")}
                        // Style — petit cercle noir semi-transparent en haut a droite de l'apercu
                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-navy/80 rounded-full flex items-center justify-center"
                    >
                        {/* Icone X (croix) en SVG — deux lignes blanches qui se croisent */}
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
                            {/* Premiere ligne de la croix — de haut-gauche a bas-droite */}
                            <line x1="1" y1="1" x2="7" y2="7" />
                            {/* Deuxieme ligne de la croix — de haut-droite a bas-gauche */}
                            <line x1="7" y1="1" x2="1" y2="7" />
                        </svg>
                    </button>
                {/* Fin de l'apercu */}
                </div>
            )}
        {/* Fin du conteneur principal */}
        </div>
    );
}

// On exporte ImageUpload pour pouvoir l'utiliser dans les formulaires admin (agents, maps, armes)
export default ImageUpload;
