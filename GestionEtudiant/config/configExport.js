import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../services/api';

export const getExportConfig = async (format) => {
  const token = await AsyncStorage.getItem('token');
  const fileName = `etudiants.${format === 'excel' ? 'xlsx' : 'pdf'}`;
  const path = `/storage/emulated/0/Download/${fileName}`;
  const url = `${API_URL}/export/${format}`;

  const config = {
    fileCache: true,
    path,
    addAndroidDownloads: {
      useDownloadManager: true,
      notification: true,
      path,
      description: `Téléchargement du fichier ${fileName}`,
      mime: format === 'excel'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf',
      title: fileName,
      mediaScannable: true,
    },
  };

  const headers = { Authorization: `Bearer ${token}` };

  return { config, headers, url, fileName, path };
};
