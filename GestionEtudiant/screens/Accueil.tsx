import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { globalStyles } from '../styles/styles';
import api from '../services/api';
import Header from '../components/Header';

const STATS_INITIALES = {total: 0, aJour: 0, nonAJour: 0, parSexe: { M: 0, F: 0 }, parNationalite: { National: 0, Etranger: 0 }
};

const calculerStatistiques = etudiants => {
  const aJour = etudiants.filter(e => ['A jour','À jour'].includes(e.inscription)).length;
  const nonAJour = etudiants.filter(e => ['Non à jour','Non a jour'].includes(e.inscription)).length;
  const parSexe = etudiants.reduce((acc, e) => {
    if(e.sexe === 'M') acc.M++; if(e.sexe === 'F') acc.F++; return acc;
  }, { M:0, F:0 });
  const parNationalite = etudiants.reduce((acc, e) => {
    if(e.nationalite === 'Burkinabè') acc.National++; else if(e.nationalite) acc.Etranger++;
    return acc;
  }, { National:0, Etranger:0 });
  return { total: etudiants.length, aJour, nonAJour, parSexe, parNationalite };
};

export default function Accueil({ navigation }) {
  const [stats, setStats] = useState(STATS_INITIALES);
  const [derniersEtudiants, setDerniersEtudiants] = useState([]);
  const [etudiantsNonAJour, setEtudiantsNonAJour] = useState([]);
  const [chargement, setChargement] = useState(true);

  const chargerDonnees = useCallback(async () => {
    try {
      const reponse = await api.getEtudiants();
      if(reponse.success){
        const etudiants = reponse.data || [];
        setStats(calculerStatistiques(etudiants));
        setDerniersEtudiants(etudiants.slice(-3).reverse());
        setEtudiantsNonAJour(etudiants.filter(e => ['Non à jour','Non a jour'].includes(e.inscription)));
      }
    } catch { console.log('Erreur chargement'); }
    finally { setChargement(false); }
  }, []);

  useFocusEffect(useCallback(() => { chargerDonnees(); }, [chargerDonnees]));

  if(chargement) return <View style={globalStyles.accueilLoading}><Text>Chargement...</Text></View>;

  const CarteStat = ({ nombre, libelle }) => (
    <View style={globalStyles.accueilTopCard}><Text style={globalStyles.accueilTopNumber}>{nombre}</Text><Text style={globalStyles.accueilTopLabel}>{libelle}</Text></View>
  );

  const EtudiantRecent = ({ e }) => (
    <View style={globalStyles.accueilStudent}>
      <View style={globalStyles.accueilStudentInfo}>
        <Text style={globalStyles.accueilName}>{e.prenom} {e.nom}</Text>
        <Text style={globalStyles.accueilDetails}>{e.filiere} • {e.niveau}</Text>
        <Text style={globalStyles.accueilDate}>{new Date(e.created_at).toLocaleDateString('fr-FR')}</Text>
      </View>
      <View style={[globalStyles.accueilStatus, e.inscription==='A jour'?globalStyles.accueilStatusOk:globalStyles.accueilStatusNot]}>
        <Text style={[globalStyles.accueilStatusText, e.inscription!=='A jour'&&{color:'#FF3B30'}]}>{e.inscription}</Text>
      </View>
    </View>
  );

  return (
    <View style={globalStyles.accueilContainer}>
      <Header titre="Accueil" navigation={navigation} etudiantsNonAJour={etudiantsNonAJour}/>
      <ScrollView style={globalStyles.accueilScroll}>
        <View style={globalStyles.accueilHeader}>
          <Text style={globalStyles.accueilTitle}>Tableau de bord</Text>
          <Text style={globalStyles.accueilSubtitle}>Découvrez les statistiques de vos étudiants</Text>
        </View>

        <View style={globalStyles.accueilTopRow}>
          <CarteStat nombre={stats.total} libelle="Total étudiants"/>
          <CarteStat nombre={stats.parSexe.M} libelle="Hommes"/>
          <CarteStat nombre={stats.parSexe.F} libelle="Femmes"/>
        </View>

        <View style={globalStyles.accueilMiddleCard}>
          <View style={globalStyles.accueilMiddleLeft}>
            <Text style={globalStyles.accueilSectionTitle}>Scolarité</Text>
            {['aJour','nonAJour'].map(cle => (
              <View key={cle} style={globalStyles.accueilScolItem}>
                <View style={[globalStyles.accueilDot, cle==='aJour'?globalStyles.accueilDotOk:globalStyles.accueilDotNot]}/>
                <Text style={globalStyles.accueilScolText}>{cle==='aJour'?'À jour':'Non à jour'}</Text>
                <Text style={globalStyles.accueilScolNumber}>{stats[cle]}</Text>
              </View>
            ))}
          </View>
          <View style={globalStyles.accueilMiddleRight}>
            <Text style={globalStyles.accueilSectionTitle}>Nationalité</Text>
            {['National','Etranger'].map(cle => (
              <View key={cle} style={globalStyles.accueilNatItem}>
                <View style={[globalStyles.accueilNatDot,{backgroundColor:cle==='National'?'#FF8C42':'#4DA8DA'}]}/>
                <Text style={globalStyles.accueilNatText}>{cle==='National'?'Nationaux':'Étrangers'}</Text>
                <Text style={globalStyles.accueilNatNumber}>{stats.parNationalite[cle]}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={globalStyles.accueilRecent}>
          <View style={globalStyles.accueilRecentHeader}>
            <Text style={globalStyles.accueilRecentTitle}>Derniers étudiants</Text>
            <TouchableOpacity onPress={()=>navigation.navigate('Étudiants')}><Text style={globalStyles.accueilSeeAll}>Tout voir</Text></TouchableOpacity>
          </View>
          {derniersEtudiants.map((e,i)=><EtudiantRecent key={i} e={e}/>)}
        </View>
      </ScrollView>
    </View>
  );
}


