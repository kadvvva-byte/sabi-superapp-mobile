import { useEffect } from "react";

import { replaceWithSabiQrFunction } from "../../src/modules/qr/runtime/qrEntryRoutes";

export default function SabiQrTaxiEntryScreen() {
  useEffect(() => {
    replaceWithSabiQrFunction("taxi_trip_payment");
  }, []);

  return null;
}
