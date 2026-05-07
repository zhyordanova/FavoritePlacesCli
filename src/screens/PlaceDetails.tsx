import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";

import { RootStackParamList } from "../types/navigation";

import OutlinedButton from "../components/UI/OutlinedButton";
import { Colors } from "../constants/colors";
import { fetchPlaceDetails } from "../util/database";
import { Place } from "../models/place";

export default function PlaceDetails() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, "PlaceDetails">>();
  const route = useRoute<RouteProp<RootStackParamList, "PlaceDetails">>();
  const { placeId } = route.params;
  const [fetchedPlace, setFetchedPlace] = useState<Place | undefined>();

  function showOnMapHandler() {
    if (!fetchedPlace) return;

    navigation.navigate("Map", {
      lat: fetchedPlace.location.lat.toString(),
      lng: fetchedPlace.location.lng.toString(),
      placeId,
    });
  }

  useEffect(() => {
    async function loadPlaceData() {
      try {
        const place = await fetchPlaceDetails(placeId);
        setFetchedPlace(place);
      } catch {
        Alert.alert("Error", "Could not load place details. Please try again.");
      }
    }

    loadPlaceData();
  }, [placeId]);

  useEffect(() => {
    navigation.setOptions({
      title: fetchedPlace ? fetchedPlace.title : "Loading Place",
    });
  }, [navigation, fetchedPlace]);

  if (!fetchedPlace) {
    return (
      <View>
        <Text>Loading place data...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView>
        <Image style={styles.image} source={{ uri: fetchedPlace?.imageUri }} />

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
    height: "35%",
    minHeight: 300,
    width: "100%",
  },

  locationContainer: {
    justifyContent: "center",
    alignItems: "center",
  },

  addressContainer: {
    padding: 20,
  },

  address: {
    color: Colors.primary500,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});
