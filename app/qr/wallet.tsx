import { useEffect } from "react";

import { replaceWithSabiQrFunction } from "../../src/modules/qr/runtime/qrEntryRoutes";

export default function SabiQrWalletEntryScreen() {
  useEffect(() => {
    replaceWithSabiQrFunction("wallet_receive");
  }, []);

  return null;
}
