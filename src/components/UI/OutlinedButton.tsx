import Ionicons from 'react-native-vector-icons/Ionicons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Colors } from '../../constants/colors';

interface OutlinedButtonProps {
  onPress: () => void;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  children: React.ReactNode;
}

export default function OutlinedButton({
  onPress,
  icon,
  children,
}: OutlinedButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Ionicons
        style={styles.icon}
        name={icon}
        size={18}
        color={Colors.primary500}
      />

      <Text style={styles.buttonText}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginVertical: 12,
    marginHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary500,
  },

  pressed: {
    opacity: 0.7,
  },

  icon: {
    marginRight: 6,
  },

  buttonText: {
    color: Colors.primary500,
  },
});
