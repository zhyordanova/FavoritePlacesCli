import { useEffect, useState } from "react";

type Params = {
  imageUri?: string;
  enabled: boolean;
};

export function useMarkerImage({ imageUri, enabled }: Params) {
  const [markerImage, setMarkerImage] = useState<string | null>(null);

  useEffect(() => {
    setMarkerImage(null);
  }, [imageUri]);

  return {
    markerImage,
    setMarkerImage,
    shouldGenerate: enabled && !!imageUri && !markerImage,
  };
}
