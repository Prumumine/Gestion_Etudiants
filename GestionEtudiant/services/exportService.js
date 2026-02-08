import ReactNativeBlobUtil from 'react-native-blob-util';
import { getExportConfig } from '../config/configExport';

export const exportStudentsFile = async (format) => {
  try {
    const { config, headers, url, fileName, path } = await getExportConfig(format);
    const res = await ReactNativeBlobUtil.config(config).fetch('GET', url, headers);
    return { success: true, path, fileName, downloadPath: res.path(), format };
  } catch (error) {
    return { success: false, error: error?.message || 'Erreur de téléchargement' };
  }
};
