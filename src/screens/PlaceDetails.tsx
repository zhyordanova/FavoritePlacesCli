import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import Analytics from 'appcenter-analytics';

import { RootStackParamList } from '../types/navigation';

import ScreenErrorState from '../components/ui/ScreenErrorState';
import ScreenLoadingState from '../components/ui/ScreenLoadingState';
import OutlinedButton from '../components/ui/OutlinedButton';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { usePlaceDetails } from '../hooks/usePlaceDetails';

export default function PlaceDetails() {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'PlaceDetails'>
    >();
  const route = useRoute<RouteProp<RootStackParamList, 'PlaceDetails'>>();
  const { placeId } = route.params;
  const {
    place: fetchedPlace,
    isLoading,
    errorMessage,
    reload: loadPlaceData,
  } = usePlaceDetails(placeId);

  function showOnMapHandler() {
    if (!fetchedPlace) return;

    navigation.navigate('Map', {
      lat: fetchedPlace.location.lat.toString(),
      lng: fetchedPlace.location.lng.toString(),
      placeId,
    });
  }

  useEffect(() => {
    navigation.setOptions({
      title: fetchedPlace ? fetchedPlace.title : 'Place Details',
    });

    if (fetchedPlace) {
      Analytics.trackEvent('place_details_viewed', {
        placeTitle: fetchedPlace.title,
        latitude: String(fetchedPlace.location.lat),
        longitude: String(fetchedPlace.location.lng),
        imageAvailable: String(!!fetchedPlace.imageUri),
      });
    }
  }, [navigation, fetchedPlace]);

  if (isLoading) {
    return <ScreenLoadingState />;
  }

  if (errorMessage) {
    return <ScreenErrorState message={errorMessage} onRetry={loadPlaceData} />;
  }

  if (!fetchedPlace) {
    return <ScreenErrorState message="Place not found." />;
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
});
