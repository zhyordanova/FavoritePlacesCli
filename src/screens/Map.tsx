import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Mapbox, { type ScreenPointPayload } from '@rnmapbox/maps';
import Config from 'react-native-config';

import { RootStackParamList } from '../types/navigation';

import IconButton from '../components/UI/IconButton';
import LocationMarker from '../components/UI/LocationMarker';
import MarkerGenerator from '../components/UI/MarkerGenerator';
import { useMarkerImage } from '../hooks/useMarkerImage';
import { setPickedMapLocation } from '../store/picked-location-store';
import { fetchPlaceDetails } from '../util/database';
import { Colors } from '../constants/colors';

const MAPBOX_ACCESS_TOKEN: string | null = Config.MAPBOX_ACCESS_TOKEN ?? null;

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

const DEFAULT_CENTER: [number, number] = [-122.4324, 37.78825];

export default function Map() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'Map'>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Map'>>();
  const { lat, lng, placeId } = route.params ?? {};

  const initialLocation = lat && lng ? { lat: +lat, lng: +lng } : undefined;

  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [markerCaptureFailed, setMarkerCaptureFailed] = useState(false);
  const [isMapMounted, setIsMapMounted] = useState(Platform.OS !== 'android');
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [hasMapLoadTimedOut, setHasMapLoadTimedOut] = useState(false);
  const [mapRenderKey, setMapRenderKey] = useState(0);
  const mountDelayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!placeId) return;

    fetchPlaceDetails(placeId)
      .then(place => {
        if (!place?.imageUri) return;
        setImageUri(place.imageUri);
      })
      .catch(() => {
        setMarkerCaptureFailed(true);
        Alert.alert(
          'Marker Image Unavailable',
          'Could not load the place image for the map marker.',
        );
      });
  }, [placeId]);

  useEffect(() => {
    setMarkerCaptureFailed(false);
  }, [imageUri, placeId]);

  const { markerImage, setMarkerImage, shouldGenerate } = useMarkerImage({
    imageUri,
    enabled: !!selectedLocation,
  });

  const initialCoordinate = useMemo<[number, number]>(
    () =>
      initialLocation
        ? [initialLocation.lng, initialLocation.lat]
        : DEFAULT_CENTER,
    [initialLocation],
  );

  const selectedCoordinate = selectedLocation
    ? ([selectedLocation.lng, selectedLocation.lat] as [number, number])
    : undefined;

  const shouldRenderMarker =
    !!selectedCoordinate && (!placeId || !!markerImage || markerCaptureFailed);

  function selectLocationHandler(
    event: GeoJSON.Feature<GeoJSON.Point, ScreenPointPayload>,
  ) {
    if (initialLocation) return;

    const [longitude, latitude] = event.geometry.coordinates;
    setSelectedLocation({ lat: latitude, lng: longitude });
  }

  const savePickedLocationHandler = useCallback(() => {
    if (!selectedLocation) {
      Alert.alert('No location picked!');
      return;
    }

    setPickedMapLocation(selectedLocation);
    navigation.goBack();
  }, [selectedLocation, navigation]);

  const markerGeneratedHandler = useCallback(
    (uri: string) => {
      setMarkerCaptureFailed(false);
      setMarkerImage(uri);
    },
    [setMarkerImage],
  );

  const markerGenerationFailedHandler = useCallback(() => {
    setMarkerCaptureFailed(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') {
        return () => {};
      }

      setIsMapMounted(false);
      setIsMapLoaded(false);
      setHasMapLoadTimedOut(false);
      setMapRenderKey(prev => prev + 1);

      mountDelayTimerRef.current = setTimeout(() => {
        setIsMapMounted(true);
      }, 350);

      return () => {
        if (mountDelayTimerRef.current) {
          clearTimeout(mountDelayTimerRef.current);
          mountDelayTimerRef.current = null;
        }

        setIsMapMounted(false);
        setIsMapLoaded(false);
        setHasMapLoadTimedOut(false);
      };
    }, []),
  );

  useEffect(() => {
    if (!isMapMounted) return;

    setIsMapLoaded(false);
    setHasMapLoadTimedOut(false);

    // Keep loading UI visible until map is fully loaded. If this times out,
    // show a retry action instead of revealing a blank blue map.
    loadTimeoutRef.current = setTimeout(() => {
      setHasMapLoadTimedOut(true);
      loadTimeoutRef.current = null;
    }, 6000);

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
    };
  }, [isMapMounted]);

  function retryMapLoadHandler() {
    setHasMapLoadTimedOut(false);
    setIsMapLoaded(false);
    setMapRenderKey(prev => prev + 1);
  }

  useEffect(() => {
    navigation.setOptions({
      title: 'Map',
      headerRight: ({ tintColor }) =>
        selectedLocation && !initialLocation ? (
          <IconButton
            icon="save-outline"
            size={24}
            color={tintColor}
            onClick={savePickedLocationHandler}
          />
        ) : null,
    });
  }, [
    navigation,
    selectedLocation,
    initialLocation,
    savePickedLocationHandler,
  ]);

  return (
    <>
      {shouldGenerate && imageUri && (
        <MarkerGenerator
          key={placeId ?? 'marker-generator'}
          imageUri={imageUri}
          onGenerated={markerGeneratedHandler}
          onFailed={markerGenerationFailedHandler}
        />
      )}

      {isMapMounted ? (
        <>
          <Mapbox.MapView
            key={mapRenderKey}
            style={styles.map}
            styleURL={Mapbox.StyleURL.Street}
            surfaceView={false}
            onPress={selectLocationHandler}
            onDidFinishLoadingMap={() => {
              setIsMapLoaded(true);
              setHasMapLoadTimedOut(false);
              if (loadTimeoutRef.current) {
                clearTimeout(loadTimeoutRef.current);
                loadTimeoutRef.current = null;
              }
            }}
          >
            <Mapbox.Camera
              defaultSettings={{
                centerCoordinate: initialCoordinate,
                zoomLevel: 14,
              }}
            />

            {shouldRenderMarker && selectedCoordinate && (
              <LocationMarker
                coordinate={selectedCoordinate}
                imageUri={markerImage ?? undefined}
              />
            )}
          </Mapbox.MapView>

          {!isMapLoaded && (
            <View style={[styles.mapLoadingContainer, StyleSheet.absoluteFill]}>
              <ActivityIndicator size="large" color="#1c7ed6" />
              {hasMapLoadTimedOut && (
                <>
                  <Text style={styles.mapLoadingText}>
                    Map is taking longer than expected to load.
                  </Text>
                  <Pressable
                    style={({ pressed }) => [
                      styles.retryButton,
                      pressed && styles.retryPressed,
                    ]}
                    onPress={retryMapLoadHandler}
                  >
                    <Text style={styles.retryButtonText}>Retry Map</Text>
                  </Pressable>
                </>
              )}
            </View>
          )}
        </>
      ) : (
        <View style={styles.mapLoadingContainer}>
          <ActivityIndicator size="large" color="#1c7ed6" />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },

  mapLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#dff3fb',
  },

  mapLoadingText: {
    marginTop: 12,
    color: Colors.primary500,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
  },

  retryButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary500,
    backgroundColor: Colors.primary50,
  },

  retryPressed: {
    opacity: 0.75,
  },

  retryButtonText: {
    color: Colors.primary500,
    fontWeight: '600',
  },
});
