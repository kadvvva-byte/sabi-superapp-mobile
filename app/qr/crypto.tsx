import { useEffect } from "react";

import { replaceWithSabiQrFunction } from "../../src/modules/qr/runtime/qrEntryRoutes";

export default function SabiQrCryptoEntryScreen() {
  useEffect(() => {
    replaceWithSabiQrFunction("crypto_wallet_receive");
  }, []);

  return null;
}
