import { useEffect } from "react";

import { replaceWithSabiQrFunction } from "../../src/modules/qr/runtime/qrEntryRoutes";

export default function SabiQrSchoolOutEntryScreen() {
  useEffect(() => {
    replaceWithSabiQrFunction("school_check_out");
  }, []);

  return null;
}
