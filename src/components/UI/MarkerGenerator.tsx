import { useCallback, useEffect, useRef } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import ViewShot, { type ViewShotRef } from 'react-native-view-shot';

import { Colors } from '../../constants/colors';

type Props = {
  imageUri: string;
  onGenerated: (uri: string) => void;
  onFailed?: () => void;
};

export default function MarkerGenerator({
  imageUri,
  onGenerated,
  onFailed,
}: Props) {
  const ref = useRef<ViewShotRef>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleImageLoaded = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      if (!ref.current) return;

      try {
        const uri = await ref.current.capture();
        if (uri) {
          onGenerated(uri);
          return;
        }

        onFailed?.();
      } catch {
        onFailed?.();
      }
    }, 150);
  }, [onFailed, onGenerated]);

  return (
    <View style={styles.hidden}>
      <ViewShot ref={ref} options={{ format: 'png', quality: 1 }}>
        <View style={styles.wrapper}>
          <View style={styles.shadow}>
            <View style={styles.circle}>
              <Image
                source={{ uri: imageUri }}
                style={styles.image}
                onLoadEnd={handleImageLoaded}
              />
            </View>
          </View>
          <View style={styles.tip} />
        </View>
      </ViewShot>
    </View>
  );
}

const styles = StyleSheet.create({
  hidden: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: -1,
  },

  wrapper: {
    alignItems: 'center',
  },

  shadow: {
    shadowColor: '#000',
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
    borderRadius: 40,
  },

  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: Colors.primary200,
    backgroundColor: '#eee',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  tip: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.primary200,
    marginTop: -2,
  },
});
