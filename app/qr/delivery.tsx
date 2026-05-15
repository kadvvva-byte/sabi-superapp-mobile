import { useEffect } from "react";

import { replaceWithSabiQrFunction } from "../../src/modules/qr/runtime/qrEntryRoutes";

export default function SabiQrDeliveryEntryScreen() {
  useEffect(() => {
    replaceWithSabiQrFunction("delivery_order");
  }, []);

  return null;
}
