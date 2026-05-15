import { useEffect } from "react";

import { replaceWithSabiQrFunction } from "../../src/modules/qr/runtime/qrEntryRoutes";

export default function SabiQrMessengerPaymentEntryScreen() {
  useEffect(() => {
    replaceWithSabiQrFunction("messenger_payment");
  }, []);

  return null;
}
