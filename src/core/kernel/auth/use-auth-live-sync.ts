import { useCallback, useState } from "react";
import { useAuthRealtime } from "../../../shared/realtime/use-auth-realtime";

export function useAuthLiveSync(params: {
  userId?: string;
  enabled?: boolean;
  onRefresh?: () => Promise<void> | void;
}) {
  const [authSyncTick, setAuthSyncTick] = useState(0);

  const refresh = useCallback(async () => {
    setAuthSyncTick((value) => value + 1);
    await params.onRefresh?.();
  }, [params]);

  useAuthRealtime({
    userId: params.userId,
    enabled: params.enabled,
    onRefresh: refresh,
  });

  return {
    authSyncTick,
    refreshAuthRealtime: refresh,
  };
}