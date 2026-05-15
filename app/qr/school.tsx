import { useEffect } from "react";

import { replaceWithSabiQrFunction } from "../../src/modules/qr/runtime/qrEntryRoutes";

export default function SabiQrSchoolEntryScreen() {
  useEffect(() => {
    replaceWithSabiQrFunction("school_check_in");
  }, []);

  return null;
}
