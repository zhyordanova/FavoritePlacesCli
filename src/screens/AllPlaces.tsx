import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

import PlacesList from '../components/places/PlacesList';
import ScreenErrorState from '../components/ui/ScreenErrorState';
import ScreenLoadingState from '../components/ui/ScreenLoadingState';
import { useAsyncResource } from '../hooks/useAsyncResource';
import { fetchPlaces } from '../util/database';

export default function AllPlaces() {
  const {
    data: loadedPlaces,
    isLoading,
    errorMessage,
    reload: loadPlaces,
  } = useAsyncResource(fetchPlaces, {
    initialData: [],
    errorMessage: 'Could not load places. Please try again.',
  });

  useFocusEffect(
    useCallback(() => {
      loadPlaces();
    }, [loadPlaces]),
  );

  if (isLoading) {
    return <ScreenLoadingState />;
  }

  if (errorMessage) {
    return <ScreenErrorState message={errorMessage} onRetry={loadPlaces} />;
  }

  return <PlacesList places={loadedPlaces} />;
}
