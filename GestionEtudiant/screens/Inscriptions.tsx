import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { globalStyles } from '../styles/styles';
import api from '../services/api';
import { getImageEtudiant } from '../services/imageApi';
import { filtrerEtudiants } from '../utils/Recherche';
import Header from '../components/Header';

export default function Inscriptions({ navigation, route }) {
  const [etat, setEtat] = useState({ etudiants: [], loading: true, activeTab: route.params?.activeTab || 'aJour', search: '' });
  const [nonAJourStudents, setNonAJourStudents] = useState([]);

  useEffect(() => {
    if (route.params?.activeTab) {
      setEtat(prev => ({ ...prev, activeTab: route.params.activeTab }));
    }
  }, [route.params?.activeTab]);

  useFocusEffect(useCallback(() => { chargerEtudiants(); }, []));

  const chargerEtudiants = async () => {
    setEtat(prev => ({ ...prev, loading: true }));
    try {
      const res = await api.getEtudiants();
      if (res.success) {
        const students = (res.data || []).sort((a,b)=>b.id-a.id);
        setEtat(prev => ({ ...prev, etudiants: students }));
        setNonAJourStudents(students.filter(e=>['Non à jour','Non a jour'].includes(e.inscription)));
      }
    } catch(err) { console.error(err); }
    finally { setEtat(prev=>({...prev, loading:false})); }
  };

  const tabData = useMemo(()=>({ aJour: etat.etudiants.filter(e=>['À jour','A jour'].includes(e.inscription)), nonAJour: etat.etudiants.filter(e=>['Non à jour','Non a jour'].includes(e.inscription)) }),[etat.etudiants]);

  const filteredStudents = useMemo(()=>filtrerEtudiants(tabData[etat.activeTab], etat.search),[tabData,etat.activeTab,etat.search]);

  if(etat.loading) return <View style={globalStyles.inscriptionsLoading}><Text>Chargement...</Text></View>;

  return (
    <View style={globalStyles.inscriptionsContainer}>
      <Header titre="Inscriptions" navigation={navigation} etudiantsNonAJour={nonAJourStudents}/>
      <ScrollView style={globalStyles.inscriptionsScroll}>
        <View style={globalStyles.inscriptionsTabs}>{[['aJour','À jour'],['nonAJour','Non à jour']].map(([key,label])=>{const isActive=etat.activeTab===key;return(<TouchableOpacity key={key} style={globalStyles.inscriptionsTab} onPress={()=>setEtat(p=>({...p,activeTab:key}))}><Text style={[globalStyles.inscriptionsTabText,isActive&&globalStyles.inscriptionsActiveTabText]}>{label} {tabData[key]?.length||0}</Text>{isActive&&<View style={globalStyles.inscriptionsTabIndicator}/>}</TouchableOpacity>);})}</View>
        <View style={globalStyles.inscriptionsHeaderSection}><View style={globalStyles.inscriptionsSearchBox}><Ionicons name="search" size={18} color="#8E8E93"/><TextInput style={globalStyles.inscriptionsSearchInput} placeholder="Rechercher..." value={etat.search} onChangeText={t=>setEtat(p=>({...p,search:t}))} clearButtonMode="while-editing"/></View></View>
        <View style={globalStyles.inscriptionsSection}>{filteredStudents.length>0 ? filteredStudents.map(e=>(<TouchableOpacity key={e.id} style={globalStyles.inscriptionsStudentCard} onPress={()=>navigation.navigate('DetailsEtudiant',{etudiant:e, sourceScreen: 'Inscriptions'})}><Image source={{uri:getImageEtudiant(e.sexe,e.id)}} style={globalStyles.inscriptionsAvatar}/><Text style={globalStyles.inscriptionsStudentName}>{e.prenom} {e.nom}</Text></TouchableOpacity>)) : <Text style={globalStyles.inscriptionsEmptyText}>Aucun étudiant</Text>}</View>
      </ScrollView>
    </View>
  );
}


