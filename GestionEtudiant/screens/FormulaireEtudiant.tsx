import React, { useState, useEffect, useContext } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Alert, Text } from 'react-native';
import { globalStyles } from '../styles/styles';
import { ChampFormulaire } from '../components/ChampFormulaire';
import { configChamps, champsEnLigne } from '../config/configChamps';
import api from '../services/api';
import Header from '../components/Header';
import { NotificationContext } from '../Navigation';

export default function FormulaireEtudiant({ etudiant, onSave, onCancel, navigation }) {
  const { refreshNotificationCount } = useContext(NotificationContext);
  const [etat, setEtat] = useState({
    donnees: { nom:'', prenom:'', age:'', telephone:'', niveau:'', filiere:'', sexe:'', inscription:'A jour', nationalite:'', nationalitePersonnalisee:'' },
    erreurs: {},
    focus: null
  });

  // Pré-remplissage si modification
  useEffect(() => {
    if (!etudiant) return;
    const valInscription = etudiant.inscription === 'A jour' ? 'A jour' : etudiant.inscription === 'Non à jour' ? 'Non à jour' : etudiant.inscription;
    setEtat(prev => ({
      ...prev,
      donnees: {
        nom: etudiant.nom,
        prenom: etudiant.prenom,
        age: etudiant.age.toString(),
        telephone: etudiant.telephone,
        niveau: etudiant.niveau,
        filiere: etudiant.filiere,
        sexe: etudiant.sexe,
        inscription: valInscription,
        nationalite: etudiant.nationalite === 'Burkinabè' ? 'Burkinabè' : 'Autre',
        nationalitePersonnalisee: etudiant.nationalite !== 'Burkinabè' ? etudiant.nationalite : ''
      }
    }));
  }, [etudiant]);

  // Gestion du changement d'un champ
  const gererChangement = (champ, valeur) => {
    setEtat(prev => ({
      ...prev,
      donnees: { ...prev.donnees, [champ]: valeur },
      erreurs: prev.erreurs[champ] && valeur.trim() !== '' ? { ...prev.erreurs, [champ]: null } : prev.erreurs
    }));
  };

  // Validation des champs
  const validerFormulaire = () => {
    const erreurs = {};
    Object.keys(configChamps).forEach(champ => {
      const cfg = configChamps[champ];
      if (cfg.requis && !etat.donnees[champ]?.toString().trim()) erreurs[champ] = `${cfg.libelle} requis`;
      else if (cfg.validation && !cfg.validation(etat.donnees[champ]) && champ === 'age') erreurs[champ] = 'Âge invalide (18-120)';
    });
    if (etat.donnees.nationalite === 'Autre' && !etat.donnees.nationalitePersonnalisee?.trim()) erreurs.nationalitePersonnalisee = 'Entrer votre nationalité requise';
    setEtat(prev => ({ ...prev, erreurs }));
    return Object.keys(erreurs).length === 0;
  };

  // Soumission formulaire
  const gererSoumission = async () => {
    if (!validerFormulaire()) {
      Alert.alert('Erreur', 'Veuillez corriger les erreurs dans le formulaire.');
      return;
    }
    const final = {
      ...etat.donnees,
      age: Number(etat.donnees.age),
      nationalite: etat.donnees.nationalite === 'Autre' ? etat.donnees.nationalitePersonnalisee : etat.donnees.nationalite
    };

    try {
      const res = etudiant ? await api.updateEtudiant(etudiant.id, final) : await api.createEtudiant(final);
      Alert.alert(res.success ? 'Succès' : 'Erreur', res.success ? (etudiant ? 'Étudiant modifié' : 'Étudiant ajouté') : res.message || 'Impossible de sauvegarder', [
        { text: 'OK', onPress: () => onSave ? onSave() : navigation.goBack() }
      ]);
    } catch {
      Alert.alert('Erreur', 'Erreur serveur');
    }
  };

  // Rendu d'une ligne de champs
  const renderLigne = (champs) => (
    <View style={globalStyles.formulaireEtudiantLigneFormulaire} key={champs.join('-')}>
      {champs.map(champ => (
        <ChampFormulaire
          key={champ}
          champ={champ}
          valeur={etat.donnees[champ]}
          onChange={gererChangement}
          erreurs={etat.erreurs}
          focus={etat.focus}
          onFocus={f => setEtat(prev => ({ ...prev, focus: f }))}
          onBlur={() => setEtat(prev => ({ ...prev, focus: null }))}
          configChamps={configChamps}
        />
      ))}
    </View>
  );

  return (
    <ScrollView style={globalStyles.formulaireEtudiantScroll}>
      <View style={globalStyles.formulaireEtudiantSectionFormulaire}>
        {champsEnLigne.map(renderLigne)}
        {etat.donnees.nationalite === 'Autre' && (
          <View style={[globalStyles.formulaireEtudiantLigneFormulaire]}>
            <ChampFormulaire
              champ="nationalitePersonnalisee"
              valeur={etat.donnees.nationalitePersonnalisee}
              onChange={gererChangement}
              erreurs={etat.erreurs}
              focus={etat.focus}
              onFocus={f => setEtat(prev => ({ ...prev, focus: f }))}
              onBlur={() => setEtat(prev => ({ ...prev, focus: null }))}
              configChamps={configChamps}
            />
          </View>
        )}
        <View style={globalStyles.formulaireEtudiantActionsFormulaire}>
          <TouchableOpacity style={globalStyles.formulaireEtudiantBoutonSoumettre} onPress={gererSoumission}>
            <Text style={globalStyles.formulaireEtudiantTexteSoumettre}>{etudiant ? 'Modifier' : 'Ajouter'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={globalStyles.formulaireEtudiantBoutonAnnuler} onPress={onCancel}>
            <Text style={globalStyles.formulaireEtudiantTexteAnnuler}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}


