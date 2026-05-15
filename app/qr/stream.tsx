import { useEffect } from "react";

import { replaceWithSabiQrFunction } from "../../src/modules/qr/runtime/qrEntryRoutes";

export default function SabiQrStreamEntryScreen() {
  useEffect(() => {
    replaceWithSabiQrFunction("stream_donation");
  }, []);

  return null;
}
