import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { init } from './src/util/database';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BootSplash from 'react-native-bootsplash';

import AllPlaces from './src/screens/AllPlaces';
import AddPlace from './src/screens/AddPlace';
import Map from './src/screens/Map';
import PlaceDetails from './src/screens/PlaceDetails';
import IconButton from './src/components/ui/IconButton';
import { Colors } from './src/constants/colors';
import { PickedLocationProvider } from './src/store/picked-location-context';
import { RootStackParamList } from './src/types/navigation';
import { initializeMapbox } from './src/util/mapbox';

const Stack = createNativeStackNavigator<RootStackParamList>();

const stackScreenOptions = {
  headerStyle: { backgroundColor: Colors.primary500 },
  headerTintColor: Colors.gray700,
  contentStyle: { backgroundColor: Colors.primary50 },
};

function renderAddPlaceHeaderButton(
  tintColor: string | undefined,
  onPress: () => void,
) {
  return (
    <IconButton
      icon="add-outline"
      size={24}
      color={tintColor}
      onPress={onPress}
    />
  );
}

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapApp() {
      try {
        initializeMapbox();
        await Promise.all([Ionicons.loadFont(), init()]);

        if (!isMounted) {
          return;
        }

        setIsAppReady(true);
        await BootSplash.hide({ fade: true });
      } catch {
        if (!isMounted) {
          return;
        }

        setBootstrapError('Failed to initialize the app. Please restart it.');
        await BootSplash.hide({ fade: true });
      }
    }

    bootstrapApp();

    return () => {
      isMounted = false;
    };
  }, []);

  if (bootstrapError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>App failed to start</Text>
        <Text style={styles.errorText}>{bootstrapError}</Text>
      </View>
    );
  }

  if (!isAppReady) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary500} />
      </View>
    );
  }

  return (
    <>
      <StatusBar />
      <PickedLocationProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={stackScreenOptions}>
            <Stack.Screen
              name="AllPlaces"
              component={AllPlaces}
              options={({ navigation }) => ({
                title: 'All Places',
                headerRight: ({ tintColor }) =>
                  renderAddPlaceHeaderButton(tintColor, () =>
                    navigation.navigate('AddPlace'),
                  ),
              })}
            />
            <Stack.Screen
              name="AddPlace"
              component={AddPlace}
              options={{ title: 'Add a new place' }}
            />
            <Stack.Screen
              name="Map"
              component={Map}
              options={{ title: 'Map' }}
            />
            <Stack.Screen
              name="PlaceDetails"
              component={PlaceDetails}
              options={{ title: 'Loading Place' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PickedLocationProvider>
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary50,
    paddingHorizontal: 24,
  },

  errorTitle: {
    color: Colors.primary500,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },

  errorText: {
    color: Colors.gray700,
    fontSize: 16,
    textAlign: 'center',
  },
});
