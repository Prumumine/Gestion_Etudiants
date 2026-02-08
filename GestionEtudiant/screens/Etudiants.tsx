import React, { useState, useContext, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { globalStyles } from '../styles/styles';
import api from '../services/api';
import { getImageEtudiant } from '../services/imageApi';
import { exportStudentsFile } from '../services/exportService';
import { filtrerEtudiants } from '../utils/Recherche';
import Header from '../components/Header';
import ModifierEtudiant from './ModifierEtudiant';
import FormulaireEtudiant from './FormulaireEtudiant';
import DetailsEtudiant from './DetailsEtudiant';
import { NotificationContext } from '../Navigation';

export default function Etudiants({ navigation }) {
  const { refreshNotificationCount } = useContext(NotificationContext);
  const [etat, setEtat] = useState({
    etudiants: [],
    recherche: '',
    chargement: true,
    etudiantEnEdition: null,
    editionActive: false,
    ajoutActif: false,
    etudiantEnVue: null
  });

  useFocusEffect(React.useCallback(() => { chargerEtudiants(); }, []));

  const chargerEtudiants = async () => {
    setEtat(prev => ({ ...prev, chargement: true }));
    try { 
      const res = await api.getEtudiants(); 
      if (res.success) setEtat(prev => ({ ...prev, etudiants: (res.data||[]).sort((a,b)=>b.id-a.id) })); 
    } catch { Alert.alert('Erreur','Impossible de charger les étudiants'); }
    finally { setEtat(prev => ({ ...prev, chargement: false })); }
  };

  const modifierEtat = (champ, valeur) => setEtat(prev => ({ ...prev, [champ]: valeur }));

  const confirmerSuppression = (id, nom) => {
    Alert.alert('Confirmer', `Supprimer ${nom} ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try {
          await api.deleteEtudiant(id);
          await refreshNotificationCount();
          Alert.alert('Succès','Étudiant archivé');
          chargerEtudiants();
        }
        catch { Alert.alert('Erreur','Suppression échouée'); }
      }}
    ]);
  };

  const exporterEtudiants = async (format) => {
    try {
      const res = await exportStudentsFile(format);
      if(res.success) Alert.alert('Succès', `Export ${format.toUpperCase()} réussi. Fichier: /storage/emulated/0/Download/${res.fileName}`);
      else Alert.alert('Erreur', `Export échoué: ${res.error||'Erreur inconnue'}`);
    } catch(error) { Alert.alert('Erreur', `Export échoué: ${error?.message||'Erreur inconnue'}`); }
  };

  const etudiantsFiltres = useMemo(() => filtrerEtudiants(etat.etudiants, etat.recherche), [etat.etudiants, etat.recherche]);

  if(etat.chargement) return <View style={globalStyles.etudiantsLoading}><Text>Chargement...</Text></View>;
  if(etat.editionActive && etat.etudiantEnEdition) return (
    <View style={globalStyles.etudiantsContainer}>
      <Header titre="Modifier Étudiant" navigation={navigation}/>
      <ModifierEtudiant etudiant={etat.etudiantEnEdition} onSave={()=>modifierEtat('editionActive', false) & modifierEtat('etudiantEnEdition', null) & chargerEtudiants()} onCancel={()=>modifierEtat('editionActive', false) & modifierEtat('etudiantEnEdition', null)}/>
    </View>
  );
  if(etat.ajoutActif) return (
    <View style={globalStyles.etudiantsContainer}>
      <Header titre="Ajouter Étudiant" navigation={navigation}/>
      <FormulaireEtudiant onSave={()=>modifierEtat('ajoutActif', false) & chargerEtudiants()} onCancel={()=>modifierEtat('ajoutActif', false)} navigation={navigation}/>
    </View>
  );
  if(etat.etudiantEnVue) return (
    <View style={globalStyles.etudiantsContainer}>
      <DetailsEtudiant etudiant={etat.etudiantEnVue} onSave={()=>modifierEtat('etudiantEnVue', null) & chargerEtudiants()} onAnnuler={()=>modifierEtat('etudiantEnVue', null)} onEdit={(s)=>{modifierEtat('etudiantEnEdition', s); modifierEtat('editionActive', true);}} navigation={navigation}/>
    </View>
  );

  const CarteEtudiant = ({ e }) => (
    <TouchableOpacity style={globalStyles.etudiantsStudentCard} onPress={()=>modifierEtat('etudiantEnVue', e)}>
      <View style={globalStyles.etudiantsStudentMain}>
        <Image source={{ uri: getImageEtudiant(e.sexe, e.id) }} style={globalStyles.etudiantsAvatar}/>
        <View style={globalStyles.etudiantsStudentInfo}>
          <Text style={globalStyles.etudiantsStudentName}>{e.prenom} {e.nom}</Text>
          <Text style={globalStyles.etudiantsStudentDetails}>{e.filiere} • {e.niveau}</Text>
        </View>
      </View>
      <View style={globalStyles.etudiantsStudentActions}>
        <TouchableOpacity style={globalStyles.etudiantsActionBtn} onPress={ev=>{ev.stopPropagation(); modifierEtat('etudiantEnEdition', e); modifierEtat('editionActive', true);}}>
          <Ionicons name="create-outline" size={18} color="#007AFF"/>
        </TouchableOpacity>
        <TouchableOpacity style={globalStyles.etudiantsActionBtn} onPress={ev=>{ev.stopPropagation(); confirmerSuppression(e.id, e.nom);}}>
          <Ionicons name="trash-outline" size={18} color="#FF3B30"/>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={globalStyles.etudiantsContainer}>
      <Header titre="Étudiants" navigation={navigation} etudiantsNonAJour={etat.etudiants.filter(s=>s.inscription!=='A jour')}/>
      <ScrollView style={globalStyles.etudiantsScroll}>
        <View style={globalStyles.etudiantsHeaderSection}>
          <View style={globalStyles.etudiantsSearchRow}>
            <View style={globalStyles.etudiantsSearchBox}>
              <Ionicons name="search" size={18} color="#8E8E93"/>
              <TextInput style={globalStyles.etudiantsSearchInput} placeholder="Rechercher..." value={etat.recherche} onChangeText={val=>modifierEtat('recherche', val)}/>
            </View>
            <TouchableOpacity style={globalStyles.etudiantsAddBtn} onPress={()=>modifierEtat('ajoutActif', true)}>
              <Ionicons name="add" size={22} color="white"/>
            </TouchableOpacity>
          </View>
        </View>
        <View style={globalStyles.etudiantsInfoSection}>
          <Text style={globalStyles.etudiantsTotalText}>{etudiantsFiltres.length} étudiants</Text>
          <TouchableOpacity style={globalStyles.etudiantsExportBtn} onPress={()=>Alert.alert('Exporter','Choisir le format',[{text:'Excel',onPress:()=>exporterEtudiants('excel')},{text:'PDF',onPress:()=>exporterEtudiants('pdf')},{text:'Annuler',style:'cancel'}])}>
            <Text style={globalStyles.etudiantsExportText}>Exporter</Text>
          </TouchableOpacity>
        </View>
        {etudiantsFiltres.map(e=><CarteEtudiant key={e.id} e={e}/>)}
      </ScrollView>
    </View>
  );
}


