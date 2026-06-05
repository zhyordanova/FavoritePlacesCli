import { useCallback, useEffect } from 'react';

import { Place } from '../models/place';
import { fetchPlaceDetails } from '../util/database';
import { useAsyncResource } from './useAsyncResource';

type UsePlaceDetailsOptions = {
  autoLoad?: boolean;
};

const placeDetailsCache = new Map<string, Place>();

export function clearPlaceDetailsCache(placeId?: string): void {
  if (placeId) {
    placeDetailsCache.delete(placeId);
    return;
  }

  placeDetailsCache.clear();
}

export function usePlaceDetails(
  placeId: string | undefined,
  options: UsePlaceDetailsOptions = {},
) {
  const { autoLoad = true } = options;

  const loader = useCallback(async () => {
    if (!placeId) {
      return undefined;
    }

    const cachedPlace = placeDetailsCache.get(placeId);
    if (cachedPlace) {
      return cachedPlace;
    }

    const place = await fetchPlaceDetails(placeId);
    placeDetailsCache.set(placeId, place);
    return place;
  }, [placeId]);

  const asyncState = useAsyncResource<Place | undefined>(loader, {
    initialData: undefined,
    errorMessage: 'Could not load place details. Please try again.',
    clearDataOnError: true,
  });
  const { reload } = asyncState;

  useEffect(() => {
    if (!autoLoad || !placeId) {
      return;
    }

    reload();
  }, [autoLoad, placeId, reload]);

  return {
    ...asyncState,
    place: asyncState.data,
  };
}
