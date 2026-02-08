import React,{useState,useEffect,useContext,useMemo,useCallback} from 'react';
import {View,Text,StyleSheet,Image,TouchableOpacity,ScrollView,Alert,Modal,ActivityIndicator} from 'react-native';
import {useRoute,useFocusEffect} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { globalStyles } from '../styles/styles';
import api from '../services/api';
import {getImageEtudiant as obtenirImageEtudiant} from '../services/imageApi';
import Header from '../components/Header';
import {NotificationContext} from '../Navigation';

export default function DetailsEtudiant({etudiant:etudiantProp,onAnnuler,onEdit,navigation}){

const route=useRoute();
const {refreshNotificationCount}=useContext(NotificationContext);
const etudiantInitial=etudiantProp||route.params?.etudiant;

const [etudiant,setEtudiant]=useState(etudiantInitial||null);
const [chargement,setChargement]=useState(!etudiantInitial);
const [modalImage,setModalImage]=useState(false);

const chargerEtudiant=useCallback(async(silent=false)=>{
if(!etudiantInitial?.id)return;
try{
if(!silent && !etudiant)setChargement(true);
const res=await api.getEtudiant(etudiantInitial.id);
if(res.success)setEtudiant(res.data);
}catch{}
finally{
if(!silent)setChargement(false);
}
},[etudiantInitial?.id,etudiant]);

// Chargement initial uniquement si il n'y a pas déjà un étudiant fourni (pour éviter de recharger inutilement si on vient de la liste)
useEffect(()=>{ if(!etudiant) chargerEtudiant(); },[]);

// Refresh silencieux quand écran reprend le focus pour avoir les données à jour si on vient de modifier l'étudiant
useFocusEffect(
useCallback(()=>{
if(etudiant) chargerEtudiant(true);
},[etudiant])
);

const supprimerEtudiant=()=>{
Alert.alert('Supprimer',`Supprimer ${etudiant.nom} ?`,[
{text:'Annuler',style:'cancel'},
{text:'Supprimer',style:'destructive',onPress:async()=>{
try{
await api.deleteEtudiant(etudiant.id);
await refreshNotificationCount();
Alert.alert('Succès','Étudiant archivé',[{text:'OK',onPress:()=>onAnnuler?onAnnuler():navigation.goBack()}]);
}catch{Alert.alert('Erreur','Suppression échouée');}
}}]);
};

const avatarUrl=useMemo(()=>obtenirImageEtudiant(etudiant?.sexe,etudiant?.id),[etudiant]);
const statutOk=etudiant?.inscription==='À jour';

if(chargement)return<View style={globalStyles.detailsEtudiantCenter}><ActivityIndicator size="large" color="#007AFF"/></View>;
if(!etudiant)return null;

return(
<View style={globalStyles.detailsEtudiantContainer}>
<Header titre="Détails Étudiant" navigation={navigation} cacherNotification/>

<ScrollView style={globalStyles.detailsEtudiantScroll} contentContainerStyle={{paddingBottom:120}}>

<View style={globalStyles.detailsEtudiantCardRow}>
<TouchableOpacity onPress={()=>setModalImage(true)}>
<Image source={{uri:avatarUrl}} style={globalStyles.detailsEtudiantAvatar}/>
</TouchableOpacity>

<View style={{flex:1}}>
<Text style={globalStyles.detailsEtudiantNom}>{etudiant.prenom} {etudiant.nom}</Text>
</View>

<View style={[globalStyles.detailsEtudiantBadge,{backgroundColor:statutOk?'#d4edda':'#f8d7da'}]}>
<Text style={{color:statutOk?'#155724':'#721c24',fontWeight:'600'}}>{etudiant.inscription}</Text>
</View>
</View>

<View style={globalStyles.detailsEtudiantActions}>
<TouchableOpacity style={globalStyles.detailsEtudiantActionBtn} onPress={()=>onEdit?onEdit(etudiant):navigation.navigate('ModifierEtudiant',{etudiant})}>
<Ionicons name="create-outline" size={22} color="#007AFF"/>
<Text style={globalStyles.detailsEtudiantActionTxt}>Modifier</Text>
</TouchableOpacity>

<TouchableOpacity style={globalStyles.detailsEtudiantActionBtn} onPress={supprimerEtudiant}>
<Ionicons name="trash-outline" size={22} color="#FF3B30"/>
<Text style={globalStyles.detailsEtudiantActionTxt}>Supprimer</Text>
</TouchableOpacity>
</View>

<InfoSection titre="Informations personnelles" data={[
['Âge',etudiant.age],
['Sexe',etudiant.sexe==='M'?'Homme':'Femme'],
['Téléphone',etudiant.telephone],
['Nationalité',etudiant.nationalite]
]}/>

<InfoSection titre="Informations académiques" data={[
['Filière',etudiant.filiere],
['Niveau',etudiant.niveau],
['Scolarité',etudiant.inscription]
]}/>

</ScrollView>

<View style={globalStyles.detailsEtudiantFooter}>
<TouchableOpacity style={globalStyles.detailsEtudiantBackBtn} onPress={()=>onAnnuler?onAnnuler():navigation.goBack()}>
<Text style={globalStyles.detailsEtudiantBackTxt}>Retour</Text>
</TouchableOpacity>
</View>

<Modal visible={modalImage} transparent animationType="fade" onRequestClose={()=>setModalImage(false)}>
<View style={globalStyles.detailsEtudiantModalBg}>
<TouchableOpacity style={globalStyles.detailsEtudiantModalCloseZone} onPress={()=>setModalImage(false)}>
<View style={globalStyles.detailsEtudiantModalContent}>
<TouchableOpacity style={globalStyles.detailsEtudiantModalCloseBtn} onPress={()=>setModalImage(false)}>
<Ionicons name="close" size={24} color="#FFF" />
</TouchableOpacity>
<Image source={{uri:avatarUrl}} style={globalStyles.detailsEtudiantBigAvatar}/>
</View>
</TouchableOpacity>
</View>
</Modal>

</View>);
}

const InfoSection=({titre,data})=>(
<View style={globalStyles.detailsEtudiantSection}>
<Text style={globalStyles.detailsEtudiantSectionTitle}>{titre}</Text>
{data.map(([label,val],i)=>(
<View key={i} style={globalStyles.detailsEtudiantRow}>
<Text style={globalStyles.detailsEtudiantLabel}>{label}:</Text>
<Text style={globalStyles.detailsEtudiantValue}>{val}</Text>
</View>
))}
</View>
);


