import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import PlacesList from '../components/Places/PlacesList';
import OutlinedButton from '../components/UI/OutlinedButton';
import { Colors } from '../constants/colors';
import { fetchPlaces } from '../util/database';
import { Place } from '../models/place';

export default function AllPlaces() {
  const [loadedPlaces, setLoadedPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadPlaces = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const places = await fetchPlaces();
      setLoadedPlaces(places);
    } catch {
      setErrorMessage('Could not load places. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPlaces();
    }, [loadPlaces]),
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary500} />
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{errorMessage}</Text>
        <OutlinedButton icon="refresh-outline" onPress={loadPlaces}>
          Retry
        </OutlinedButton>
      </View>
    );
  }

  return <PlacesList places={loadedPlaces} />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  errorText: {
    color: Colors.primary500,
    fontSize: 16,
    textAlign: 'center',
  },
});
