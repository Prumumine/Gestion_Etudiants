import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { globalStyles } from '../styles/styles';

export default function EcranConnexion({ navigation }) {
  const [formulaire, setFormulaire] = useState({ nom:'', email:'', motDePasse:'' });
  const [chargement, setChargement] = useState(false);
  const [erreurs, setErreurs] = useState({});

  useEffect(() => {
    AsyncStorage.getItem('token').then(token => { if(token) navigation.replace('Main'); });
  }, []);

  const modifierChamp = (champ, valeur) => {
    setFormulaire(prev => ({ ...prev, [champ]: valeur }));
    setErreurs(prev => ({ ...prev, [champ]: null }));
  };

  const validerFormulaire = () => {
    const e = {};
    if(!formulaire.nom.trim()) e.nom='Nom requis';
    if(!formulaire.email.trim()) e.email='Email requis';
    else if(!formulaire.email.includes('@')) e.email='Email invalide';
    if(!formulaire.motDePasse.trim()) e.motDePasse='Mot de passe requis';
    setErreurs(e); return Object.keys(e).length===0;
  };

  const gererConnexion = async () => {
    if(!validerFormulaire()) return;
    setChargement(true);
    try {
      const reponse = await api.connexion({
        nom: formulaire.nom.trim(),
        email: formulaire.email.trim(),
        password: formulaire.motDePasse.trim()
      });
      if(reponse?.success){ await AsyncStorage.setItem('token', reponse.token); navigation.replace('Main'); }
      else Alert.alert('Erreur', reponse?.message || 'Identifiants incorrects');
    } catch{ Alert.alert('Erreur','Impossible de se connecter'); }
    finally{ setChargement(false); }
  };

  return (
    <View style={globalStyles.loginConteneur}>
      <View style={globalStyles.loginEntete}>
        <Image source={require('../assets/images/education-logo.png')} style={globalStyles.logo} resizeMode="contain"/>
      </View>
      <View style={globalStyles.loginFormulaireContainer}>
        <Text style={globalStyles.loginTitre}>Connexion</Text>
        <Text style={globalStyles.loginSousTitre}>Accédez à votre compte</Text>

        <ChampSaisie label="Nom" valeur={formulaire.nom} setValeur={val=>modifierChamp('nom',val)} erreur={erreurs.nom}/>
        <ChampSaisie label="Email" valeur={formulaire.email} setValeur={val=>modifierChamp('email',val)} erreur={erreurs.email} clavier="email-address" autoCapitalize="none"/>
        <ChampSaisie label="Mot de passe" valeur={formulaire.motDePasse} setValeur={val=>modifierChamp('motDePasse',val)} erreur={erreurs.motDePasse} securise/>

        <TouchableOpacity style={[globalStyles.loginBouton, chargement&&globalStyles.loginBoutonDesactive]} onPress={gererConnexion} disabled={chargement}>
          <Text style={globalStyles.loginTexteBouton}>{chargement?'Connexion en cours...':'Se connecter'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const ChampSaisie = ({ label, valeur, setValeur, erreur, clavier='default', autoCapitalize='sentences', securise=false }) => (
  <View style={globalStyles.loginGroupeInput}>
    <Text style={globalStyles.loginLabel}>{label}</Text>
    <TextInput style={[globalStyles.loginInput, erreur&&globalStyles.loginInputErreur]} placeholder={`Entrez ${label.toLowerCase()}`} value={valeur} onChangeText={setValeur} keyboardType={clavier} autoCapitalize={autoCapitalize} secureTextEntry={securise}/>
    {erreur&&<Text style={globalStyles.loginTexteErreur}>{erreur}</Text>}
  </View>
);
