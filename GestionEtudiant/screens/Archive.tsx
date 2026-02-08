import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { globalStyles } from '../styles/styles';
import Header from '../components/Header';
import api from '../services/api';
import { getImageEtudiant } from '../services/imageApi';

export default function Archive({ navigation }) {
  const [archive, setArchive] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { chargerArchive(); }, []);

  const chargerArchive = async () => {
    try {
      const res = await api.getArchive();
      if(res.success) setArchive((res.data||[]).sort((a,b)=>new Date(b.deleted_at)-new Date(a.deleted_at)));
    } catch { Alert.alert('Erreur','Impossible de charger l\'archive'); }
    finally { setLoading(false); }
  };

  const confirmerRestaurer = (id, nom) => {
    Alert.alert(
      'Restaurer étudiant',
      `Voulez-vous vraiment restaurer ${nom} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Restaurer', onPress: () => restaurerEtudiant(id, nom) }
      ]
    );
  };

  const restaurerEtudiant = async (id, nom) => {
    try { await api.restoreEtudiant(id); Alert.alert('Succès', `${nom} restauré`); chargerArchive(); }
    catch { Alert.alert('Erreur','Restauration échouée'); }
  };

  if(loading) return <View style={globalStyles.archiveLoading}><Text>Chargement...</Text></View>;

  return (
    <View style={globalStyles.archiveContainer}>
      <Header titre="Archive" navigation={navigation} minimal/>
      <View style={globalStyles.archiveHeaderSection}><Text style={globalStyles.archiveCount}>{archive.length} étudiant(s) archivé(s)</Text></View>
      <ScrollView style={globalStyles.archiveScroll}>
        {archive.length>0 ? archive.map(e=>(
          <View key={e.id} style={globalStyles.archiveItem}>
            <Image source={{ uri: getImageEtudiant(e.sexe, e.id) }} style={globalStyles.archiveAvatar} />
            <View style={globalStyles.archiveItemContent}>
              <Text style={globalStyles.archiveName}>{e.prenom} {e.nom}</Text>
              <Text style={globalStyles.archiveDetails}>{e.filiere} • {e.niveau}</Text>
              <Text style={globalStyles.archiveDate}>Archivé le {new Date(e.deleted_at).toLocaleDateString('fr-FR')}</Text>
            </View>
            <TouchableOpacity style={globalStyles.archiveRestoreBtn} onPress={()=>confirmerRestaurer(e.id,e.nom)}>
              <Text style={globalStyles.archiveRestoreText}>Restaurer</Text>
            </TouchableOpacity>
          </View>
        )) : <View style={globalStyles.archiveEmpty}><Text style={globalStyles.archiveEmptyText}>Archive vide</Text></View>}
      </ScrollView>
    </View>
  );
}


