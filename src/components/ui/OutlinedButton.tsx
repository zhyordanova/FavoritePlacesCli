import Ionicons from 'react-native-vector-icons/Ionicons';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

interface OutlinedButtonProps {
  onPress: () => void;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  children: React.ReactNode;
  disabled?: boolean;
  showSpinnerWhenDisabled?: boolean;
}

export default function OutlinedButton({
  onPress,
  icon,
  children,
  disabled,
  showSpinnerWhenDisabled = true,
}: OutlinedButtonProps) {
  const shouldShowSpinner = !!disabled && showSpinnerWhenDisabled;

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
      {shouldShowSpinner ? (
        <ActivityIndicator size={18} color={Colors.primary500} />
      ) : (
        <Ionicons
          style={styles.icon}
          name={icon}
          size={18}
          color={Colors.primary500}
        />
      )}

      <Text style={[styles.buttonText, disabled && styles.disabledText]}>
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginVertical: Spacing.lg,
    marginHorizontal: Spacing.xxl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary500,
  },

  pressed: {
    opacity: 0.7,
  },

  disabled: {
    opacity: 0.6,
    borderColor: Colors.primary200,
  },

  disabledText: {
    color: Colors.primary200,
  },

  icon: {
    marginRight: Spacing.sm,
  },

  buttonText: {
    color: Colors.primary500,
  },
});
