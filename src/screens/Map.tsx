import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet } from "react-native";
import MapView, { MapPressEvent, Marker } from "react-native-maps";

import { RootStackParamList } from "../types/navigation";

import IconButton from "../components/UI/IconButton";
import MarkerGenerator from "../components/UI/MarkerGenerator";
import { useMarkerImage } from "../hooks/useMarkerImage";
import { setPickedMapLocation } from "../store/picked-location-store";
import { fetchPlaceDetails } from "../util/database";

export default function Map() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, "Map">>();
  const route = useRoute<RouteProp<RootStackParamList, "Map">>();
  const { lat, lng, placeId } = route.params ?? {};

  const initialLocation = lat && lng ? { lat: +lat, lng: +lng } : undefined;

  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [markerCaptureFailed, setMarkerCaptureFailed] = useState(false);

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

  const region = {
    latitude: initialLocation ? initialLocation.lat : 37.78825,
    longitude: initialLocation ? initialLocation.lng : -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  function selectLocationHandler(event: MapPressEvent) {
    if (initialLocation) return;

    const { latitude, longitude } = event.nativeEvent.coordinate;
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

      <MapView
        style={styles.map}
        initialRegion={region}
        onPress={selectLocationHandler}
      >
        {selectedLocation &&
          (!placeId || markerImage || markerCaptureFailed) && (
            <Marker
              key={markerImage ?? "default"}
              coordinate={{
                latitude: selectedLocation.lat,
                longitude: selectedLocation.lng,
              }}
              title={!placeId ? "Picked Location" : undefined}
              image={markerImage ? { uri: markerImage } : undefined}
            />
          )}
      </MapView>
    </>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});
