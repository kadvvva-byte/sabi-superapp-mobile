import { useEffect } from "react";

import { replaceWithSabiQrFunction } from "../../src/modules/qr/runtime/qrEntryRoutes";

export default function SabiQrMerchantEntryScreen() {
  useEffect(() => {
    replaceWithSabiQrFunction("merchant_static_entry");
  }, []);

  return null;
}
