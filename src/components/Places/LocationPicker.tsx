import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback } from 'react';
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
import { Colors } from '../../constants/colors';
import { consumePickedMapLocation } from '../../store/picked-location-store';
import { Location } from '../../types';
import { getAddress, getMapPreview } from '../../util/location';
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

      Alert.alert(
        'Insufficient Permissions!',
        'You need to grant location permissions to use this app.',
      );
      return false;
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'This app needs access to your location.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    }

    Alert.alert(
      'Insufficient Permissions!',
      'You need to grant location permissions to use this app.',
    );
    return false;
  }

  async function getLocationHandler(): Promise<void> {
    const hasPermission = await verifiedPermissions();

    if (!hasPermission) {
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
            enableHighAccuracy: true,
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
  }

  function pickOnMapHandler(): void {
    navigation.navigate('Map');
  }

  let locationPreview = <Text>No location picked yet.</Text>;

  if (pickedLocation) {
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
      <View style={styles.mapPreview}>{locationPreview}</View>
      <View style={styles.actions}>
        <OutlinedButton icon="location-outline" onPress={getLocationHandler}>
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
  mapPreview: {
    height: 200,
    marginVertical: 12,
    marginHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: Colors.primary100,
    borderColor: Colors.primary500,
    borderWidth: 2,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  mapImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
});
