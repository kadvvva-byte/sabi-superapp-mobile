import { useEffect } from "react";

import { replaceWithSabiQrFunction } from "../../src/modules/qr/runtime/qrEntryRoutes";

export default function SabiQrWorkEntryScreen() {
  useEffect(() => {
    replaceWithSabiQrFunction("work_check_in");
  }, []);

  return null;
}
