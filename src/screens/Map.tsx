import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import Mapbox, { type ScreenPointPayload } from "@rnmapbox/maps";
import Config from "react-native-config";

import { RootStackParamList } from "../types/navigation";

import IconButton from "../components/UI/IconButton";
import MarkerGenerator from "../components/UI/MarkerGenerator";
import { useMarkerImage } from "../hooks/useMarkerImage";
import { setPickedMapLocation } from "../store/picked-location-store";
import { fetchPlaceDetails } from "../util/database";

const MAPBOX_ACCESS_TOKEN: string | null = Config.MAPBOX_ACCESS_TOKEN ?? null;

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

const DEFAULT_CENTER: [number, number] = [-122.4324, 37.78825];

export default function Map() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, "Map">>();
  const route = useRoute<RouteProp<RootStackParamList, "Map">>();
  const { lat, lng, placeId } = route.params ?? {};

  const initialLocation = lat && lng ? { lat: +lat, lng: +lng } : undefined;

  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [markerCaptureFailed, setMarkerCaptureFailed] = useState(false);
  const [isMapMounted, setIsMapMounted] = useState(Platform.OS !== "android");
  const mountDelayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!placeId) return;

    fetchPlaceDetails(placeId)
      .then((place) => {
        if (!place?.imageUri) return;
        setImageUri(place.imageUri);
      })
      .catch(console.log);
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
      Alert.alert("No location picked!");
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
      if (Platform.OS !== "android") {
        return () => {};
      }

      setIsMapMounted(false);

      mountDelayTimerRef.current = setTimeout(() => {
        setIsMapMounted(true);
      }, 350);

      return () => {
        if (mountDelayTimerRef.current) {
          clearTimeout(mountDelayTimerRef.current);
          mountDelayTimerRef.current = null;
        }

        setIsMapMounted(false);
      };
    }, []),
  );

  useEffect(() => {
    navigation.setOptions({
      title: "Map",
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
  }, [navigation, selectedLocation, initialLocation, savePickedLocationHandler]);

  return (
    <>
      {shouldGenerate && imageUri && (
        <MarkerGenerator
          key={placeId ?? "marker-generator"}
          imageUri={imageUri}
          onGenerated={markerGeneratedHandler}
          onFailed={markerGenerationFailedHandler}
        />
      )}

      {isMapMounted ? (
        <Mapbox.MapView
          style={styles.map}
          styleURL={Mapbox.StyleURL.Street}
          surfaceView={false}
          onPress={selectLocationHandler}
        >
          <Mapbox.Camera
            defaultSettings={{
              centerCoordinate: initialCoordinate,
              zoomLevel: 14,
            }}
          />

          {shouldRenderMarker && markerImage && selectedCoordinate && (
            <Mapbox.MarkerView
              coordinate={selectedCoordinate}
              anchor={{ x: 0.5, y: 1 }}
              allowOverlap
            >
              <Image source={{ uri: markerImage }} style={styles.markerImage} />
            </Mapbox.MarkerView>
          )}

          {shouldRenderMarker && !markerImage && selectedCoordinate && (
            <Mapbox.MarkerView
              id="selected-location-fallback"
              coordinate={selectedCoordinate}
              anchor={{ x: 0.5, y: 1 }}
              allowOverlap
            >
              <View style={styles.fallbackMarkerContainer}>
                <View style={styles.fallbackMarkerHead}>
                  <View style={styles.fallbackMarkerCenter} />
                </View>
                <View style={styles.fallbackMarkerTip} />
              </View>
            </Mapbox.MarkerView>
          )}
        </Mapbox.MapView>
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#dff3fb",
  },

  markerImage: {
    width: 84,
    height: 96,
    resizeMode: "contain",
  },

  fallbackMarkerContainer: {
    alignItems: "center",
  },

  fallbackMarkerHead: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#E53935",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },

  fallbackMarkerCenter: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },

  fallbackMarkerTip: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#E53935",
    marginTop: -2,
  },
});
