import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, ScrollView, TextInput, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { globalStyles } from '../styles/styles';
import Header from '../components/Header';
import api from '../services/api';
import { getAvatarUtilisateur } from '../services/imageApi';
import { NotificationContext } from '../Navigation';

export default function Profil({ navigation }) {
  const { refreshNotificationCount } = useContext(NotificationContext);

  const [state, setState] = useState({ profil: null, chargement: true, erreur: null, edition: false, donneesEdition: {}, modalImage: false
  });

  const set = updates => setState(prev => ({ ...prev, ...updates }));

  useEffect(() => { chargerProfil(); }, []);
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', chargerProfil);
    return unsubscribe;
  }, [navigation]);

  const chargerProfil = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        set({
          profil: { id: user.id, nom: user.nom, email: user.email, photo: null },
          erreur: null,
          chargement: false
        });
        return;
      }

      const res = await api.getProfil();
      if (res?.success) set({ profil: res.data || res.utilisateur, erreur: null });
      else set({ erreur: res?.message || 'Erreur lors du chargement du profil' });

    } catch (err) {
      console.error('Erreur profil:', err);
      set({ erreur: 'Erreur de connexion au serveur' });
    } finally {
      set({ chargement: false });
    }
  };

  const demarrerEdition = () => set({
    donneesEdition: { nom: state.profil.nom, email: state.profil.email },
    edition: true
  });

  const annulerEdition = () => set({ edition: false, donneesEdition: {} });

  const sauvegarderEdition = async () => {
    try {
      const res = await api.updateProfil(state.donneesEdition);
      if (res.success) {
        set({
          profil: { ...state.profil, ...state.donneesEdition },
          edition: false
        });
        Alert.alert('Succès', 'Profil mis à jour');
      } else Alert.alert('Erreur', res.message || 'Impossible de mettre à jour');
    } catch {
      Alert.alert('Erreur', 'Erreur serveur');
    }
  };

  const changerChamp = (champ, valeur) =>
    set({ donneesEdition: { ...state.donneesEdition, [champ]: valeur } });

  if (state.chargement) return <View style={globalStyles.profilChargement}><Text>Chargement...</Text></View>;
  if (state.erreur) return <View style={globalStyles.profilChargement}><Text>{state.erreur}</Text></View>;
  if (!state.profil) return <View style={globalStyles.profilChargement}><Text>Profil non trouvé</Text></View>;

  return (
    <View style={globalStyles.profilEcran}>
      <Header titre="Profil" navigation={navigation} minimal />

      <ScrollView style={globalStyles.profilScroll}>
        <View style={globalStyles.profilSectionHaut}>
          <TouchableOpacity onPress={() => set({ modalImage: true })}>
            <Image source={{ uri: getAvatarUtilisateur(state.profil.id || 1) }} style={globalStyles.profilPhoto} />
          </TouchableOpacity>
          <Text style={globalStyles.profilNomUtilisateur}>{state.profil.nom}</Text>
          <Text style={globalStyles.profilEmailUtilisateur}>{state.profil.email}</Text>
        </View>

        <View style={globalStyles.profilCarte}>
          <Text style={globalStyles.profilTitreSection}>Informations personnelles</Text>

          {state.edition ? (
            <>
              <View style={globalStyles.profilChamp}>
                <Text style={globalStyles.profilLabelChamp}>Nom</Text>
                <TextInput
                  style={globalStyles.profilInputChamp}
                  value={state.donneesEdition.nom}
                  onChangeText={val => changerChamp('nom', val)}
                />
              </View>

              <View style={globalStyles.profilChamp}>
                <Text style={globalStyles.profilLabelChamp}>Email</Text>
                <TextInput
                  style={globalStyles.profilInputChamp}
                  value={state.donneesEdition.email}
                  onChangeText={val => changerChamp('email', val)}
                  keyboardType="email-address"
                />
              </View>

              <View style={globalStyles.profilActions}>
                <TouchableOpacity style={globalStyles.profilBoutonEdition} onPress={annulerEdition}>
                  <Text style={globalStyles.profilTexteBoutonEdition}>Annuler</Text>
                </TouchableOpacity>

                <TouchableOpacity style={globalStyles.profilBoutonPrincipal} onPress={sauvegarderEdition}>
                  <Text style={globalStyles.profilTexteBoutonPrincipal}>Sauvegarder</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={globalStyles.profilChamp}>
                <Text style={globalStyles.profilLabelChamp}>Nom</Text>
                <Text style={globalStyles.profilTexteChamp}>{state.profil.nom}</Text>
              </View>

              <View style={globalStyles.profilChamp}>
                <Text style={globalStyles.profilLabelChamp}>Email</Text>
                <Text style={globalStyles.profilTexteChamp}>{state.profil.email}</Text>
              </View>

              <View style={globalStyles.profilSeparateur} />

              <View style={globalStyles.profilActions}>
                <TouchableOpacity style={globalStyles.profilBoutonEdition} onPress={demarrerEdition}>
                  <Ionicons name="create" size={20} color="#007AFF" />
                  <Text style={globalStyles.profilTexteBoutonEdition}>Modifier</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={state.modalImage}
        transparent
        animationType="fade"
        onRequestClose={() => set({ modalImage: false })}
      >
        <View style={globalStyles.profilFondModal}>
          <TouchableOpacity style={globalStyles.profilZoneFermerModal} onPress={() => set({ modalImage: false })}>
            <View style={globalStyles.profilContenuModal}>
              <TouchableOpacity style={globalStyles.profilBoutonFermer} onPress={() => set({ modalImage: false })}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
              <Image source={{ uri: getAvatarUtilisateur(state.profil.id) }} style={globalStyles.profilGrandeImage} />
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
