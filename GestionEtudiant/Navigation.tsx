import React, { useState, useEffect, createContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from './services/api';

export const NotificationContext = createContext({ notificationCount: 0, actualNotificationCount: 0, refreshNotificationCount: async () => {} });

import Connexion from './screens/Connexion';
import Accueil from './screens/Accueil';
import Etudiants from './screens/Etudiants';
import FormulaireEtudiant from './screens/FormulaireEtudiant';
import DetailsEtudiant from './screens/DetailsEtudiant';
import ModifierEtudiant from './screens/ModifierEtudiant';
import Historique from './screens/Historique';
import Inscriptions from './screens/Inscriptions';
import Archive from './screens/Archive';
import Profil from './screens/Profil';
import ChangerMotDePasse from './screens/Changermotdepasse';
import Parametres from './screens/Parametres';
import DrawerDesign from './components/DrawerDesign';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const onglets = [
  { nom: 'Accueil', composant: Accueil, icone: 'home' },
  { nom: 'Étudiants', composant: Etudiants, icone: 'people' },
  { nom: 'Inscriptions', composant: Inscriptions, icone: 'school' }
];

function NavigateurOnglets() {
  return (
    <Tab.Navigator initialRouteName="Accueil" screenOptions={({ route }) => {
      const onglet = onglets.find(o => o.nom === route.name);
      return {
        tabBarIcon: ({ focused, color, size }) => <Ionicons name={focused ? onglet.icone : `${onglet.icone}-outline`} size={size} color={color} />,
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: 'gray',
        headerShown: false
      };
    }}>
      {onglets.map(o => <Tab.Screen key={o.nom} name={o.nom} component={o.composant} />)}
    </Tab.Navigator>
  );
}

function NavigateurDrawer() {
  return (
    <Drawer.Navigator drawerContent={props => <DrawerDesign {...props} />} screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="Onglets" component={NavigateurOnglets} />
    </Drawer.Navigator>
  );
}

export default function Navigation() {
  const [etat, setEtat] = useState({ connecté: false, chargement: true, notificationCount: 0, actualNotificationCount: 0, token: null as string | null });

  useEffect(() => {
    AsyncStorage.getItem('token')
      .then(token => {
        setEtat(prev => ({ ...prev, connecté: !!token, chargement: false, token }));
      })
      .catch(() => setEtat(prev => ({ ...prev, connecté: false, chargement: false, token: null })));
  }, []);

  useEffect(() => {
    if (etat.token) {
      chargerNotificationCount();
    }
  }, [etat.token]);

  const chargerNotificationCount = async () => {
    try {
      const res = await api.getEtudiants();
      if (res.success) {
        const count = (res.data || []).filter(e => ['Non à jour','Non a jour'].includes(e.inscription)).length;
        setEtat(prev => ({ ...prev, notificationCount: count > 0 ? 1 : 0, actualNotificationCount: count }));
      }
    } catch (err) { console.error('Erreur chargement notifications', err); }
  };

  if (etat.chargement) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#3498db" /></View>;

  const ecrans = [
    { nom: 'Connexion', composant: Connexion },
    { nom: 'Main', composant: NavigateurDrawer },
    { nom: 'Profil', composant: Profil },
    { nom: 'ChangerMotDePasse', composant: ChangerMotDePasse },
    { nom: 'FormulaireEtudiant', composant: FormulaireEtudiant },
    { nom: 'DetailsEtudiant', composant: DetailsEtudiant },
    { nom: 'ModifierEtudiant', composant: ModifierEtudiant },
    { nom: 'Historique', composant: Historique },
    { nom: 'Archive', composant: Archive },
    { nom: 'Paramètres', composant: Parametres }
  ];

  return (
    <NotificationContext.Provider value={{ notificationCount: etat.notificationCount, actualNotificationCount: etat.actualNotificationCount, refreshNotificationCount: chargerNotificationCount }}>
      <Stack.Navigator initialRouteName={etat.connecté ? 'Main' : 'Connexion'} screenOptions={{ headerShown: false }}>
        {ecrans.map(e => <Stack.Screen key={e.nom} name={e.nom} component={e.composant} />)}
      </Stack.Navigator>
    </NotificationContext.Provider>
  );
}
