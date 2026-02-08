import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TextInput, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../services/api';
import { filtrerHistorique } from '../utils/Recherche';
import { getImageEtudiant as obtenirImageEtudiant } from '../services/imageApi';
import Header from '../components/Header';
import { globalStyles } from '../styles/styles';

export default function Historique({ navigation }) {
  const [etat, setEtat] = useState({ historique: [], loading: true, search: '' });

  useEffect(() => { chargerHistorique(); }, []);

  const chargerHistorique = async () => {
    try {
      const res = await api.getHistorique();
      if (res.success) setEtat(prev => ({ ...prev, historique: res.data || [] }));
    } catch (err) { console.error('Erreur historique:', err); }
    finally { setEtat(prev => ({ ...prev, loading: false })); }
  };

  const actionsMap = useMemo(() => ({ create: 'Création', update: 'Modification', delete: 'Suppression' }), []);
  const translateAction = (a) => actionsMap[a?.toLowerCase()] || a;

  const filteredHistorique = useMemo(() => filtrerHistorique(etat.historique, etat.search), [etat.historique, etat.search]);

  if (etat.loading) return <View style={globalStyles.historiqueLoading}><Text>Chargement...</Text></View>;

  const renderItem = (item, idx) => (
    <View key={idx} style={globalStyles.historiqueItem}>
      <Image source={{ uri: obtenirImageEtudiant(item.sexe, item.etudiant_id) }} style={globalStyles.historiqueAvatar} />
      <View style={globalStyles.historiqueItemContent}>
        <View style={globalStyles.historiqueItemHeader}>
          <Text style={globalStyles.historiqueItemName}>{item.prenom} {item.nom}</Text>
          <Text style={globalStyles.historiqueItemAction}>{translateAction(item.action)}</Text>
        </View>
        <Text style={globalStyles.historiqueItemDate}>{new Date(item.created_at).toLocaleString('fr-FR')}</Text>
      </View>
    </View>
  );

  return (
    <View style={globalStyles.historiqueContainer}>
      <Header titre="Historique" navigation={navigation} minimal />

      <View style={globalStyles.historiqueSearchSection}>
        <Ionicons name="search" size={18} color="#8E8E93" />
        <TextInput
          style={globalStyles.historiqueSearchInput}
          placeholder="Rechercher..."
          value={etat.search}
          onChangeText={t => setEtat(prev => ({ ...prev, search: t }))}
          clearButtonMode="while-editing"
        />
      </View>

      <ScrollView style={globalStyles.historiqueScroll} showsVerticalScrollIndicator={false}>
        {filteredHistorique.length > 0
          ? filteredHistorique.map(renderItem)
          : (
            <View style={globalStyles.historiqueEmpty}>
              <Ionicons name="time-outline" size={48} color="#C7C7CC" />
              <Text style={globalStyles.historiqueEmptyText}>Aucun historique disponible</Text>
            </View>
          )}
      </ScrollView>
    </View>
  );
}


