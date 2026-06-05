import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import OutlinedButton from './OutlinedButton';

type ScreenErrorStateProps = {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export default function ScreenErrorState({
  message,
  onRetry,
  retryLabel = 'Retry',
}: ScreenErrorStateProps) {
  return (
    <View style={styles.centered}>
      <Text style={styles.errorText}>{message}</Text>
      {onRetry ? (
        <OutlinedButton icon="refresh-outline" onPress={onRetry}>
          {retryLabel}
        </OutlinedButton>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
  },

  errorText: {
    color: Colors.primary500,
    fontSize: 16,
    textAlign: 'center',
  },
});
