import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { RootStackParamList } from '../types/navigation';

import OutlinedButton from '../components/ui/OutlinedButton';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { fetchPlaceDetails } from '../util/database';
import { Place } from '../models/place';

export default function PlaceDetails() {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'PlaceDetails'>
    >();
  const route = useRoute<RouteProp<RootStackParamList, 'PlaceDetails'>>();
  const { placeId } = route.params;
  const [fetchedPlace, setFetchedPlace] = useState<Place | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function showOnMapHandler() {
    if (!fetchedPlace) return;

    navigation.navigate('Map', {
      lat: fetchedPlace.location.lat.toString(),
      lng: fetchedPlace.location.lng.toString(),
      placeId,
    });
  }

  const loadPlaceData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const place = await fetchPlaceDetails(placeId);
      setFetchedPlace(place);
    } catch {
      setErrorMessage('Could not load place details. Please try again.');
      setFetchedPlace(undefined);
    } finally {
      setIsLoading(false);
    }
  }, [placeId]);

  useEffect(() => {
    loadPlaceData();
  }, [loadPlaceData]);

  useEffect(() => {
    navigation.setOptions({
      title: fetchedPlace ? fetchedPlace.title : 'Place Details',
    });
  }, [navigation, fetchedPlace]);

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
        <OutlinedButton icon="refresh-outline" onPress={loadPlaceData}>
          Retry
        </OutlinedButton>
      </View>
    );
  }

  if (!fetchedPlace) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Place not found.</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView>
        <Image style={styles.image} source={{ uri: fetchedPlace.imageUri }} />

        <View style={styles.locationContainer}>
          <View style={styles.addressContainer}>
            <Text style={styles.address}>{fetchedPlace.address}</Text>
          </View>

          <OutlinedButton icon="map-outline" onPress={showOnMapHandler}>
            View on Map
          </OutlinedButton>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
  },

  image: {
    height: '35%',
    minHeight: 300,
    width: '100%',
  },

  locationContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  addressContainer: {
    padding: Spacing.xl,
  },

  address: {
    color: Colors.primary500,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },

  errorText: {
    color: Colors.primary500,
    fontSize: 16,
    textAlign: 'center',
  },
});
