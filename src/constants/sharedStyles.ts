import { StyleSheet } from 'react-native';

import { Colors } from './colors';
import { Spacing } from './spacing';

export const sharedPickerStyles = StyleSheet.create({
  preview: {
    height: 200,
    marginVertical: Spacing.lg,
    marginHorizontal: Spacing.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: Colors.primary100,
    borderColor: Colors.primary500,
    borderWidth: 2,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  statusText: {
    marginTop: Spacing.md,
    color: Colors.primary700,
    fontWeight: '500',
  },
});
