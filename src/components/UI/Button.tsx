import { Pressable, StyleSheet, Text } from 'react-native';

import { Colors } from '../../constants/colors';

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
}

export default function Button({ children, onPress, disabled }: ButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
    marginHorizontal: 24,
    backgroundColor: Colors.primary800,
    borderRadius: 4,
    elevation: 2,
    shadowColor: 'black',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },

  pressed: {
    opacity: 0.7,
  },

  disabled: {
    opacity: 0.4,
  },

  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    color: Colors.primary50,
  },
});
