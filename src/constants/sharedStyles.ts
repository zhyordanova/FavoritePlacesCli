import { StyleSheet } from 'react-native';

import { Colors } from './colors';

export const sharedPickerStyles = StyleSheet.create({
  preview: {
    height: 200,
    marginVertical: 12,
    marginHorizontal: 24,
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
});
