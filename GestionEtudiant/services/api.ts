import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_URL = 'http://10.0.2.2:3000/api';
const api = axios.create({ baseURL: API_URL });

// Ajouter le token de l'utiisateur automatiquement
api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Gestion des erreurs
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      AsyncStorage.removeItem('token');    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export default {
  // Authentification
  connexion: (data) => api.post('/auth/connexion', data),
  
  // Profil
  getProfil: () => api.get('/profil'),
  updateProfil: (data) => api.put('/profil', data),
  changePassword: (data) => api.put('/profil/password', data),
  
  // Étudiants
  getEtudiants: () => api.get('/etudiants'),
  getEtudiant: (id) => api.get(`/etudiants/${id}`),
  createEtudiant: (data) => api.post('/etudiants', data),
  updateEtudiant: (id, data) => api.put(`/etudiants/${id}`, data),
  deleteEtudiant: (id) => api.delete(`/etudiants/${id}`),
  
  // Archive
  getArchive: () => api.get('/archive'),
  restoreEtudiant: (id) => api.put(`/archive/${id}/restore`),
  
  // Historique
  getHistorique: () => api.get('/historique'),
  
  // Export
  exportExcel: () => api.get('/export/excel', { responseType: 'blob' }),
  exportPDF: () => api.get('/export/pdf', { responseType: 'blob' }),

  // Image generation
  generateImage: (sexe) => api.get(`/generate-image/${sexe}`),
};
