import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, Modal, StatusBar, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NotificationContext } from '../Navigation';
import { globalStyles } from '../styles/styles';

export default function Entete({ titre, navigation, minimal = false, etudiantsNonAJour = [], cacherNotification = false, cacherRetour = false }) {
  const ouvrirTiroir = navigation?.openDrawer || navigation?.getParent()?.openDrawer;
  const afficherRetour = navigation?.canGoBack && !ouvrirTiroir;
  const [modalVisible, setModalVisible] = useState(false);
  const { notificationCount, actualNotificationCount } = useContext(NotificationContext);
  const nbEtudiants = notificationCount || 0;
  const paddingTop = Platform.OS === 'ios' ? 70 : StatusBar.currentHeight + 20;

  const actionBoutonGauche = () => afficherRetour ? navigation.goBack() : ouvrirTiroir?.();
  const fermerModal = () => setModalVisible(false);
  const allerListeNonAJour = () => { fermerModal(); navigation.navigate('Inscriptions', { activeTab: 'nonAJour' }); }

  const BoutonNotification = () => (
    <TouchableOpacity style={globalStyles.boutonNotification} onPress={() => setModalVisible(true)}>
      <Ionicons name="notifications-outline" size={24} color="#FFF" />
      {nbEtudiants === 1 && (
        <View style={globalStyles.badge}>
          <Text style={globalStyles.texteBadge}>1</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[globalStyles.headerContainer, { paddingTop }]}>
      <StatusBar barStyle="light-content" backgroundColor="#2c3e50" />
      <View style={globalStyles.headerEntete}>
        <TouchableOpacity onPress={actionBoutonGauche}>
          <Ionicons name={afficherRetour ? "arrow-back" : "menu"} size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={[globalStyles.headerTitre, { flex: 1, textAlign: 'center' }]}>{titre}</Text>
        {!minimal && !cacherNotification ? <BoutonNotification /> : <View style={{ width: 24 }} />}
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={fermerModal}>
        <View style={globalStyles.overlayModal}>
          <View style={globalStyles.contenuModal}>
            <View style={globalStyles.enteteModal}>
              <Text style={globalStyles.titreModal}>Notification</Text>
              <TouchableOpacity onPress={fermerModal}><Ionicons name="close" size={24} color="#333" /></TouchableOpacity>
            </View>
            <View style={globalStyles.contenuNotification}>
              <Text style={globalStyles.texteNotification}>
                {actualNotificationCount === 0
                  ? 'Tous vos étudiants sont à jour.'
                  : `Vous avez ${actualNotificationCount} étudiant${actualNotificationCount > 1 ? 's' : ''} non à jour.`}
              </Text>
              {actualNotificationCount > 0 && (
                <TouchableOpacity style={globalStyles.boutonVoirListe} onPress={allerListeNonAJour}>
                  <Text style={globalStyles.texteVoirListe}>Voir la liste</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}


