import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

export default function ScreenLoadingState() {
  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={Colors.primary500} />
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
});
