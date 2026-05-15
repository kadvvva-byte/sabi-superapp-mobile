import { router } from "expo-router";
import { useEffect } from "react";

export default function AiMobileSettingsScreen() {
  useEffect(() => {
    router.replace("/profile/ai" as never);
  }, []);

  return null;
}