import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { init } from './src/util/database';
import Ionicons from 'react-native-vector-icons/Ionicons';

import AllPlaces from './src/screens/AllPlaces';
import AddPlace from './src/screens/AddPlace';
import Map from './src/screens/Map';
import PlaceDetails from './src/screens/PlaceDetails';
import IconButton from './src/components/UI/IconButton';
import { Colors } from './src/constants/colors';
import { RootStackParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

const stackScreenOptions = {
  headerStyle: { backgroundColor: Colors.primary500 },
  headerTintColor: Colors.gray700,
  contentStyle: { backgroundColor: Colors.primary50 },
};

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    Promise.all([Ionicons.loadFont(), init()]).then(() =>
      setDbInitialized(true),
    );
  }, []);

  if (!dbInitialized) return null;

  return (
    <>
      <StatusBar />
      <NavigationContainer>
        <Stack.Navigator screenOptions={stackScreenOptions}>
          <Stack.Screen
            name="AllPlaces"
            component={AllPlaces}
            options={({ navigation }) => ({
              title: 'All Places',
              headerRight: ({ tintColor }) => (
                <IconButton
                  icon="add-outline"
                  size={24}
                  color={tintColor}
                  onClick={() => navigation.navigate('AddPlace')}
                />
              ),
            })}
          />
          <Stack.Screen
            name="AddPlace"
            component={AddPlace}
            options={{ title: 'Add a new place' }}
          />
          <Stack.Screen name="Map" component={Map} options={{ title: 'Map' }} />
          <Stack.Screen
            name="PlaceDetails"
            component={PlaceDetails}
            options={{ title: 'Loading Place' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
