// On importe le mode "StrictMode" depuis React — c'est comme un surveillant qui vérifie que tout est bien fait dans notre appli
import { StrictMode } from 'react'
// On importe "createRoot" qui permet de créer la racine de notre appli React — c'est comme planter la graine d'un arbre
import { createRoot } from 'react-dom/client'
// On importe notre fichier de styles CSS — c'est la feuille qui dit comment tout doit être habillé (couleurs, tailles, etc.)
import './index.css'
// On importe le composant principal App — c'est le tronc de notre arbre, tout le reste pousse dessus
import App from './App.tsx'

// On crée la racine de l'appli en cherchant l'élément HTML avec l'id "root" dans la page — c'est la boîte dans laquelle on met tout
// Le "!" dit à TypeScript "je suis sûr que cet élément existe, fais-moi confiance"
// Puis on appelle .render() pour afficher notre appli dedans — c'est comme allumer la télé
createRoot(document.getElementById('root')!).render(
  // StrictMode entoure notre appli pour vérifier les erreurs pendant le développement — comme un prof qui relit ta copie deux fois
  <StrictMode>
    {/* On place le composant App ici — c'est toute notre application Valorant qui s'affiche */}
    <App />
  {/* On ferme le StrictMode — fin de la zone surveillée */}
  </StrictMode>,
// Fin de l'appel à render — notre appli est maintenant affichée à l'écran
)
