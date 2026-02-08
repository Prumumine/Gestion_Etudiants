import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import Header from '../components/Header';
import api from '../services/api';
import { globalStyles } from '../styles/styles';

export default function ChangerMotDePasse({ navigation }) {
  const [formulaire, setFormulaire] = useState({
    actuel: '',
    nouveau: '',
    confirmer: ''
  });
  const [chargement, setChargement] = useState(false);

  const modifierChamp = (champ, valeur) => setFormulaire(prev => ({ ...prev, [champ]: valeur }));

  const validerEtChanger = async () => {
    const { actuel, nouveau, confirmer } = formulaire;
    if (!actuel || !nouveau || !confirmer) return Alert.alert('Erreur','Tous les champs sont requis');
    if (nouveau !== confirmer) return Alert.alert('Erreur','Les mots de passe ne correspondent pas');

    setChargement(true);
    try {
      await api.changePassword({ oldPassword: actuel, newPassword: nouveau });
      Alert.alert('Succès','Mot de passe changé',[{text:'OK',onPress:()=>navigation.goBack()}]);
    } catch {
      Alert.alert('Erreur','Ancien mot de passe incorrect');
    } finally {
      setChargement(false);
    }
  };

  const champs = [
    { label:'Mot de passe actuel', key:'actuel' },
    { label:'Nouveau mot de passe', key:'nouveau' },
    { label:'Confirmer mot de passe', key:'confirmer' }
  ];

  return (
    <View style={globalStyles.changerMotDePasseContainer}>
      <Header titre="Changer mot de passe" navigation={navigation} minimal/>
      <ScrollView style={globalStyles.changerMotDePasseScroll}>
        <View style={globalStyles.changerMotDePasseForm}>
          {champs.map(c => (
            <View style={globalStyles.changerMotDePasseField} key={c.key}>
              <Text style={globalStyles.changerMotDePasseLabel}>{c.label}</Text>
              <TextInput
                style={globalStyles.changerMotDePasseInput}
                secureTextEntry
                value={formulaire[c.key]}
                onChangeText={val => modifierChamp(c.key, val)}
              />
            </View>
          ))}
          <TouchableOpacity style={[globalStyles.changerMotDePasseButton, chargement && globalStyles.changerMotDePasseDisabled]} onPress={validerEtChanger} disabled={chargement}>
            <Text style={globalStyles.changerMotDePasseButtonText}>{chargement ? 'En cours...' : 'Changer le mot de passe'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}


