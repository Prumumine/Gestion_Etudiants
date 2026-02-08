import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Alert, Modal, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { globalStyles } from '../styles/styles';
import api from '../services/api';
import { getAvatarUtilisateur } from '../services/imageApi';

export default function MenuDrawer({ navigation }) {
  const [etat, setEtat] = useState({
    utilisateur: null,
    menuOuvert: {},
    modalVisible: false,
  });

  useEffect(() => { chargerProfil(); }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      chargerProfil();
    });
    return unsubscribe;
  }, [navigation]);

  const chargerProfil = async () => {
    try {
      const res = await api.getProfil();
      if (res.success) setEtat(prev => ({ ...prev, utilisateur: res.utilisateur }));
      else {
        if (res.message?.toLowerCase().includes('token')) {
          await AsyncStorage.removeItem('token');
          navigation.replace('Connexion');
        }
        setEtat(prev => ({ ...prev, utilisateur: null }));
      }
    } catch { setEtat(prev => ({ ...prev, utilisateur: null })); }
  };

  const deconnexion = () => Alert.alert('Déconnexion', 'Êtes-vous sûr ?', [
    { text: 'Annuler', style: 'cancel' },
    { text: 'Déconnexion', style: 'destructive', onPress: async () => {
      await AsyncStorage.removeItem('token');
      navigation.replace('Connexion');
    }}
  ]);

  const itemsMenu = [
    { icone: 'person', label: 'Profil', sousMenu: [
        { label: 'Voir le profil', screen: 'Profil' },
        { label: 'Modifier mot de passe', screen: 'ChangerMotDePasse' }
      ] },
    { icone: 'time', label: 'Historique', screen: 'Historique' },
    { icone: 'archive', label: 'Archive', screen: 'Archive' },
    { icone: 'settings', label: 'Paramètres', screen: 'Paramètres' }
  ];

  const toggleSousMenu = (index) => setEtat(prev => ({
    ...prev,
    menuOuvert: { ...prev.menuOuvert, [index]: !prev.menuOuvert[index] }
  }));

  const renderItem = (item, index) => (
    <View key={index}>
      <TouchableOpacity style={globalStyles.drawerMenuItem} onPress={() => item.sousMenu ? toggleSousMenu(index) : navigation.navigate(item.screen)}>
        <View style={globalStyles.drawerMenuItemLeft}>
          <Ionicons name={item.icone} size={22} color="#555" />
          <Text style={globalStyles.drawerMenuTexte}>{item.label}</Text>
        </View>
        {item.sousMenu && <Ionicons name={etat.menuOuvert[index] ? 'chevron-up' : 'chevron-down'} size={20} color="#777" />}
        {!item.sousMenu && <Ionicons name="chevron-forward" size={20} color="#777" />}
      </TouchableOpacity>

      {item.sousMenu && etat.menuOuvert[index] && (
        <View style={globalStyles.drawerSousMenu}>
          {item.sousMenu.map((sub, i) => (
            <TouchableOpacity key={i} style={globalStyles.drawerSousMenuItem} onPress={() => navigation.navigate(sub.screen)}>
              <Text>{sub.label}</Text>
              <Ionicons name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={globalStyles.drawerContainer}>
      <View style={globalStyles.drawerHeader}>
        <TouchableOpacity onPress={() => setEtat(prev => ({ ...prev, modalVisible: true }))}>
          <Image source={{ uri: getAvatarUtilisateur(etat.utilisateur?.id) }} style={globalStyles.drawerImageProfil} />
        </TouchableOpacity>
        <View>
          <Text style={globalStyles.drawerNom}>{etat.utilisateur?.nom || 'Admin'}</Text>
          <Text style={globalStyles.drawerEmail}>{etat.utilisateur?.email || 'admin@email.com'}</Text>
        </View>
      </View>

      <ScrollView style={globalStyles.drawerMenu}>{itemsMenu.map(renderItem)}</ScrollView>

      <TouchableOpacity style={globalStyles.drawerDeconnexionBtn} onPress={deconnexion}>
        <Ionicons name="log-out-outline" size={22} color="#e74c3c" />
        <Text style={globalStyles.drawerDeconnexionTexte}>Déconnexion</Text>
      </TouchableOpacity>

      <Modal visible={etat.modalVisible} transparent animationType="fade" onRequestClose={() => setEtat(prev => ({ ...prev, modalVisible: false }))}>
        <View style={globalStyles.drawerModalOverlay}>
          <TouchableOpacity style={globalStyles.drawerModalCloseArea} onPress={() => setEtat(prev => ({ ...prev, modalVisible: false }))}>
            <View style={globalStyles.drawerModalContent}>
              <TouchableOpacity style={globalStyles.drawerCloseBtn} onPress={() => setEtat(prev => ({ ...prev, modalVisible: false }))}>
                <Ionicons name="close" size={30} color="white" />
              </TouchableOpacity>
              <Image source={{ uri: getAvatarUtilisateur(etat.utilisateur?.id) }} style={globalStyles.drawerLargeImage} />
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}


