import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Header from '../components/Header';
import { globalStyles } from '../styles/styles';

const SETTINGS = [
  { key: 'about', label: 'À propos', icon: 'information-circle-outline', type: 'button' },
  { key: 'help', label: 'Aide', icon: 'help-circle-outline', type: 'button' }
];

export default function Parametres({ navigation }) {
  const [modalContent, setModalContent] = useState(null);
  const openModal = type=>setModalContent(type);
  const closeModal = ()=>setModalContent(null);

  const renderModalContent = ()=>{
    if(!modalContent) return null;
    const content = modalContent==='about' ? {
      title:'À propos',
      text:'Gestion Étudiant\nVersion 1.0.0\nUne application intuitive pour organiser et suivre vos étudiants ainsi que leurs inscriptions.'
    } : {
      title:'Aide',
      text:'• Étudiants : Ajouter (+), modifier, rechercher\n• Exporter : Téléchargez vos données\n• Tableau de bord : Statistiques et informations\n• Paramètres : Aide et information sur l\'application'
    };
    return (
      <Modal visible transparent animationType="slide" onRequestClose={closeModal}>
        <View style={globalStyles.parametresModalContainer}>
          <View style={globalStyles.parametresModalContent}>
            <View style={globalStyles.parametresModalHeader}>
              <Text style={globalStyles.parametresModalTitle}>{content.title}</Text>
              <TouchableOpacity onPress={closeModal}><Ionicons name="close" size={24} color="#333"/></TouchableOpacity>
            </View>
            <ScrollView><Text style={globalStyles.parametresModalText}>{content.text}</Text></ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const renderSetting = s=>(
    <TouchableOpacity key={s.key} style={globalStyles.parametresSettingButton} onPress={()=>openModal(s.key)}>
      <View style={globalStyles.parametresSettingInfo}><Ionicons name={s.icon} size={24} color="#555"/><Text style={globalStyles.parametresSettingText}>{s.label}</Text></View>
      <Ionicons name="chevron-forward" size={20} color="#999"/>
    </TouchableOpacity>
  );

  return (
    <View style={globalStyles.parametresContainer}>
      <Header titre="Paramètres" navigation={navigation} minimal/>
      <View style={globalStyles.parametresContent}>
        <Text style={globalStyles.parametresTitle}>Paramètres généraux</Text>
        {SETTINGS.map(renderSetting)}
        <View style={globalStyles.parametresVersion}><Text style={globalStyles.parametresVersionText}>Version 1.0.0</Text></View>
      </View>
      {renderModalContent()}
    </View>
  );
}


