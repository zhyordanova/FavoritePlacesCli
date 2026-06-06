import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { Coordinates } from '../types';

type PickedLocationContextValue = {
  setPickedMapLocation: (location: Coordinates) => void;
  consumePickedMapLocation: () => Coordinates | undefined;
};

const PickedLocationContext = createContext<PickedLocationContextValue | null>(
  null,
);

type PickedLocationProviderProps = {
  children: React.ReactNode;
};

export function PickedLocationProvider({
  children,
}: PickedLocationProviderProps) {
  const [pickedMapLocation, setPickedMapLocationState] = useState<
    Coordinates | undefined
  >();

  const setPickedMapLocation = useCallback((location: Coordinates): void => {
    setPickedMapLocationState(location);
  }, []);

  const consumePickedMapLocation = useCallback((): Coordinates | undefined => {
    if (!pickedMapLocation) {
      return undefined;
    }

    setPickedMapLocationState(undefined);
    return pickedMapLocation;
  }, [pickedMapLocation]);

  const value = useMemo(
    () => ({
      setPickedMapLocation,
      consumePickedMapLocation,
    }),
    [setPickedMapLocation, consumePickedMapLocation],
  );

  return (
    <PickedLocationContext.Provider value={value}>
      {children}
    </PickedLocationContext.Provider>
  );
}

export function usePickedLocationContext(): PickedLocationContextValue {
  const context = useContext(PickedLocationContext);

  if (!context) {
    throw new Error(
      'usePickedLocationContext must be used within PickedLocationProvider',
    );
  }

  return context;
}
