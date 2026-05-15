import { useEffect, useState } from "react";

import { buildLocalSabiHomeFoundationManifest } from "./homeFoundationRegistry";
import { fetchSabiHomeFoundationManifest } from "./homeFoundationClient";
import type { SabiHomeFoundationState } from "./homeFoundation.types";

export function useHomeFoundation(): SabiHomeFoundationState {
  const [state, setState] = useState<SabiHomeFoundationState>(() => ({
    manifest: buildLocalSabiHomeFoundationManifest(),
    source: "local_fallback",
  }));

  useEffect(() => {
    let mounted = true;

    fetchSabiHomeFoundationManifest()
      .then((nextState) => {
        if (mounted) setState(nextState);
      })
      .catch(() => {
        if (mounted) {
          setState({
            manifest: buildLocalSabiHomeFoundationManifest(),
            source: "local_fallback",
          });
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return state;
}
