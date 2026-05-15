import { useEffect } from "react";

import { replaceWithSabiQrFunction } from "../../src/modules/qr/runtime/qrEntryRoutes";

export default function SabiQrCoinTransferEntryScreen() {
  useEffect(() => {
    replaceWithSabiQrFunction("coin_wallet_transfer");
  }, []);

  return null;
}
