import { useMemo } from "react";

export function useSuperAppLiveBootstrap(params: {
  userId?: string;
  walletId?: string;
  enabled?: boolean;
  authReady?: boolean;
  profileReady?: boolean;
  onAuthRefresh?: () => Promise<void> | void;
  onUserRefresh?: () => Promise<void> | void;
  onNotificationRefresh?: () => Promise<void> | void;
  onWalletRefresh?: () => Promise<void> | void;
}) {
  const realtimeEnabled = useMemo(
    () =>
      Boolean(
        params.enabled !== false &&
          params.authReady !== false &&
          params.profileReady !== false &&
          params.userId?.trim(),
      ),
    [params.authReady, params.enabled, params.profileReady, params.userId],
  );

  return {
    realtimeEnabled,
    authReady: params.authReady !== false,
    profileReady: params.profileReady !== false,
    liveBootstrapReady: realtimeEnabled,
  };
}