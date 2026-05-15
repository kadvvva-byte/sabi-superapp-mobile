import { useEffect } from "react";

import { replaceWithSabiQrFunction } from "../../src/modules/qr/runtime/qrEntryRoutes";

export default function SabiQrBusinessEntryScreen() {
  useEffect(() => {
    replaceWithSabiQrFunction("business_invoice");
  }, []);

  return null;
}
