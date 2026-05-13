import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import Geolocation from 'react-native-geolocation-service';
import {
  Alert,
  Image,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import OutlinedButton from '../UI/OutlinedButton';
import { sharedPickerStyles } from '../../constants/sharedStyles';
import { consumePickedMapLocation } from '../../store/picked-location-store';
import { Location } from '../../types';
import { getAddress, getMapPreview } from '../../util/location';
import { openAppSettings, showOpenSettingsAlert } from '../../util/permissions';
import { RootStackParamList } from '../../types/navigation';

interface LocationPickerProps {
  onPickLocation: (location: Location) => void;
  pickedLocation: Location | undefined;
}

export default function LocationPicker({
  onPickLocation,
  pickedLocation,
}: LocationPickerProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

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
        } catch {
          Alert.alert(
            'Geocoding Failed',
            'Could not retrieve the address for the selected location.',
          );
          return;
        }

        onPickLocation({ ...mapPickedLocation, address });
      }

      storePickedLocation();
    }, [onPickLocation]),
  );

  async function verifiedPermissions(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      const status = await Geolocation.requestAuthorization('whenInUse');
      if (status === 'granted') {
        return true;
      }

      showOpenSettingsAlert(
        'Please enable location access in Settings to continue.',
      );
      return false;
    }

    const finePermission = PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;
    const coarsePermission =
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION;

    const alreadyHasFine = await PermissionsAndroid.check(finePermission);
    const alreadyHasCoarse = await PermissionsAndroid.check(coarsePermission);

    if (alreadyHasFine || alreadyHasCoarse) {
      return true;
    }

    const granted = await PermissionsAndroid.requestMultiple([
      finePermission,
      coarsePermission,
    ]);

    const fineResult = granted[finePermission];
    const coarseResult = granted[coarsePermission];

    if (
      fineResult === PermissionsAndroid.RESULTS.GRANTED ||
      coarseResult === PermissionsAndroid.RESULTS.GRANTED
    ) {
      return true;
    }

    showOpenSettingsAlert(
      'Please enable location access in Settings to continue.',
    );
    return false;
  }

  async function getLocationHandler(): Promise<void> {
    setIsLoadingLocation(true);
    try {
      const hasPermission = await verifiedPermissions();

      if (!hasPermission) {
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
      } catch {
        Alert.alert(
          'Location Unavailable',
          'Could not fetch your location. Make sure location services are enabled on your device.',
        );
        return;
      }

      const currentLocation = {
        lat: location.latitude,
        lng: location.longitude,
      };

      let address: string;

      try {
        address = await getAddress(currentLocation.lat, currentLocation.lng);
      } catch {
        Alert.alert(
          'Geocoding Failed',
          'Could not retrieve the address for your location.',
        );
        return;
      }

      onPickLocation({ ...currentLocation, address });
    } finally {
      setIsLoadingLocation(false);
    }
  }

  function pickOnMapHandler(): void {
    navigation.navigate('Map');
  }

  let locationPreview = <Text>No location picked yet.</Text>;

  if (isLoadingLocation) {
    locationPreview = <Text>Loading location...</Text>;
  } else if (pickedLocation) {
    locationPreview = (
      <Image
        style={styles.mapImage}
        source={{
          uri: getMapPreview(pickedLocation.lat, pickedLocation.lng),
        }}
      />
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
        >
          Locate User
        </OutlinedButton>

        <OutlinedButton icon="map-outline" onPress={pickOnMapHandler}>
          Pick on Map
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
});
