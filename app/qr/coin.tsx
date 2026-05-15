import { useEffect } from "react";

import { replaceWithSabiQrFunction } from "../../src/modules/qr/runtime/qrEntryRoutes";

export default function SabiQrCoinEntryScreen() {
  useEffect(() => {
    replaceWithSabiQrFunction("coin_wallet_receive");
  }, []);

  return null;
}
