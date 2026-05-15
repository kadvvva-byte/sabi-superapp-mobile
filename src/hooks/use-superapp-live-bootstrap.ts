import { useEffect, useRef } from "react";

export type SuperappLiveBootstrapCallback = () =>
  | void
  | (() => void)
  | Promise<void | (() => void)>;

type UseSuperappLiveBootstrapOptions = {
  enabled?: boolean;
  onBootstrap?: SuperappLiveBootstrapCallback;
  onError?: (error: unknown) => void;
};

/**
 * Safe one-time bootstrap hook for app-level live/runtime initialization.
 * Use it from a root provider or app/_layout.tsx.
 *
 * Example:
 * useSuperappLiveBootstrap({
 *   onBootstrap: async () => {
 *     // your startup wiring here
 *   },
 * });
 */
export function useSuperappLiveBootstrap(
  options: UseSuperappLiveBootstrapOptions = {},
) {
  const { enabled = true, onBootstrap, onError } = options;
  const startedRef = useRef(false);

  useEffect(() => {
    if (!enabled || startedRef.current) return;

    startedRef.current = true;
    let mounted = true;
    let cleanupFn: void | (() => void);

    const run = async () => {
      try {
        cleanupFn = await onBootstrap?.();
      } catch (error) {
        if (mounted) {
          onError?.(error);
        }
      }
    };

    void run();

    return () => {
      mounted = false;
      if (typeof cleanupFn === "function") {
        cleanupFn();
      }
      startedRef.current = false;
    };
  }, [enabled, onBootstrap, onError]);
}

export default useSuperappLiveBootstrap;