import { useEffect } from "react";

import { replaceWithSabiQrFunction } from "../../src/modules/qr/runtime/qrEntryRoutes";

export default function SabiQrMerchantOrderEntryScreen() {
  useEffect(() => {
    replaceWithSabiQrFunction("merchant_dynamic_order");
  }, []);

  return null;
}
