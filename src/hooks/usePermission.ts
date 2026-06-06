import { useCallback, useState } from 'react';
import { type Rationale } from 'react-native';

import {
  ensureCameraPermission,
  ensureLocationPermission,
  openAppSettings,
} from '../util/permissions';

export type PermissionResource = 'camera' | 'location';
export type PermissionStatus = 'unknown' | 'granted' | 'denied';

type UsePermissionOptions = {
  resource: PermissionResource;
  settingsMessage: string;
  cameraRationale?: Rationale;
};

export function usePermission({
  resource,
  settingsMessage,
  cameraRationale,
}: UsePermissionOptions) {
  const [status, setStatus] = useState<PermissionStatus>('unknown');
  const [isRequesting, setIsRequesting] = useState(false);

  const request = useCallback(async (): Promise<PermissionStatus> => {
    setIsRequesting(true);

    try {
      const granted =
        resource === 'camera'
          ? await ensureCameraPermission(settingsMessage, cameraRationale)
          : await ensureLocationPermission(settingsMessage);

      const nextStatus: PermissionStatus = granted ? 'granted' : 'denied';
      setStatus(nextStatus);
      return nextStatus;
    } finally {
      setIsRequesting(false);
    }
  }, [cameraRationale, resource, settingsMessage]);

  return {
    status,
    isRequesting,
    canProceed: status === 'granted',
    request,
    openSettings: openAppSettings,
  };
}
