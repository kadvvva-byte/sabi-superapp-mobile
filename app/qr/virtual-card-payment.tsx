import { useEffect } from "react";

import { replaceWithSabiQrFunction } from "../../src/modules/qr/runtime/qrEntryRoutes";

export default function SabiQrVirtualCardPaymentEntryScreen() {
  useEffect(() => {
    replaceWithSabiQrFunction("virtual_card_payment");
  }, []);

  return null;
}
