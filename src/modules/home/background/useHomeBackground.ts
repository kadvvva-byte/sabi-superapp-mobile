import { useCallback, useEffect, useState } from "react";
import {
  loadHomeBackground,
  pickHomeBackgroundImage,
  resetHomeBackground,
} from "./background.service";
import { HomeBackgroundState } from "./background.types";

const DEFAULT_STATE: HomeBackgroundState = {
  type: "default",
  uri: null,
};

export function useHomeBackground() {
  const [background, setBackground] = useState<HomeBackgroundState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await loadHomeBackground();
      setBackground(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const pickImage = useCallback(async () => {
    const data = await pickHomeBackgroundImage();
    if (data) {
      setBackground(data);
    }
    return data;
  }, []);

  const reset = useCallback(async () => {
    const data = await resetHomeBackground();
    setBackground(data);
    return data;
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    background,
    loading,
    refresh,
    pickImage,
    reset,
  };
}
