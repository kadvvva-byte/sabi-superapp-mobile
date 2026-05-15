import { useEffect } from "react";

import { replaceWithSabiQrFunction } from "../../src/modules/qr/runtime/qrEntryRoutes";

export default function SabiQrMarketplaceEntryScreen() {
  useEffect(() => {
    replaceWithSabiQrFunction("marketplace_order");
  }, []);

  return null;
}
