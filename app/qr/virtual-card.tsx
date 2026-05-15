import { useEffect } from "react";

import { replaceWithSabiQrFunction } from "../../src/modules/qr/runtime/qrEntryRoutes";

export default function SabiQrVirtualCardEntryScreen() {
  useEffect(() => {
    replaceWithSabiQrFunction("virtual_card_issuance");
  }, []);

  return null;
}
