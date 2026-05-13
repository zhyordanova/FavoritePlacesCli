import { Image, StyleSheet, View } from "react-native";
import Mapbox from "@rnmapbox/maps";

interface LocationMarkerProps {
  coordinate: [number, number];
  imageUri?: string;
}

export default function LocationMarker({
  coordinate,
  imageUri,
}: LocationMarkerProps) {
  return (
    <Mapbox.MarkerView
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 1 }}
      allowOverlap
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.markerImage} />
      ) : (
        <View style={styles.fallbackMarkerContainer}>
          <View style={styles.fallbackMarkerHead}>
            <View style={styles.fallbackMarkerCenter} />
          </View>
          <View style={styles.fallbackMarkerTip} />
        </View>
      )}
    </Mapbox.MarkerView>
  );
}

const styles = StyleSheet.create({
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
