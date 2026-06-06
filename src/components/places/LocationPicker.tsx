import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import Geolocation from 'react-native-geolocation-service';
import {
  ActivityIndicator,
  Alert,
  Image,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import OutlinedButton from '../ui/OutlinedButton';
import { sharedPickerStyles } from '../../constants/sharedStyles';
import { Spacing } from '../../constants/spacing';
import { usePermission } from '../../hooks/usePermission';
import { usePickedLocationContext } from '../../store/picked-location-context';
import { Location } from '../../types';
import { logAppError, showUserErrorAlert } from '../../util/errors';
import { getAddress, getMapPreview } from '../../util/location';
import {
  getMapboxUnavailableReason,
  isMapboxAvailable,
} from '../../util/mapbox';
import { openAppSettings } from '../../util/permissions';
import { RootStackParamList } from '../../types/navigation';

interface LocationPickerProps {
  onPickLocation: (location: Location) => void;
  pickedLocation: Location | undefined;
}

export default function LocationPicker({
  onPickLocation,
  pickedLocation,
}: LocationPickerProps) {
  const { consumePickedMapLocation } = usePickedLocationContext();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const mapFeatureAvailable = isMapboxAvailable();
  const { request: requestLocationPermission } = usePermission({
    resource: 'location',
    settingsMessage: 'Please enable location access in Settings to continue.',
  });

  useFocusEffect(
    useCallback(() => {
      async function storePickedLocation() {
        const mapPickedLocation = consumePickedMapLocation();

        if (!mapPickedLocation) {
          return;
        }

        let address: string;

        try {
          address = await getAddress(
            mapPickedLocation.lat,
            mapPickedLocation.lng,
          );
        } catch (error) {
          logAppError('location.mapPickGeocoding', error, {
            lat: mapPickedLocation.lat,
            lng: mapPickedLocation.lng,
          });
          showUserErrorAlert(
            'location.mapPickGeocoding',
            'Geocoding Failed',
          );
          return;
        }

        onPickLocation({ ...mapPickedLocation, address });
      }

      storePickedLocation();
    }, [consumePickedMapLocation, onPickLocation]),
  );

  async function getLocationHandler(): Promise<void> {
    setIsLoadingLocation(true);
    try {
      const permissionStatus = await requestLocationPermission();
      if (permissionStatus !== 'granted') {
        return;
      }

      const hasFineOnAndroid =
        Platform.OS === 'android'
          ? await PermissionsAndroid.check(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            )
          : true;

      if (Platform.OS === 'android' && !hasFineOnAndroid) {
        Alert.alert(
          'Approximate Location Active',
          'Your device is currently sharing approximate location. Use Pick on Map, or enable Precise Location in Settings for Locate User.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Pick on Map', onPress: pickOnMapHandler },
            { text: 'Open Settings', onPress: openAppSettings },
          ],
        );
        return;
      }

      let location: { latitude: number; longitude: number };

      try {
        location = await new Promise((resolve, reject) => {
          Geolocation.getCurrentPosition(
            position => {
              resolve(position.coords);
            },
            reject,
            {
              enableHighAccuracy: hasFineOnAndroid,
              timeout: 15000,
              maximumAge: 10000,
            },
          );
        });
      } catch (error) {
        logAppError('location.currentPosition', error);
        showUserErrorAlert('location.currentPosition', 'Location Unavailable');
        return;
      }

      const currentLocation = {
        lat: location.latitude,
        lng: location.longitude,
      };

      let address: string;

      try {
        address = await getAddress(currentLocation.lat, currentLocation.lng);
      } catch (error) {
        logAppError('location.currentGeocoding', error, currentLocation);
        showUserErrorAlert('location.currentGeocoding', 'Geocoding Failed');
        return;
      }

      onPickLocation({ ...currentLocation, address });
    } finally {
      setIsLoadingLocation(false);
    }
  }

  function pickOnMapHandler(): void {
    if (!mapFeatureAvailable) {
      Alert.alert('Map Unavailable', getMapboxUnavailableReason());
      return;
    }

    navigation.navigate('Map');
  }

  const mapPreviewUri = pickedLocation
    ? getMapPreview(pickedLocation.lat, pickedLocation.lng)
    : null;

  let locationPreview = (
    <Text style={sharedPickerStyles.statusText}>No location picked yet.</Text>
  );

  if (isLoadingLocation) {
    locationPreview = (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1c7ed6" />
        <Text style={sharedPickerStyles.statusText}>Fetching location...</Text>
      </View>
    );
  } else if (pickedLocation && mapPreviewUri) {
    locationPreview = (
      <Image
        style={styles.mapImage}
        source={{
          uri: mapPreviewUri,
        }}
      />
    );
  } else if (pickedLocation) {
    locationPreview = (
      <Text style={sharedPickerStyles.statusText}>
        {getMapboxUnavailableReason()}
      </Text>
    );
  }

  return (
    <View>
      <View style={sharedPickerStyles.preview}>{locationPreview}</View>
      <View style={sharedPickerStyles.actions}>
        <OutlinedButton
          icon="location-outline"
          onPress={getLocationHandler}
          disabled={isLoadingLocation}
          showSpinnerWhenDisabled={false}
        >
          {isLoadingLocation ? 'Locating...' : 'Locate User'}
        </OutlinedButton>

        <OutlinedButton
          icon="map-outline"
          onPress={pickOnMapHandler}
          disabled={!mapFeatureAvailable}
          showSpinnerWhenDisabled={false}
        >
          {mapFeatureAvailable ? 'Pick on Map' : 'Map Unavailable'}
        </OutlinedButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
  },
});
