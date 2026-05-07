import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '../../constants/colors';
import { Place } from '../../models/place';

interface PlaceItemProps {
  place: Place;
  onSelect: (id: string) => void;
}

export default function PlaceItem({ place, onSelect }: PlaceItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.item, pressed && styles.pressed]}
      onPress={() => onSelect(place.id)}
    >
      <Image style={styles.image} source={{ uri: place.imageUri }} />

      <View style={styles.infoContainer}>
        <Text style={styles.title}>{place.title}</Text>
        <Text style={styles.address}>{place.address}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 12,
    backgroundColor: Colors.primary500,
    borderRadius: 6,
    elevation: 2,
    shadowColor: 'black',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },

  pressed: {
    opacity: 0.9,
  },

  image: {
    flex: 1,
    height: 100,
    borderBottomLeftRadius: 4,
    borderTopLeftRadius: 4,
  },

  infoContainer: {
    flex: 2,
    padding: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.gray700,
  },

  address: {
    fontSize: 12,
    color: Colors.gray700,
  },
});
