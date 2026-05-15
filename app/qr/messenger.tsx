import { useEffect } from "react";

import { replaceWithSabiQrFunction } from "../../src/modules/qr/runtime/qrEntryRoutes";

export default function SabiQrMessengerEntryScreen() {
  useEffect(() => {
    replaceWithSabiQrFunction("messenger_profile");
  }, []);

  return null;
}
