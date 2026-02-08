export const normaliserTexte = texte => texte.trim().toLowerCase().replace(/\s+/g, ' ');

export const correspondanceEtudiant = (etudiant, requete) => {
  if (!requete) return true;
  const motsRequete = normaliserTexte(requete).split(' ');
  const nomComplet1 = normaliserTexte(`${etudiant.prenom} ${etudiant.nom}`);
  const nomComplet2 = normaliserTexte(`${etudiant.nom} ${etudiant.prenom}`);
  const filiere = normaliserTexte(etudiant.filiere || '');
  return motsRequete.every(mot => nomComplet1.includes(mot) || nomComplet2.includes(mot) || filiere.includes(mot));
};

export const correspondanceHistorique = (elementHistorique, requete) => {
  if (!requete) return true;
  const motsRequete = normaliserTexte(requete).split(' ');
  const nomComplet = normaliserTexte(`${elementHistorique.prenom} ${elementHistorique.nom}`);
  const action = normaliserTexte(elementHistorique.action || '');
  return motsRequete.every(mot => nomComplet.includes(mot) || action.includes(mot));
};

export const filtrerEtudiants = (etudiants, requete) => etudiants.filter(etudiant => correspondanceEtudiant(etudiant, requete));

export const filtrerHistorique = (historique, requete) => historique.filter(element => correspondanceHistorique(element, requete));
