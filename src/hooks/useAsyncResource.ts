import { useCallback, useRef, useState } from 'react';

type AsyncLoader<T> = () => Promise<T>;

type UseAsyncResourceOptions<T> = {
  initialData: T;
  errorMessage: string;
  clearDataOnError?: boolean;
};

export function useAsyncResource<T>(
  loader: AsyncLoader<T>,
  options: UseAsyncResourceOptions<T>,
) {
  const { initialData, errorMessage, clearDataOnError = false } = options;
  const initialDataRef = useRef(initialData);

  const [data, setData] = useState<T>(initialDataRef.current);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await loader();
      setData(result);
      return result;
    } catch {
      if (clearDataOnError) {
        setData(initialDataRef.current);
      }

      setError(errorMessage);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [clearDataOnError, errorMessage, loader]);

  return {
    data,
    setData,
    isLoading,
    errorMessage: error,
    reload,
  };
}
