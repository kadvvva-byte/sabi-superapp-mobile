import { useEffect } from "react";

import { replaceWithSabiQrFunction } from "../../src/modules/qr/runtime/qrEntryRoutes";

export default function SabiQrWorkOutEntryScreen() {
  useEffect(() => {
    replaceWithSabiQrFunction("work_check_out");
  }, []);

  return null;
}
