import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { globalStyles } from '../styles/styles';

export const ChampFormulaire = ({ champ, valeur, onChange, erreurs, focus, onFocus, onBlur, configChamps }) => {
  const config = configChamps[champ];
  if (!config) return null;

  const aErreur = erreurs && erreurs[champ];
  const estFocus = focus === champ;

  if (config.type === 'selection') {
    return (
      <View style={globalStyles.groupeFormulaire}>
        <Text style={globalStyles.libelle}>{config.libelle}</Text>
        <View style={[globalStyles.conteneurPicker, aErreur && globalStyles.saisieErreur]}>
          <Picker
            selectedValue={valeur}
            onValueChange={(valeurItem) => onChange(champ, valeurItem)}
          >
            {config.options.map((option, index) => (
              <Picker.Item key={index} label={option.libelle} value={option.valeur} />
            ))}
          </Picker>
        </View>
        {aErreur && <Text style={globalStyles.texteErreur}>{aErreur}</Text>}
      </View>
    );
  }

  return (
    <View style={globalStyles.groupeFormulaire}>
      <Text style={globalStyles.libelle}>{config.libelle}</Text>
      <TextInput
        style={[
          globalStyles.saisie,
          aErreur && globalStyles.saisieErreur,
          estFocus && globalStyles.saisieFocus
        ]}
        value={valeur}
        onChangeText={(texte) => onChange(champ, texte)}
        keyboardType={config.type === 'numerique' ? 'numeric' : 'default'}
        onFocus={() => onFocus && onFocus(champ)}
        onBlur={() => onBlur && onBlur()}
      />
      {aErreur && <Text style={globalStyles.texteErreur}>{aErreur}</Text>}
    </View>
  );
};


