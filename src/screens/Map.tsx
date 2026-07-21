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

import { RootStackParamList } from '../types/navigation';

import IconButton from '../components/ui/IconButton';
import LocationMarker from '../components/ui/LocationMarker';
import MarkerGenerator from '../components/ui/MarkerGenerator';
import { useMarkerImage } from '../hooks/useMarkerImage';
import { usePlaceDetails } from '../hooks/usePlaceDetails';
import { usePickedLocationContext } from '../store/picked-location-context';
import { ALERT_MESSAGES } from '../constants/alertMessages';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { logAppError, showUserErrorAlert } from '../util/errors';
import {
  getMapboxUnavailableReason,
  isMapboxAvailable,
} from '../util/mapbox';

const DEFAULT_CENTER: [number, number] = [-122.4324, 37.78825];

function renderSaveLocationHeaderButton(
  tintColor: string | undefined,
  onPress: () => void,
) {
  return (
    <IconButton
      icon="save-outline"
      size={24}
      color={tintColor}
      onPress={onPress}
    />
  );
}

export default function Map() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'Map'>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Map'>>();
  const { lat, lng, placeId } = route.params ?? {};

  const initialLocation = useMemo(
    () => (lat && lng ? { lat: +lat, lng: +lng } : undefined),
    [lat, lng],
  );

  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [markerCaptureFailed, setMarkerCaptureFailed] = useState(false);
  const [isMapMounted, setIsMapMounted] = useState(Platform.OS !== 'android');
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [hasMapLoadTimedOut, setHasMapLoadTimedOut] = useState(false);
  const [mapRenderKey, setMapRenderKey] = useState(0);
  const mountDelayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readyDelayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { setPickedMapLocation } = usePickedLocationContext();
  const mapFeatureAvailable = isMapboxAvailable();

  const { place: markerPlace, errorMessage: placeErrorMessage } =
    usePlaceDetails(placeId, { autoLoad: !!placeId });

  const markMapAsReady = useCallback(() => {
    // Clear any pending ready timer
    if (readyDelayTimerRef.current) {
      clearTimeout(readyDelayTimerRef.current);
    }

    // Wait 1 second for map to fully render before hiding loader
    readyDelayTimerRef.current = setTimeout(() => {
      setIsMapLoaded(true);
      setHasMapLoadTimedOut(false);

      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }

      readyDelayTimerRef.current = null;
    }, 1000);
  }, []);

  useEffect(() => {
    if (!markerPlace?.imageUri) {
      return;
    }

    setImageUri(markerPlace.imageUri);
  }, [markerPlace?.imageUri]);

  useEffect(() => {
    if (!placeErrorMessage || !placeId) {
      return;
    }

    setMarkerCaptureFailed(true);
    logAppError('map.markerImage', placeErrorMessage, { placeId });
    showUserErrorAlert('map.markerImage', 'Marker Image Unavailable');
  }, [placeErrorMessage, placeId]);

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
      Alert.alert(ALERT_MESSAGES.mapScreen.noLocationPicked);
      return;
    }

    setPickedMapLocation(selectedLocation);
    navigation.goBack();
  }, [selectedLocation, navigation, setPickedMapLocation]);

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

      if (readyDelayTimerRef.current) {
        clearTimeout(readyDelayTimerRef.current);
        readyDelayTimerRef.current = null;
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
        mapFeatureAvailable && selectedLocation && !initialLocation
          ? renderSaveLocationHeaderButton(tintColor, savePickedLocationHandler)
          : null,
    });
  }, [
    mapFeatureAvailable,
    navigation,
    selectedLocation,
    initialLocation,
    savePickedLocationHandler,
  ]);

  if (!mapFeatureAvailable) {
    return (
      <View style={styles.mapUnavailableContainer}>
        <Text style={styles.mapUnavailableTitle}>Map Unavailable</Text>
        <Text style={styles.mapUnavailableText}>
          {getMapboxUnavailableReason()}
        </Text>
      </View>
    );
  }

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
            surfaceView={Platform.OS === 'android'}
            onPress={selectLocationHandler}
            onDidFinishLoadingMap={markMapAsReady}
            onMapIdle={Platform.OS === 'android' ? markMapAsReady : undefined}
          >
            <Mapbox.Camera
              centerCoordinate={initialCoordinate}
              zoomLevel={14}
              animationMode="flyTo"
              animationDuration={1000}
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
    marginTop: Spacing.lg,
    color: Colors.primary500,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: Spacing.xxl,
  },

  retryButton: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
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

  mapUnavailableContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    backgroundColor: Colors.primary50,
  },

  mapUnavailableTitle: {
    color: Colors.primary500,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },

  mapUnavailableText: {
    color: Colors.gray700,
    fontSize: 16,
    textAlign: 'center',
  },
});
