import { useCallback, useEffect, useState } from "react";

import { aiMobileApi } from "./aiMobileApi";
import type { AiMobileSnapshot } from "./aiMobileTypes";

type AiMobileSnapshotState = {
  snapshot: AiMobileSnapshot | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useAiMobileSnapshot(): AiMobileSnapshotState {
  const [snapshot, setSnapshot] = useState<AiMobileSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextSnapshot = await aiMobileApi.getSnapshot();
      setSnapshot(nextSnapshot);

      if (nextSnapshot.status === "error") {
        setError(nextSnapshot.statusText);
      }
    } catch (refreshError) {
      const message =
        refreshError instanceof Error
          ? refreshError.message
          : String(refreshError ?? "AI snapshot error");
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;

    setIsLoading(true);
    setError(null);

    aiMobileApi
      .getSnapshot()
      .then((nextSnapshot) => {
        if (!alive) return;
        setSnapshot(nextSnapshot);
        if (nextSnapshot.status === "error") {
          setError(nextSnapshot.statusText);
        }
      })
      .catch((snapshotError) => {
        if (!alive) return;
        setError(
          snapshotError instanceof Error
            ? snapshotError.message
            : String(snapshotError ?? "AI snapshot error"),
        );
      })
      .finally(() => {
        if (alive) {
          setIsLoading(false);
        }
      });

    return () => {
      alive = false;
    };
  }, []);

  return { snapshot, isLoading, error, refresh };
}
