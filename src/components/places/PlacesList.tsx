import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { AllPlacesNavigationProp } from '../../types/navigation';

import PlaceItem from './PlaceItem';
import { Place } from '../../models/place';
import { Spacing } from '../../constants/spacing';

interface PlacesListProps {
  places: Place[];
}

export default function PlacesList({ places }: PlacesListProps) {
  const navigation = useNavigation<AllPlacesNavigationProp>();
  const reversedPlaces = useMemo(() => [...places].reverse(), [places]);
  function selectPlaceHandler(id: string) {
    navigation.navigate('PlaceDetails', { placeId: id });
  }

  if (!places || places.length === 0) {
    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackText}>
          No places added yet - start adding some!
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      data={reversedPlaces}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <PlaceItem place={item} onSelect={selectPlaceHandler} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    margin: Spacing.xxl,
  },

  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  fallbackText: {
    fontSize: 16,
  },
});
