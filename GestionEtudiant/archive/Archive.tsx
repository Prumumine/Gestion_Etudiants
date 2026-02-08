import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { getArchive, restoreEtudiant } from '../services/api';

const Archive = () => {
  const [archive, setArchive] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArchive = async () => {
    setLoading(true);
    try {
      const res = await getArchive();
      setArchive(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchive();
  }, []);

  const handleRestore = (id: number) => {
    Alert.alert('Confirmation', 'Voulez-vous restaurer cet étudiant ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Restaurer',
        onPress: async () => {
          try {
            await restoreEtudiant(id);
            fetchArchive();
          } catch (error) {
            console.log(error);
          }
        },
      },
    ]);
  };

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Étudiants archivés</Text>
      <FlatList
        data={archive}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.nom}</Text>
            <Button title="Restaurer" onPress={() => handleRestore(item.id)} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  item: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee' },
});

export default Archive;
