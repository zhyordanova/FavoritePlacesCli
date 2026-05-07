import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";

import PlacesList from "../components/Places/PlacesList";
import { Colors } from "../constants/colors";
import { fetchPlaces } from "../util/database";
import { Place } from "../models/place";

export default function AllPlaces() {
  const [loadedPlaces, setLoadedPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  useFocusEffect(
    useCallback(() => {
      async function loadPlaces() {
        setIsLoading(true);
        setError(false);
        try {
          const places = await fetchPlaces();
          setLoadedPlaces(places);
          
        } catch {
          setError(true);
          
          Alert.alert(
            "Error",
            "Could not load places. Please restart the app.",
          );

        } finally {
          setIsLoading(false);
        }
      }

      loadPlaces();
    }, []),
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary500} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load places.</Text>
      </View>
    );
  }

  return <PlacesList places={loadedPlaces} />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  errorText: {
    color: Colors.primary500,
    fontSize: 16,
  },
});
