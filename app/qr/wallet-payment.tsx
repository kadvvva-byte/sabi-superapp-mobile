import { useEffect } from "react";

import { replaceWithSabiQrFunction } from "../../src/modules/qr/runtime/qrEntryRoutes";

export default function SabiQrWalletPaymentEntryScreen() {
  useEffect(() => {
    replaceWithSabiQrFunction("wallet_user_payment");
  }, []);

  return null;
}
