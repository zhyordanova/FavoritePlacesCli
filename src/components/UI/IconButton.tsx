import Ionicons from 'react-native-vector-icons/Ionicons';
import { Pressable, StyleSheet } from 'react-native';

interface IconButtonProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  size: number;
  color: string | undefined;
  onClick: () => void;
}

export default function IconButton({
  icon,
  size,
  color,
  onClick,
}: IconButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      onPress={onClick}
    >
      <Ionicons name={icon} size={size} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    margin: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },

  pressed: {
    opacity: 0.7,
  },
});
