import React, { useState, useEffect, useContext } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Alert, Text } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { globalStyles } from '../styles/styles';
import { ChampFormulaire } from '../components/ChampFormulaire';
import { configChamps, champsEnLigne } from '../config/configChamps';
import api from '../services/api';
import { NotificationContext } from '../Navigation';

export default function ModifierEtudiant({ etudiant: etudiantProp, onSave: onSaveProp, onCancel: onCancelProp }) {
  const route = useRoute();
  const navigation = useNavigation();
  const etudiant = etudiantProp || route.params?.etudiant;
  const onSave = onSaveProp || (() => navigation.goBack());
  const onCancel = onCancelProp || (() => navigation.goBack());
  const { refreshNotificationCount } = useContext(NotificationContext);
  const [donnees, setDonnees] = useState({ nom:'',prenom:'',age:'',telephone:'',niveau:'',filiere:'',sexe:'',inscription:'A jour',nationalite:'',nationalitePersonnalisee:'' });
  const [erreurs, setErreurs] = useState({});
  const [focus, setFocus] = useState(null);

  useEffect(() => { if(etudiant) setDonnees({ nom:etudiant.nom, prenom:etudiant.prenom, age:etudiant.age?.toString()||'', telephone:etudiant.telephone, niveau:etudiant.niveau, filiere:etudiant.filiere, sexe:etudiant.sexe, inscription:etudiant.inscription||'A jour', nationalite:etudiant.nationalite==='Burkinabè'?'Burkinabè':(etudiant.nationalite?'Autre':''), nationalitePersonnalisee:etudiant.nationalite!=='Burkinabè'?etudiant.nationalite:'' }); }, [etudiant]);

  const gererChangement = (cle,valeur) => { setDonnees(prev=>({...prev,[cle]:valeur})); if(erreurs[cle] && valeur.trim() !== '') setErreurs(prev=>({...prev,[cle]:null})); };

  const validerFormulaire = () => {
    const erreurs = {};
    Object.keys(configChamps).forEach(champ => {
      const cfg = configChamps[champ];
      if (cfg.requis && !donnees[champ]?.toString().trim()) erreurs[champ] = `${cfg.libelle} requis`;
      else if (cfg.validation && !cfg.validation(donnees[champ])) erreurs[champ] = cfg.erreurMessage || `${cfg.libelle} invalide`;
    });
    if (donnees.nationalite === 'Autre' && !donnees.nationalitePersonnalisee?.trim()) erreurs.nationalitePersonnalisee = 'Entrer votre nationalité requise';
    setErreurs(erreurs);
    return Object.keys(erreurs).length === 0;
  };

  const gererSoumission = async () => {
    if (!validerFormulaire()) {
      Alert.alert('Erreur', 'Veuillez corriger les erreurs dans le formulaire.');
      return;
    }
    const nationaliteFinale = donnees.nationalite==='Autre'?donnees.nationalitePersonnalisee:donnees.nationalite;
    const data = {...donnees, age:Number(donnees.age), nationalite:nationaliteFinale};
    try {
      const res = await api.updateEtudiant(etudiant.id,data);
      if(res.success) {
        await refreshNotificationCount(); // Refresh notification count after modifying student
        setTimeout(()=>Alert.alert('Succès','Étudiant modifié',[{text:'OK',onPress:onSave}]),0);
      }
      else if(res.errors){ const champs={}; res.errors.forEach(err=>{ Object.keys(donnees).forEach(c=>{ if(err.includes(c.charAt(0).toUpperCase()+c.slice(1))) champs[c]=err; }); }); setErreurs(champs); }
      else setTimeout(()=>Alert.alert('Erreur',res.message||'Impossible de sauvegarder'),0);
    } catch { setTimeout(()=>Alert.alert('Erreur','Erreur serveur'),0); }
  };

  const renderLigne = champs => <View style={globalStyles.modifierEtudiantLigneFormulaire} key={champs.join('-')}>{champs.map(c=><ChampFormulaire key={c} champ={c} valeur={donnees[c]} onChange={gererChangement} erreurs={erreurs} focus={focus} onFocus={setFocus} onBlur={()=>setFocus(null)} configChamps={configChamps}/>)}</View>;

  return (
    <ScrollView style={globalStyles.modifierEtudiantScroll}>
      <View style={globalStyles.modifierEtudiantSectionFormulaire}>
        {champsEnLigne.map(renderLigne)}
        {donnees.nationalite==='Autre' && <View style={[globalStyles.modifierEtudiantLigneFormulaire, { marginTop: 0 }]}><ChampFormulaire champ="nationalitePersonnalisee" valeur={donnees.nationalitePersonnalisee} onChange={gererChangement} erreurs={erreurs} focus={focus} onFocus={setFocus} onBlur={()=>setFocus(null)} configChamps={configChamps}/></View>}
        <View style={globalStyles.modifierEtudiantActionsFormulaire}>
          <TouchableOpacity style={globalStyles.modifierEtudiantBoutonSoumettre} onPress={gererSoumission}><Text style={globalStyles.modifierEtudiantTexteSoumettre}>Modifier</Text></TouchableOpacity>
          <TouchableOpacity style={globalStyles.modifierEtudiantBoutonAnnuler} onPress={onCancel}><Text style={globalStyles.modifierEtudiantTexteAnnuler}>Annuler</Text></TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
