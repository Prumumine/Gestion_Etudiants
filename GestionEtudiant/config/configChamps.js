export const configChamps = {
  nom: { libelle: 'Nom', type: 'texte', requis: true },
  prenom: { libelle: 'Prénom', type: 'texte', requis: true },
  age: { libelle: 'Âge', type: 'numerique', requis: true, validation: (v) => {
    const age = Number(v);
    return age >= 18 && age <= 120;
  }, erreurMessage: 'Âge invalide (18-120)' },
  telephone: { libelle: 'Téléphone', type: 'numerique', requis: true, validation: (v) => /^\d+$/.test(v), erreurMessage: 'Téléphone invalide (chiffres seulement)' },
  niveau: { libelle: 'Niveau', type: 'texte', requis: true },
  filiere: { libelle: 'Filière', type: 'texte', requis: true },
  sexe: { libelle: 'Sexe', type: 'selection', requis: true, options: [
    { libelle: 'Sélectionner', valeur: '' },
    { libelle: 'Homme', valeur: 'M' },
    { libelle: 'Femme', valeur: 'F' }
  ]},
  inscription: { libelle: 'Inscription', type: 'selection', requis: true, options: [
    { libelle: 'A jour', valeur: 'A jour' },
    { libelle: 'Non à jour', valeur: 'Non à jour' }
  ]},
  nationalite: { libelle: 'Nationalité', type: 'selection', requis: true, options: [
    { libelle: 'Sélectionner', valeur: '' },
    { libelle: 'Burkinabè', valeur: 'Burkinabè' },
    { libelle: 'Autre', valeur: 'Autre' }
  ]},
  nationalitePersonnalisee: { libelle: 'Entrer votre nationalité', type: 'texte', requis: false }
};

export const champsEnLigne = [
  ['nom', 'prenom'],
  ['age', 'telephone'],
  ['filiere', 'niveau'],
  ['sexe', 'inscription'],
  ['nationalite']
];